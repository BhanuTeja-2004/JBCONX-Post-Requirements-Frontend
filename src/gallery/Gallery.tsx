/**
 * Screen gallery — static renders of every key screen and state on both platforms,
 * built from the same components as the interactive prototype (UI reference board).
 */
import type { CSSProperties } from 'react';
import { Device } from '../components/Chrome';
import { DEMO_USER, SAVED_ADDRESSES } from '../data/catalog';
import type { DemoSettings, Draft, Errors, OtpState, Platform, Requirement, Route } from '../data/types';
import { emptyDraft } from '../data/types';
import { FlowContext, sampleImage, titleFor, type Flow, type UiState } from '../navigation/flow';
import { Overlays, Screen } from '../navigation/PhoneApp';
import { validateStep } from '../services/validation';

const NOW = Date.now();
const noop = () => {};
const anoop = async () => {};

interface Preset {
  id: string;
  group: string;
  caption: string;
  route: Route;
  draft?: Draft;
  errors?: Errors;
  ui?: Partial<UiState>;
  otp?: OtpState | null;
  demo?: Partial<DemoSettings & { sessionExpired: boolean }>;
  savedDraft?: Draft | null;
  requirements?: Requirement[];
  editingFromReview?: boolean;
}

const photos = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: 'p' + i, name: `photo-${i + 1}.jpg`, kind: 'image' as const, url: sampleImage(i), sizeKb: 1800, progress: i === n - 1 ? 60 : 100 }));

const base = (patch: Partial<Draft>): Draft => ({ ...emptyDraft(DEMO_USER), ...patch });

const indFull = base({
  category: 'individual',
  step: 3,
  profession: 'electrician',
  service: 'Fan & light fitting',
  description: 'Install 3 ceiling fans in the hall and two bedrooms. Wiring points already exist. Fans are available.',
  urgency: 'soon',
  attachments: photos(3),
  address: SAVED_ADDRESSES[0],
  date: 'tomorrow',
  timeSlot: 'morning',
  consent: true,
});

const conFull = base({
  category: 'contractor',
  step: 2,
  contractorType: 'civil',
  projectType: 'New construction',
  propertyType: 'house',
  area: '1800',
  floors: 'G+1',
  description: 'G+1 independent house on a 30×40 plot. Approved plan available. Need complete civil work up to plastering.',
  budget: '₹25 – 50 lakh',
  timeline: '1m',
  drawings: 'yes',
  attachments: [
    { id: 'd1', name: 'approved-plan.pdf', kind: 'pdf', sizeKb: 2400, progress: 100 },
    { id: 'd2', name: 'site.jpg', kind: 'image', url: sampleImage(1), sizeKb: 1900, progress: 100 },
  ],
  address: SAVED_ADDRESSES[1],
  siteVisit: 'weekends',
});

const renoBase = base({ category: 'renovation', step: 1, renoAreas: ['kitchen', 'bathroom', 'structural'], propertyType: 'apartment', bhk: '2 BHK', area: '1150', age: '15–30 yrs', occupied: 'yes' });

const reqs: Requirement[] = [
  { id: 'JBX-7Q4K-29', createdAt: NOW - 3600e3 * 2, status: 'review', title: titleFor(indFull), draft: indFull },
  { id: 'JBX-M2HD-84', createdAt: NOW - 864e5 * 3, status: 'quotes', title: titleFor(conFull), draft: conFull },
  { id: 'JBX-R9TV-51', createdAt: NOW - 864e5 * 12, status: 'cancelled', title: 'Kitchen + Bathroom renovation', draft: renoBase },
];

const otpBase: OtpState = { phone: '9876543210', sentAt: NOW - 12000, expiresAt: NOW + 288000, attemptsLeft: 5, resendsLeft: 3, status: 'waiting' };

