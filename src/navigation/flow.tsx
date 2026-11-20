/**
 * Flow controller: navigation stack, draft state, validation visibility, simulated OTP and submission.
 * One controller can drive several device previews at once (side-by-side Android + iOS).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Attachment, Category, DemoSettings, Draft, Errors, OtpState, Requirement, Route } from '../data/types';
import { emptyDraft } from '../data/types';
import { categoryById, DEMO_USER, PROFESSIONS, CONTRACTOR_TYPES, RENO_AREAS } from '../data/catalog';
import { clearDraft, loadDraft, loadRequirements, saveDraft, saveRequirements } from '../services/storage';
import { firstInvalidStep, validateStep } from '../services/validation';
import { newIdempotencyKey, RESEND_COOLDOWN_MS, sendOtp, submitRequirement, SubmitError, verifyOtp } from '../services/mockApi';

export type SheetName = null | 'address' | 'permission' | 'upload' | 'contact';
export type DialogName = null | 'exit' | 'cancelReq' | 'sessionExpired' | 'discardDraft';

export interface UiState {
  sheet: SheetName;
  dialog: DialogName;
  snackbar: string | null;
  busy: boolean;
  listLoading: boolean;
}

export interface Flow {
  route: Route;
  stackDepth: number;
  draft: Draft;
  errors: Errors;
  attemptCount: number;
  demo: DemoSettings & { sessionExpired: boolean };
  savedDraft: Draft | null;
  requirements: Requirement[];
  otp: OtpState | null;
  now: number;
  ui: UiState;
  editingFromReview: boolean;
  verifiedPhone: string | null;
  justSaved: boolean;
  // navigation
  go: (r: Route) => void;
  back: () => void;
  home: () => void;
  // draft
  update: (patch: Partial<Draft>) => void;
  touch: (field: string) => void;
  startCategory: (c: Category) => void;
  resumeDraft: () => void;
  discardDraft: () => void;
  next: () => void;
  editStep: (i: number) => void;
  addAttachments: (files: File[] | 'sample') => void;
  removeAttachment: (id: string) => void;
  // ui
  openSheet: (s: SheetName) => void;
  openDialog: (d: DialogName) => void;
  closeOverlays: () => void;
  toast: (t: string) => void;
  // verification & submission
  submit: () => void;
  needsVerification: () => boolean;
  sendCode: (phone: string) => Promise<void>;
  resendCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  skipVerification: () => void;
  retrySubmit: () => void;
  // tracking
  openList: () => void;
  cancelRequirement: (id: string) => void;
  // presenter
  setDemo: (p: Partial<DemoSettings & { sessionExpired: boolean }>) => void;
  resetAll: () => void;
}

export const FlowContext = createContext<Flow | null>(null);
export function useFlow(): Flow {
  const f = useContext(FlowContext);
  if (!f) throw new Error('FlowContext missing');
  return f;
}

export function titleFor(d: Draft): string {
  if (d.category === 'individual') {
    const p = PROFESSIONS.find((x) => x.id === d.profession)?.label ?? 'Professional';
    return d.service && d.service !== 'Other' && d.service !== 'Describe in details' ? `${p} · ${d.service}` : p;
  }
  if (d.category === 'contractor') {
    const c = CONTRACTOR_TYPES.find((x) => x.id === d.contractorType)?.label ?? 'Contractor';
    return d.projectType ? `${d.projectType} · ${c}` : c;
  }
  const areas = d.renoAreas.map((a) => RENO_AREAS.find((r) => r.id === a)?.label).filter(Boolean);
  return areas.length ? `${areas.slice(0, 2).join(' + ')}${areas.length > 2 ? ` +${areas.length - 2}` : ''} renovation` : 'Renovation';
}

const SAMPLE_COLORS = [
  ['#C9B79C', '#8E7A5E'],
  ['#AFC3D6', '#5D7893'],
  ['#D4C4B0', '#A48B6E'],
  ['#BFD0C2', '#6E8C76'],
];
export function sampleImage(i: number): string {
  const [a, b] = SAMPLE_COLORS[i % SAMPLE_COLORS.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='120' height='120' fill='url(#g)'/><rect x='14' y='22' width='40' height='52' fill='#fff' opacity='.35'/><rect x='64' y='40' width='42' height='34' fill='#fff' opacity='.25'/><rect y='86' width='120' height='34' fill='#000' opacity='.12'/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const DEFAULT_UI: UiState = { sheet: null, dialog: null, snackbar: null, busy: false, listLoading: false };

export function useFlowController(): Flow {
  const [stack, setStack] = useState<Route[]>([{ name: 'landing' }]);
  const [demo, setDemoState] = useState<DemoSettings & { sessionExpired: boolean }>({ signedIn: true, offline: false, failNextSubmit: false, sessionExpired: false });
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(DEMO_USER));
  const [savedDraft, setSavedDraft] = useState<Draft | null>(() => loadDraft());
  const [requirements, setRequirements] = useState<Requirement[]>(() => loadRequirements());
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [otp, setOtp] = useState<OtpState | null>(null);
  const [ui, setUi] = useState<UiState>(DEFAULT_UI);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [now, setNow] = useState(Date.now());
  const toastTimer = useRef<number | undefined>();
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const route = stack[stack.length - 1];

  // 1-second clock for OTP countdowns
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const toast = useCallback((t: string) => {
    window.clearTimeout(toastTimer.current);
    setUi((u) => ({ ...u, snackbar: t }));
    toastTimer.current = window.setTimeout(() => setUi((u) => ({ ...u, snackbar: null })), 3200);
  }, []);

  const go = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const home = useCallback(() => {
    setStack([{ name: 'landing' }]);
    setUi(DEFAULT_UI);
  }, []);

  const persist = useCallback((d: Draft) => {
    saveDraft(d);
    setSavedDraft({ ...d, updatedAt: Date.now() });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2500);
  }, []);

  const back = useCallback(() => {
    setUi((u) => ({ ...u, sheet: null, dialog: null }));
    const top = stack[stack.length - 1];
    if (top.name === 'step') {
      if (editingFromReview) setEditingFromReview(false);
      // keep progress on the way back (auto-save)
      const d = draftRef.current;
      if (d.category && !editingFromReview) persist({ ...d, step: Math.max(0, top.index - 1) });
    }
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, [stack, editingFromReview, persist]);

  const stepCount = categoryById(draft.category)?.steps.length ?? 4;

  const currentStepIndex = route.name === 'step' ? route.index : -1;
  const errors: Errors = useMemo(() => {
    if (currentStepIndex < 0) return {};
    const all = validateStep(draft, currentStepIndex);
    if (attempted[currentStepIndex]) return all;
    const visible: Errors = {};
    for (const k of Object.keys(all)) if (touched[k]) visible[k] = all[k];
    return visible;
  }, [draft, currentStepIndex, attempted, touched]);

  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const touch = useCallback((f: string) => setTouched((t) => ({ ...t, [f]: true })), []);

  const startCategory = useCallback(
    (c: Category) => {
      const d = { ...emptyDraft(demo.signedIn ? DEMO_USER : undefined), category: c };
      setDraft(d);
      setAttempted({});
      setTouched({});
      setEditingFromReview(false);
      setStack([{ name: 'landing' }, { name: 'step', index: 0 }]);
    },
    [demo.signedIn],
  );

  const resumeDraft = useCallback(() => {
    if (!savedDraft) return;
    setDraft(savedDraft);
    setAttempted({});
    setTouched({});
    const steps: Route[] = [{ name: 'landing' }];
    for (let i = 0; i <= savedDraft.step; i++) steps.push({ name: 'step', index: i });
    setStack(steps);
  }, [savedDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setSavedDraft(null);
    setUi((u) => ({ ...u, dialog: null }));
    setStack([{ name: 'landing' }]);
    toast('Draft discarded');
  }, [toast]);

  const next = useCallback(() => {
    if (route.name !== 'step') return;
    const i = route.index;
    const errs = validateStep(draft, i);
    if (Object.keys(errs).length) {
      setAttempted((a) => ({ ...a, [i]: true }));
      setAttemptCount((n) => n + 1);
      return;
    }
    const isLastBeforeReview = i + 1 === stepCount - 1;
    const nd: Draft = { ...draft, step: i + 1, idempotencyKey: draft.idempotencyKey ?? (isLastBeforeReview ? newIdempotencyKey() : undefined) };
    setDraft(nd);
    persist(nd);
    if (editingFromReview) {
      setEditingFromReview(false);
      setStack((s) => {
        const idx = s.findIndex((r) => r.name === 'step' && r.index === stepCount - 1);
        return idx >= 0 ? s.slice(0, idx + 1) : [...s, { name: 'step', index: stepCount - 1 }];
      });
      return;
    }
    setStack((s) => [...s, { name: 'step', index: i + 1 }]);
  }, [route, draft, stepCount, editingFromReview, persist]);

  const editStep = useCallback((i: number) => {
    setEditingFromReview(true);
    setStack((s) => [...s, { name: 'step', index: i }]);
  }, []);

  const addAttachments = useCallback(
    (files: File[] | 'sample') => {
      const d = draftRef.current;
      const room = 8 - d.attachments.length;
      if (room <= 0) {
        toast('You can add up to 8 files');
        return;
      }
      const items: Attachment[] =
        files === 'sample'
          ? [{ id: crypto.randomUUID?.() ?? String(Math.random()), name: `site-photo-${d.attachments.length + 1}.jpg`, kind: 'image', url: sampleImage(d.attachments.length), sizeKb: 1840, progress: 0 }]
          : files.slice(0, room).map((f) => {
              const isPdf = f.type === 'application/pdf';
              const okType = isPdf || ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'].includes(f.type);
              const tooBig = f.size > 10 * 1024 * 1024;
              return {
                id: crypto.randomUUID?.() ?? String(Math.random()),
                name: f.name,
                kind: isPdf ? 'pdf' : 'image',
                url: !isPdf && okType ? URL.createObjectURL(f) : undefined,
                sizeKb: Math.round(f.size / 1024),
                progress: 0,
                error: !okType ? 'Unsupported file' : tooBig ? 'Over 10 MB' : undefined,
              } as Attachment;
            });
      if (files !== 'sample' && files.length > room) toast(`Only ${room} more file${room === 1 ? '' : 's'} added (limit 8)`);
      setDraft((dd) => ({ ...dd, attachments: [...dd.attachments, ...items] }));
      setUi((u) => ({ ...u, sheet: null }));
      // simulated upload progress
      items.filter((x) => !x.error).forEach((it) => {
        let p = 0;
        const t = window.setInterval(() => {
          p += 20 + Math.random() * 25;
          setDraft((dd) => ({ ...dd, attachments: dd.attachments.map((a) => (a.id === it.id ? { ...a, progress: Math.min(100, Math.round(p)) } : a)) }));
          if (p >= 100) window.clearInterval(t);
        }, 280);
      });
    },
    [toast],
  );

  const removeAttachment = useCallback((id: string) => setDraft((d) => ({ ...d, attachments: d.attachments.filter((a) => a.id !== id) })), []);

  const openSheet = useCallback((s: SheetName) => setUi((u) => ({ ...u, sheet: s })), []);
  const openDialog = useCallback((d: DialogName) => setUi((u) => ({ ...u, dialog: d })), []);
  const closeOverlays = useCallback(() => setUi((u) => ({ ...u, sheet: null, dialog: null })), []);

  const needsVerification = useCallback(() => {
    if (verifiedPhone && verifiedPhone === draft.contact.phone) return false;
    if (!demo.signedIn) return true;
    if (demo.sessionExpired) return true;
    return draft.contact.phone !== DEMO_USER.phone;
  }, [verifiedPhone, draft.contact.phone, demo.signedIn, demo.sessionExpired]);

  const doSubmit = useCallback(async () => {
    const d = draftRef.current;
    setUi((u) => ({ ...u, busy: true, sheet: null, dialog: null }));
    try {
      const fail = demo.failNextSubmit;
      if (fail) setDemoState((s) => ({ ...s, failNextSubmit: false }));
      const { requirement, duplicate } = await submitRequirement(d, titleFor(d), { offline: demo.offline, fail });
      if (!duplicate) {
        setRequirements((list) => {
          const nl = [requirement, ...list];
          saveRequirements(nl);
          return nl;
        });
      }
      clearDraft();
      setSavedDraft(null);
      setUi((u) => ({ ...u, busy: false }));
      setStack([{ name: 'landing' }, { name: 'success', id: requirement.id }]);
      if (duplicate) toast('Already submitted — showing your original requirement');
    } catch (e) {
      setUi((u) => ({ ...u, busy: false }));
      if (e instanceof SubmitError && e.kind === 'offline') {
        toast('You’re offline. Your requirement is saved — submit when you’re back online.');
        return;
      }
      setStack((s) => [...s.filter((r) => r.name !== 'failed'), { name: 'failed' }]);
    }
  }, [demo.failNextSubmit, demo.offline, toast]);

  const submit = useCallback(() => {
    const d = draftRef.current;
    const bad = firstInvalidStep(d, stepCount);
    if (bad >= 0) {
      setAttempted((a) => ({ ...a, [bad]: true }));
      setAttemptCount((n) => n + 1);
      if (bad !== stepCount - 1) {
        setEditingFromReview(true);
        setStack((s) => [...s, { name: 'step', index: bad }]);
        toast('Please complete the highlighted fields');
      }
      return;
    }
    if (demo.offline) {
      toast('You’re offline. Connect to the internet to submit.');
      return;
    }
    if (needsVerification()) {
      if (demo.signedIn && demo.sessionExpired) {
        setUi((u) => ({ ...u, dialog: 'sessionExpired' }));
        return;
      }
      setOtp(null);
      setStack((s) => [...s, { name: 'phone' }]);
      return;
    }
    void doSubmit();
  }, [stepCount, demo.offline, demo.signedIn, demo.sessionExpired, needsVerification, doSubmit, toast]);

  const sendCode = useCallback(
    async (phone: string) => {
      setOtp((o) => ({ ...(o ?? { phone, sentAt: 0, expiresAt: 0, attemptsLeft: 5, resendsLeft: 3 }), phone, status: 'sending' }));
      const s = await sendOtp(phone);
      setOtp(s);
      setDraft((d) => ({ ...d, contact: { ...d.contact, phone } }));
      setStack((st) => (st[st.length - 1].name === 'otp' ? st : [...st, { name: 'otp' }]));
    },
    [],
  );

  const resendCode = useCallback(async () => {
    if (!otp) return;
    if (Date.now() - otp.sentAt < RESEND_COOLDOWN_MS) return;
    if (otp.resendsLeft <= 0) {
      setOtp({ ...otp, status: 'locked', lockedUntil: Date.now() + 15 * 60 * 1000, error: 'resendLimit' });
      return;
    }
    setOtp({ ...otp, status: 'sending', error: undefined });
    const s = await sendOtp(otp.phone, otp);
    setOtp(s);
    toast('New code sent (demo)');
  }, [otp, toast]);

  const verifyCode = useCallback(
    async (code: string) => {
      if (!otp) return;
      setOtp({ ...otp, status: 'verifying', error: undefined });
      const r = await verifyOtp(otp, code);
      setOtp(r);
      if (r.status === 'verified') {
        setVerifiedPhone(r.phone);
        setDemoState((s) => ({ ...s, signedIn: true, sessionExpired: false }));
        window.setTimeout(() => void doSubmit(), 800);
      }
    },
    [otp, doSubmit],
  );

  const skipVerification = useCallback(() => {
    toast('Verification skipped — demo only');
    void doSubmit();
  }, [doSubmit, toast]);

  const retrySubmit = useCallback(() => void doSubmit(), [doSubmit]);

  const openList = useCallback(() => {
    setStack((s) => [...s, { name: 'list' }]);
    setUi((u) => ({ ...u, listLoading: true }));
    window.setTimeout(() => setUi((u) => ({ ...u, listLoading: false })), 700);
  }, []);

  const cancelRequirement = useCallback(
    (id: string) => {
      setRequirements((list) => {
        const nl = list.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r));
        saveRequirements(nl);
        return nl;
      });
      setUi((u) => ({ ...u, dialog: null }));
      toast('Requirement cancelled');
    },
    [toast],
  );

  const setDemo = useCallback((p: Partial<DemoSettings & { sessionExpired: boolean }>) => {
    setDemoState((s) => ({ ...s, ...p }));
    if (p.signedIn === false) setVerifiedPhone(null);
    if (p.signedIn !== undefined) {
      setDraft((d) => (d.category ? d : { ...d, contact: p.signedIn ? DEMO_USER : { name: '', phone: '', email: '' } }));
    }
  }, []);

  const resetAll = useCallback(() => {
    clearDraft();
    saveRequirements([]);
    setSavedDraft(null);
    setRequirements([]);
    setDraft(emptyDraft(DEMO_USER));
    setOtp(null);
    setVerifiedPhone(null);
    setAttempted({});
    setTouched({});
    setDemoState({ signedIn: true, offline: false, failNextSubmit: false, sessionExpired: false });
    setStack([{ name: 'landing' }]);
    setUi(DEFAULT_UI);
  }, []);

  return {
    route,
    stackDepth: stack.length,
    draft,
    errors,
    attemptCount,
    demo,
    savedDraft,
    requirements,
    otp,
    now,
    ui,
    editingFromReview,
    verifiedPhone,
    justSaved,
    go,
    back,
    home,
    update,
    touch,
    startCategory,
    resumeDraft,
    discardDraft,
    next,
    editStep,
    addAttachments,
    removeAttachment,
    openSheet,
    openDialog,
    closeOverlays,
    toast,
    submit,
    needsVerification,
    sendCode,
    resendCode,
    verifyCode,
    skipVerification,
    retrySubmit,
    openList,
    cancelRequirement,
    setDemo,
    resetAll,
  };
}
