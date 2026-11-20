export type Platform = 'android' | 'ios';
export type Category = 'individual' | 'contractor' | 'renovation';

export interface Address {
  label?: string;
  house: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
}

export interface Attachment {
  id: string;
  name: string;
  kind: 'image' | 'pdf';
  url?: string;
  sizeKb: number;
  progress: number; // 0–100, simulated
  error?: string;
}

export interface Contact {
  name: string;
  phone: string; // 10 digits, India
  email: string;
}

export interface Draft {
  category?: Category;
  step: number;
  // Individual professional
  profession?: string;
  service?: string;
  urgency?: string;
  stage?: string;
  // Contractor
  contractorType?: string;
  projectType?: string;
  floors?: string;
  drawings?: string;
  siteVisit?: string;
  // Renovation
  renoAreas: string[];
  bhk?: string;
  age?: string;
  occupied?: 'yes' | 'no';
  paintScope?: string;
  // Shared
  propertyType?: string;
  area?: string;
  description: string;
  budget?: string;
  timeline?: string;
  attachments: Attachment[];
  address?: Address;
  date?: string; // 'today' | 'tomorrow' | ISO date
  timeSlot?: string;
  contact: Contact;
  consent: boolean;
  idempotencyKey?: string;
  updatedAt?: number;
}

export type ReqStatus = 'submitted' | 'review' | 'matched' | 'quotes' | 'closed' | 'cancelled';

export interface Requirement {
  id: string;
  createdAt: number;
  status: ReqStatus;
  title: string;
  draft: Draft;
}

export type Route =
  | { name: 'landing' }
  | { name: 'step'; index: number }
  | { name: 'phone' }
  | { name: 'otp' }
  | { name: 'submitting' }
  | { name: 'failed' }
  | { name: 'success'; id: string }
  | { name: 'list' }
  | { name: 'detail'; id: string };

export type Errors = Record<string, string>;

/** Demo-only switches shown in the presenter panel. */
export interface DemoSettings {
  signedIn: boolean;
  offline: boolean;
  failNextSubmit: boolean;
}

export interface OtpState {
  phone: string;
  sentAt: number;
  expiresAt: number;
  attemptsLeft: number;
  resendsLeft: number;
  lockedUntil?: number;
  error?: string;
  status: 'idle' | 'sending' | 'waiting' | 'verifying' | 'verified' | 'locked';
}

export function emptyDraft(contact?: Contact): Draft {
  return {
    step: 0,
    renoAreas: [],
    description: '',
    attachments: [],
    contact: contact ?? { name: '', phone: '', email: '' },
    consent: false,
  };
}
