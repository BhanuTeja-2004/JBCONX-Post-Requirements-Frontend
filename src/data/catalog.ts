/**
 * ILLUSTRATIVE CATALOGUE — mock data for the prototype only.
 * Real service lists, budget ranges and SLAs must come from JBCONX (PD-13, PD-14, PD-07).
 */
import type { Category } from './types';

export interface Option {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
}

export interface CategoryDef {
  id: Category;
  title: string;
  description: string;
  examples: string;
  effort: string;
  icon: string;
  tint: string;
  steps: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'individual',
    title: 'Hire Individual Professional',
    description: 'One skilled person for a specific job',
    examples: 'Electrician · Plumber · Carpenter · Painter · Architect',
    effort: 'About 2 min · 4 steps',
    icon: 'person',
    tint: '#E3EBF6',
    steps: ['Service', 'Details', 'Location & time', 'Review'],
  },
  {
    id: 'contractor',
    title: 'Hire Contractors',
    description: 'A contracting firm for a construction project',
    examples: 'Civil · Construction · Electrical · Plumbing',
    effort: 'About 3 min · 4 steps',
    icon: 'helmet',
    tint: '#FDF0DC',
    steps: ['Service', 'Project details', 'Site location', 'Review'],
  },
  {
    id: 'renovation',
    title: 'House Renovation Service',
    description: 'Renovate one room or the whole home',
    examples: 'Kitchen · Bathroom · Painting · Flooring',
    effort: 'About 3 min · 5 steps',
    icon: 'roller',
    tint: '#E2F2EA',
    steps: ['Renovation', 'Property', 'Requirements', 'Location', 'Review'],
  },
];

export const categoryById = (id?: Category) => CATEGORIES.find((c) => c.id === id);

export const PROFESSIONS: Option[] = [
  { id: 'electrician', label: 'Electrician', icon: 'bolt' },
  { id: 'plumber', label: 'Plumber', icon: 'drop' },
  { id: 'carpenter', label: 'Carpenter', icon: 'hammer' },
  { id: 'painter', label: 'Painter', icon: 'brush' },
  { id: 'mason', label: 'Mason', icon: 'brick' },
  { id: 'architect', label: 'Architect', icon: 'ruler' },
  { id: 'interior', label: 'Interior designer', icon: 'sofa' },
  { id: 'other', label: 'Other', icon: 'more' },
];

export const SERVICES: Record<string, string[]> = {
  electrician: ['Wiring & rewiring', 'Switch & socket', 'Fan & light fitting', 'MCB / DB board', 'Inverter setup', 'Inspection', 'Other'],
  plumber: ['Leak repair', 'Tap & mixer', 'Bathroom fittings', 'Water tank & motor', 'Drain blockage', 'New pipeline', 'Other'],
  carpenter: ['Furniture repair', 'Door & window', 'Modular kitchen', 'Wardrobe', 'Custom furniture', 'Other'],
  painter: ['Interior painting', 'Exterior painting', 'Texture / design wall', 'Wood polish', 'Waterproof coating', 'Other'],
  mason: ['Brick work', 'Plastering', 'Tiling', 'Small repairs', 'Compound wall', 'Other'],
  architect: ['House plan & elevation', 'Building approval drawings', '3D visualisation', 'Structural consultation', 'Other'],
  interior: ['Full home interiors', 'Kitchen design', 'Bedroom design', 'Office interiors', 'Consultation only', 'Other'],
  other: ['Describe in details'],
};

export const URGENCY: Option[] = [
  { id: 'emergency', label: 'Emergency', hint: 'Today, as soon as possible' },
  { id: 'soon', label: 'In 2–3 days' },
  { id: 'flexible', label: 'Flexible' },
];

export const PROJECT_STAGE: Option[] = [
  { id: 'exploring', label: 'Just exploring' },
  { id: 'ready', label: 'Ready to start' },
  { id: 'approval', label: 'Need drawings for approval' },
];

export const CONTRACTOR_TYPES: Option[] = [
  { id: 'civil', label: 'Civil / Construction', hint: 'New builds, extensions, structural', icon: 'building' },
  { id: 'electrical', label: 'Electrical contractor', hint: 'Complete wiring, panels, HT/LT', icon: 'bolt' },
  { id: 'plumbing', label: 'Plumbing contractor', hint: 'Full plumbing, sanitation, drainage', icon: 'drop' },
  { id: 'interiorfit', label: 'Interior fit-out', hint: 'Turnkey interiors for homes & offices', icon: 'sofa' },
  { id: 'waterproof', label: 'Waterproofing', hint: 'Roofs, basements, bathrooms', icon: 'shield' },
  { id: 'fabrication', label: 'Fabrication & steel', hint: 'Sheds, grills, gates, structures', icon: 'grid' },
  { id: 'specialised', label: 'Other specialised', hint: 'Describe your need', icon: 'more' },
];

export const PROJECT_TYPES: Record<string, string[]> = {
  civil: ['New construction', 'Extension / additional floor', 'Compound wall', 'Structural repair', 'Demolition'],
  electrical: ['New building wiring', 'Rewiring', 'Panel / DB upgrade', 'Solar installation', 'Commercial electrical'],
  plumbing: ['New building plumbing', 'Re-plumbing', 'Sump & overhead tank', 'Drainage & sewage', 'Rainwater harvesting'],
  interiorfit: ['Home interiors', 'Office fit-out', 'Retail / showroom', 'Kitchen & wardrobes'],
  waterproof: ['Terrace / roof', 'Bathroom', 'Basement', 'External walls'],
  fabrication: ['Shed / roofing', 'Gates & grills', 'Staircase', 'Steel structure'],
  specialised: ['Other'],
};

