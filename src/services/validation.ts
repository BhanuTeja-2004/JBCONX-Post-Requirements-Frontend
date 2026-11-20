/**
 * Client-side validation for UX feedback. PRODUCTION: every rule is re-checked on the server.
 */
import type { Address, Contact, Draft, Errors } from '../data/types';
import { NEEDS_AREA, NEEDS_FLOORS, SERVICES } from '../data/catalog';

export const PHONE_RE = /^[6-9]\d{9}$/;
export const PIN_RE = /^[1-9]\d{5}$/;
export const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,59}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const DESC_MIN = 20;
export const DESC_MAX = 1000;

export function stepKey(d: Draft, index: number): string {
  const map: Record<string, string[]> = {
    individual: ['service', 'details-ind', 'location', 'review'],
    contractor: ['service', 'details-con', 'location', 'review'],
    renovation: ['service', 'property', 'requirements', 'location', 'review'],
  };
  return map[d.category ?? 'individual'][index];
}

export function isRenoPaintOnly(d: Draft) {
  return d.renoAreas.length === 1 && d.renoAreas[0] === 'painting';
}

export function areaRequired(d: Draft) {
  if (d.category === 'contractor') return !!d.projectType && NEEDS_AREA.includes(d.projectType);
  if (d.category === 'renovation') return d.renoAreas.some((a) => ['full', 'flooring', 'painting'].includes(a));
  return false;
}

export function floorsVisible(d: Draft) {
  return d.category === 'contractor' && !!d.projectType && NEEDS_FLOORS.includes(d.projectType);
}

export function isDesignPro(d: Draft) {
  return d.profession === 'architect' || d.profession === 'interior';
}

function validateDescription(d: Draft, e: Errors) {
  const t = d.description.trim();
  if (!t) e.description = 'Describe the work so professionals can understand it';
  else if (t.length < DESC_MIN) e.description = `Add a little more detail (at least ${DESC_MIN} characters)`;
  else if (t.length > DESC_MAX) e.description = `Keep it under ${DESC_MAX} characters`;
}

function validateArea(d: Draft, e: Errors, required: boolean) {
  if (!d.area) {
    if (required) e.area = 'Enter the approximate area in sq ft';
    return;
  }
  const n = Number(d.area);
  if (!Number.isInteger(n) || n < 50 || n > 100000) e.area = 'Enter a number between 50 and 100,000';
}

export function validateAddress(a: Partial<Address>): Errors {
  const e: Errors = {};
  if (!a.house?.trim()) e.house = 'Enter house / flat / plot number';
  if (!a.street?.trim()) e.street = 'Enter street or road';
  if (!a.area?.trim()) e.area = 'Enter area or locality';
  if (!a.city?.trim()) e.city = 'Enter city';
  if (!a.pincode) e.pincode = 'Enter a 6-digit pincode';
  else if (!PIN_RE.test(a.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
  return e;
}

/** Demo serviceability rule (PD-04): pincodes starting with 9 are shown as not yet serviceable. */
export function isServiceable(pin?: string) {
  return !!pin && PIN_RE.test(pin) && !pin.startsWith('9');
}

export function validateContact(c: Contact): Errors {
  const e: Errors = {};
  if (!c.name.trim()) e.name = 'Enter your name';
  else if (!NAME_RE.test(c.name.trim())) e.name = 'Use letters only (2–60 characters)';
  if (!c.phone) e.phone = 'Enter your 10-digit mobile number';
  else if (!PHONE_RE.test(c.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
  if (c.email && !EMAIL_RE.test(c.email)) e.email = 'Enter a valid email or leave it blank';
  return e;
}

export function validateStep(d: Draft, index: number): Errors {
  const e: Errors = {};
  const key = stepKey(d, index);
  switch (key) {
    case 'service':
      if (d.category === 'individual') {
        if (!d.profession) e.profession = 'Choose a professional';
        else if (!d.service && SERVICES[d.profession]?.length > 1) e.service = 'Choose the service you need';
      }
      if (d.category === 'contractor') {
        if (!d.contractorType) e.contractorType = 'Choose a contractor type';
        else if (!d.projectType) e.projectType = 'Choose the project type';
      }
      if (d.category === 'renovation' && d.renoAreas.length === 0) e.renoAreas = 'Choose at least one area to renovate';
      break;
    case 'details-ind':
      validateDescription(d, e);
      if (isDesignPro(d)) {
        if (!d.stage) e.stage = 'Choose your project stage';
      } else if (!d.urgency) e.urgency = 'Tell us how soon you need this';
      break;
    case 'details-con':
      if (!d.propertyType) e.propertyType = 'Choose the property type';
      validateArea(d, e, areaRequired(d));
      if (floorsVisible(d) && !d.floors) e.floors = 'Choose the number of floors';
      validateDescription(d, e);
      if (!d.budget) e.budget = 'Choose an estimated budget';
      if (!d.timeline) e.timeline = 'Choose when you want to start';
      break;
    case 'property':
      if (!d.propertyType) e.propertyType = 'Choose the property type';
      if (d.propertyType && d.propertyType !== 'commercial' && !d.bhk) e.bhk = 'Choose the property size';
      validateArea(d, e, areaRequired(d));
      if (!d.occupied) e.occupied = 'Tell us if the property is occupied';
      if (isRenoPaintOnly(d) && !d.paintScope) e.paintScope = 'Choose interior, exterior or both';
      break;
    case 'requirements':
      validateDescription(d, e);
      if (!d.budget) e.budget = 'Choose a budget range';
      if (!d.timeline) e.timeline = 'Choose when you want to start';
      break;
    case 'location': {
      if (!d.address) e.address = 'Add the service location';
      else if (!isServiceable(d.address.pincode)) e.address = 'We don’t serve this pincode yet';
      if (d.category === 'individual' && d.urgency !== 'emergency') {
        if (!d.date) e.date = 'Choose a preferred date';
        if (!d.timeSlot) e.timeSlot = 'Choose a time window';
      }
      if (d.category === 'contractor' && !d.siteVisit) e.siteVisit = 'Choose when a site visit suits you';
      break;
    }
    case 'review':
      Object.assign(e, validateContact(d.contact));
      if (!d.consent) e.consent = 'Please agree so we can share your requirement';
      break;
  }
  return e;
}

/** Returns the first step index with errors, or -1 if everything is valid. */
export function firstInvalidStep(d: Draft, stepCount: number): number {
  for (let i = 0; i < stepCount; i++) if (Object.keys(validateStep(d, i)).length) return i;
  return -1;
}
