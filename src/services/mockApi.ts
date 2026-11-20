/**
 * SIMULATED SERVICES — DEMO ONLY.
 * Nothing here contacts a server or sends an SMS. The OTP is a fixed demo code.
 * It demonstrates UI states only and must never be presented as real authentication.
 */
import type { Draft, OtpState, Requirement } from '../data/types';

export const DEMO_OTP = '123456';
export const OTP_TTL_MS = 5 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 30 * 1000;
export const MAX_ATTEMPTS = 5;
export const MAX_RESENDS = 3;
export const LOCK_MS = 15 * 60 * 1000;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function newIdempotencyKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'k-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function newReqId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = (n: number) => Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `JBX-${pick(4)}-${pick(2)}`;
}

export async function sendOtp(phone: string, prev?: OtpState): Promise<OtpState> {
  await wait(700);
  const now = Date.now();
  return {
    phone,
    sentAt: now,
    expiresAt: now + OTP_TTL_MS,
    attemptsLeft: MAX_ATTEMPTS,
    resendsLeft: prev ? prev.resendsLeft - 1 : MAX_RESENDS,
    status: 'waiting',
  };
}

export async function verifyOtp(state: OtpState, code: string): Promise<OtpState> {
  await wait(600);
  const now = Date.now();
  if (now > state.expiresAt) return { ...state, status: 'waiting', error: 'expired' };
  if (code === DEMO_OTP) return { ...state, status: 'verified', error: undefined };
  const attemptsLeft = state.attemptsLeft - 1;
  if (attemptsLeft <= 0) return { ...state, attemptsLeft: 0, status: 'locked', lockedUntil: now + LOCK_MS, error: 'locked' };
  return { ...state, attemptsLeft, status: 'waiting', error: 'wrong' };
}

/** Simulated idempotency store: same key → same requirement (no duplicates). */
const idempotencyStore = new Map<string, Requirement>();

export class SubmitError extends Error {
  constructor(public kind: 'network' | 'offline') {
    super(kind);
  }
}

export async function submitRequirement(
  draft: Draft,
  title: string,
  opts: { offline: boolean; fail: boolean },
): Promise<{ requirement: Requirement; duplicate: boolean }> {
  if (opts.offline) throw new SubmitError('offline');
  await wait(1400);
  const key = draft.idempotencyKey ?? newIdempotencyKey();
  const existing = idempotencyStore.get(key);
  if (existing) return { requirement: existing, duplicate: true };
  if (opts.fail) throw new SubmitError('network');
  const requirement: Requirement = { id: newReqId(), createdAt: Date.now(), status: 'submitted', title, draft };
  idempotencyStore.set(key, requirement);
  return { requirement, duplicate: false };
}