const PRESETS: Preset[] = [
  { id: 'S01', group: 'Landing', caption: 'S01 Landing — one tap starts a flow; effort shown on each card', route: { name: 'landing' } },
  { id: 'S01b', group: 'Landing', caption: 'S01 Landing with unfinished draft to resume', route: { name: 'landing' }, savedDraft: { ...conFull, step: 1, updatedAt: NOW - 7200e3 } },
  { id: 'S02a', group: 'Hire Individual Professional', caption: 'S02 Service — profession + specific job', route: { name: 'step', index: 0 }, draft: base({ category: 'individual', profession: 'electrician', service: 'Fan & light fitting' }) },
  { id: 'S02v', group: 'Hire Individual Professional', caption: 'X1 Validation — Continue pressed with nothing selected', route: { name: 'step', index: 0 }, draft: base({ category: 'individual' }), errors: { profession: 'Choose a professional' } },
  { id: 'S03', group: 'Hire Individual Professional', caption: 'S03 Details — description prompts, urgency, photo upload in progress', route: { name: 'step', index: 1 }, draft: indFull },
  { id: 'S07a', group: 'Hire Individual Professional', caption: 'S07 Location & time — saved address, date and time window', route: { name: 'step', index: 2 }, draft: indFull, ui: { snackbar: null } },
  { id: 'S10a', group: 'Hire Individual Professional', caption: 'S10 Review — edit any section; signed-in contact pre-filled and verified', route: { name: 'step', index: 3 }, draft: indFull },
  { id: 'S02c', group: 'Hire Contractors', caption: 'S02 Service — contractor type and project type', route: { name: 'step', index: 0 }, draft: conFull },
  { id: 'S04', group: 'Hire Contractors', caption: 'S04 Project details — conditional area/floors, budget range, drawings upload', route: { name: 'step', index: 1 }, draft: conFull },
  { id: 'S07c', group: 'Hire Contractors', caption: 'S07 Site location — site-visit preference', route: { name: 'step', index: 2 }, draft: conFull },
  { id: 'S02r', group: 'House Renovation Service', caption: 'S02 Renovation — multi-select with structural-work notice', route: { name: 'step', index: 0 }, draft: renoBase },
  { id: 'S05', group: 'House Renovation Service', caption: 'S05 Property — type, size, area, age, occupancy', route: { name: 'step', index: 1 }, draft: renoBase },
  {
    id: 'S06v',
    group: 'House Renovation Service',
    caption: 'S06 Requirements — inline errors on required fields',
    route: { name: 'step', index: 2 },
    draft: { ...renoBase, description: 'New kitchen' },
    errors: validateStep({ ...renoBase, description: 'New kitchen' }, 2),
  },
  {
    id: 'S07x',
    group: 'House Renovation Service',
    caption: 'X7 Location — pincode not yet serviceable, Notify me',
    route: { name: 'step', index: 3 },
    draft: { ...renoBase, address: { house: '12-4', street: 'MG Road', area: 'Banjara', city: 'Hyderabad', pincode: '900021' } },
  },
  { id: 'S08', group: 'Shared components', caption: 'S08 Address sheet — manual entry with validation', route: { name: 'step', index: 3 }, draft: renoBase, ui: { sheet: 'address' } },
  { id: 'S09', group: 'Shared components', caption: 'S09 Upload source picker — permission asked only for chosen source', route: { name: 'step', index: 1 }, draft: indFull, ui: { sheet: 'upload' } },
  { id: 'X6', group: 'Shared components', caption: 'X6 Exit — save draft, discard or keep editing', route: { name: 'step', index: 1 }, draft: conFull, ui: { dialog: 'exit' } },
  { id: 'X4', group: 'Shared components', caption: 'X4 Offline — banner, draft kept, submit blocked with reason', route: { name: 'step', index: 3 }, draft: indFull, demo: { offline: true } },
  { id: 'S11', group: 'Verification (simulated)', caption: 'S11 Mobile number — guest or changed number', route: { name: 'phone' }, draft: { ...indFull, contact: { name: 'Ravi Kumar', phone: '9123456780', email: '' } }, demo: { signedIn: false } },
  { id: 'S12a', group: 'Verification (simulated)', caption: 'S12 OTP — auto-read (Android SMS Retriever / iOS AutoFill), countdowns', route: { name: 'otp' }, otp: otpBase },
  { id: 'S12b', group: 'Verification (simulated)', caption: 'S12 OTP — wrong code, attempts left', route: { name: 'otp' }, otp: { ...otpBase, sentAt: NOW - 45000, attemptsLeft: 3, error: 'wrong' } },
  { id: 'S12c', group: 'Verification (simulated)', caption: 'S12 OTP — expired code', route: { name: 'otp' }, otp: { ...otpBase, sentAt: NOW - 320000, expiresAt: NOW - 20000 } },
  { id: 'S12d', group: 'Verification (simulated)', caption: 'S12 OTP — locked after too many attempts', route: { name: 'otp' }, otp: { ...otpBase, attemptsLeft: 0, status: 'locked', lockedUntil: NOW + 900000, error: 'locked' } },
  { id: 'S12e', group: 'Verification (simulated)', caption: 'S12 OTP — verified, auto-submitting', route: { name: 'otp' }, otp: { ...otpBase, status: 'verified' } },
  { id: 'S13', group: 'Verification (simulated)', caption: 'S13 Session expired — re-verify to submit, draft kept', route: { name: 'step', index: 3 }, draft: indFull, ui: { dialog: 'sessionExpired' } },
  { id: 'S14', group: 'Submission', caption: 'S14 Submitting — button locked, duplicate-safe', route: { name: 'step', index: 3 }, draft: indFull, ui: { busy: true } },
  { id: 'S15', group: 'Submission', caption: 'S15 Failed — safe retry with the same idempotency key', route: { name: 'failed' }, draft: indFull },
  { id: 'S16', group: 'Submission', caption: 'S16 Confirmation — reference number and what happens next', route: { name: 'success', id: 'JBX-7Q4K-29' }, requirements: reqs },
  { id: 'S17a', group: 'Tracking', caption: 'S17 My requirements — loading skeleton', route: { name: 'list' }, ui: { listLoading: true } },
  { id: 'S17b', group: 'Tracking', caption: 'S17 My requirements — empty state', route: { name: 'list' }, requirements: [] },
  { id: 'S17c', group: 'Tracking', caption: 'S17 My requirements — list with status chips', route: { name: 'list' }, requirements: reqs },
  { id: 'S18', group: 'Tracking', caption: 'S18 Requirement detail — status timeline', route: { name: 'detail', id: 'JBX-M2HD-84' }, requirements: reqs },
];

