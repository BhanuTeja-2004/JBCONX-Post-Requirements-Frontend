/**
 * Local persistence for the prototype (browser localStorage).
 * PRODUCTION NOTE: drafts containing personal data must be stored encrypted
 * (iOS Keychain / Android Keystore-wrapped key). localStorage is used here only for the demo.
 */
import type { Draft, Requirement } from '../data/types';

const DRAFT_KEY = 'jbconx.proto.draft.v1';
const REQS_KEY = 'jbconx.proto.requirements.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — prototype continues in memory */
  }
}

export function loadDraft(): Draft | null {
  const d = read<Draft | null>(DRAFT_KEY, null);
  if (!d || !d.category) return null;
  // Object URLs do not survive reloads; keep metadata only.
  return { ...d, attachments: d.attachments.map((a) => ({ ...a, url: a.kind === 'image' ? a.url : undefined })) };
}

export function saveDraft(d: Draft) {
  write(DRAFT_KEY, { ...d, updatedAt: Date.now() });
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadRequirements(): Requirement[] {
  return read<Requirement[]>(REQS_KEY, []);
}

export function saveRequirements(list: Requirement[]) {
  write(REQS_KEY, list);
}