export const NEEDS_AREA = ['New construction', 'Extension / additional floor', 'New building wiring', 'New building plumbing', 'Home interiors', 'Office fit-out'];
export const NEEDS_FLOORS = ['New construction', 'Extension / additional floor'];

export const PROPERTY_TYPES: Option[] = [
  { id: 'house', label: 'Independent house' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'plot', label: 'Open plot' },
];

export const RENO_PROPERTY_TYPES = PROPERTY_TYPES.filter((p) => ['house', 'apartment', 'villa', 'commercial'].includes(p.id));

export const FLOORS = ['G', 'G+1', 'G+2', 'G+3 or more'];

export const TIMELINES_CONTRACTOR: Option[] = [
  { id: 'now', label: 'Immediately' },
  { id: '1m', label: 'Within 1 month' },
  { id: '3m', label: '1–3 months' },
  { id: 'planning', label: 'Just planning' },
];

export const TIMELINES_RENO: Option[] = [
  { id: '2w', label: 'Within 2 weeks' },
  { id: '1m', label: 'Within 1 month' },
  { id: '3m', label: '1–3 months' },
  { id: 'flex', label: 'Flexible' },
];

export const DRAWINGS: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'progress', label: 'In progress' },
  { id: 'no', label: 'No' },
];

export const SITE_VISIT: Option[] = [
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'any', label: 'Any day' },
];

export const RENO_AREAS: Option[] = [
  { id: 'full', label: 'Full house', icon: 'home' },
  { id: 'kitchen', label: 'Kitchen', icon: 'kitchen' },
  { id: 'bathroom', label: 'Bathroom', icon: 'drop' },
  { id: 'bedroom', label: 'Bedroom', icon: 'bed' },
  { id: 'living', label: 'Living room', icon: 'sofa' },
  { id: 'painting', label: 'Painting', icon: 'roller' },
  { id: 'flooring', label: 'Flooring', icon: 'grid' },
  { id: 'ceiling', label: 'False ceiling', icon: 'layers' },
  { id: 'structural', label: 'Structural changes', icon: 'building' },
  { id: 'exterior', label: 'Exterior', icon: 'tree' },
];

export const BHK = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
export const PROPERTY_AGE = ['Under 5 yrs', '5–15 yrs', '15–30 yrs', '30+ yrs'];
export const PAINT_SCOPE: Option[] = [
  { id: 'interior', label: 'Interior' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'both', label: 'Both' },
];

export const TIME_SLOTS: Option[] = [
  { id: 'morning', label: 'Morning', hint: '8 am – 12 pm' },
  { id: 'afternoon', label: 'Afternoon', hint: '12 – 4 pm' },
  { id: 'evening', label: 'Evening', hint: '4 – 8 pm' },
];

/** Illustrative ₹ budget ranges (PD-14). */
export function budgetOptions(category?: string, projectType?: string, renoAreas: string[] = []): string[] {
  if (category === 'individual') return ['Under ₹25k', '₹25k – 1 lakh', '₹1 – 5 lakh', 'Above ₹5 lakh', 'Not sure yet'];
  if (category === 'contractor') {
    const big = projectType && NEEDS_FLOORS.includes(projectType);
    return big
      ? ['₹10 – 25 lakh', '₹25 – 50 lakh', '₹50 lakh – 1 cr', 'Above ₹1 cr', 'Not sure yet']
      : ['Under ₹1 lakh', '₹1 – 5 lakh', '₹5 – 15 lakh', 'Above ₹15 lakh', 'Not sure yet'];
  }
  const large = renoAreas.includes('full') || renoAreas.includes('structural') || renoAreas.length >= 3;
  return large
    ? ['₹3 – 8 lakh', '₹8 – 15 lakh', '₹15 – 30 lakh', 'Above ₹30 lakh', 'Need guidance']
    : ['Under ₹1 lakh', '₹1 – 3 lakh', '₹3 – 8 lakh', 'Above ₹8 lakh', 'Need guidance'];
}

export const DESCRIPTION_PROMPTS: Record<string, string[]> = {
  individual: ['What needs fixing or installing', 'How many items / rooms', 'Any materials you already have', 'Access or parking notes'],
  contractor: ['Scope of work', 'Current status of the site', 'Approvals in place', 'Special requirements'],
  renovation: ['What you want changed', 'Style or finish you like', 'Things to keep as-is', 'Any problems (leaks, cracks)'],
};

export const DESCRIPTION_PLACEHOLDER: Record<string, string> = {
  individual: 'e.g. 3 ceiling fans to be installed in the hall and two bedrooms. Wiring points already exist.',
  contractor: 'e.g. G+1 independent house on a 30×40 plot. Approved plan available. Need full civil work up to plastering.',
  renovation: 'e.g. Modular kitchen with granite top, new wall tiles and chimney. Keep the existing window.',
};

/** Demo signed-in user (mock). */
export const DEMO_USER = { name: 'Ravi Kumar', phone: '9876543210', email: 'ravi.kumar@example.com' };

export const SAVED_ADDRESSES = [
  { label: 'Home', house: 'Flat 302, Sai Residency', street: 'Road No. 4, Gandhi Nagar', area: 'Kuppam', city: 'Chittoor', pincode: '517425' },
  { label: 'Site', house: 'Plot 18', street: 'Venkateswara Layout', area: 'Palamaner', city: 'Chittoor', pincode: '517408' },
];

export const DEMO_CURRENT_LOCATION = { house: '', street: 'Main Road, near Bus Stand', area: 'Kuppam', city: 'Chittoor', pincode: '517425' };