function makeFlow(p: Preset): Flow {
  const draft = p.draft ?? emptyDraft(DEMO_USER);
  const demo = { signedIn: true, offline: false, failNextSubmit: false, sessionExpired: false, ...p.demo };
  return {
    route: p.route,
    stackDepth: 2,
    draft,
    errors: p.errors ?? {},
    attemptCount: 0,
    demo,
    savedDraft: p.savedDraft ?? null,
    requirements: p.requirements ?? reqs,
    otp: p.otp ?? null,
    now: NOW,
    ui: { sheet: null, dialog: null, snackbar: null, busy: false, listLoading: false, ...p.ui },
    editingFromReview: !!p.editingFromReview,
    verifiedPhone: null,
    justSaved: false,
    go: noop,
    back: noop,
    home: noop,
    update: noop,
    touch: noop,
    startCategory: noop,
    resumeDraft: noop,
    discardDraft: noop,
    next: noop,
    editStep: noop,
    addAttachments: noop,
    removeAttachment: noop,
    openSheet: noop,
    openDialog: noop,
    closeOverlays: noop,
    toast: noop,
    submit: noop,
    needsVerification: () => !demo.signedIn || demo.sessionExpired || draft.contact.phone !== DEMO_USER.phone,
    sendCode: anoop,
    resendCode: anoop,
    verifyCode: anoop,
    skipVerification: noop,
    retrySubmit: noop,
    openList: noop,
    cancelRequirement: noop,
    setDemo: noop,
    resetAll: noop,
  };
}

export function Frame({ preset, platform, zoom = 0.62 }: { preset: Preset; platform: Platform; zoom?: number }) {
  return (
    <div className="g-frame" style={{ zoom } as CSSProperties} data-preset={preset.id} data-platform={platform}>
      <FlowContext.Provider value={makeFlow(preset)}>
        <Device platform={platform}>
          <Screen />
          <Overlays />
        </Device>
      </FlowContext.Provider>
    </div>
  );
}

export function Gallery({ only, zoom }: { only?: Platform; zoom?: number }) {
  const groups = Array.from(new Set(PRESETS.map((p) => p.group)));
  return (
    <main className="gallery">
      {groups.map((g) => (
        <section key={g}>
          <h2>{g}</h2>
          <p className="gdesc">
            {g.startsWith('Verification')
              ? 'Simulated verification UI. In production the server issues, rate-limits and checks codes; the app never decides “verified”.'
              : 'Android (Material 3) on the left of each pair, iOS (HIG) on the right. Same flow and rules, platform-native components.'}
          </p>
          <div className="g-grid">
            {PRESETS.filter((p) => p.group === g).map((p) => (
              <div className="g-item" key={p.id}>
                <div className="cap">
                  <b>{p.caption.split(' — ')[0]}</b>
                  {p.caption.includes(' — ') ? ' — ' + p.caption.split(' — ').slice(1).join(' — ') : ''}
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  {(only ? [only] : (['android', 'ios'] as Platform[])).map((pl) => (
                    <Frame key={pl} preset={p} platform={pl} zoom={zoom} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

export { PRESETS };
export type { Preset };
