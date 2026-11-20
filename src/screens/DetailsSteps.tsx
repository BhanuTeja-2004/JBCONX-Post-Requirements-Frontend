import { usePlatform } from '../components/Chrome';
import { Banner, ChipGroup, Section, Segmented, TextField } from '../components/Controls';
import {
  BHK,
  budgetOptions,
  DESCRIPTION_PLACEHOLDER,
  DESCRIPTION_PROMPTS,
  DRAWINGS,
  FLOORS,
  PAINT_SCOPE,
  PROJECT_STAGE,
  PROPERTY_AGE,
  PROPERTY_TYPES,
  RENO_PROPERTY_TYPES,
  TIMELINES_CONTRACTOR,
  TIMELINES_RENO,
  URGENCY,
} from '../data/catalog';
import { useFlow } from '../navigation/flow';
import { areaRequired, DESC_MAX, floorsVisible, isDesignPro, isRenoPaintOnly } from '../services/validation';
import { StepScreen } from './StepScreen';
import { Uploader } from './Uploader';

function Description({ label = 'Describe the work' }: { label?: string }) {
  const f = useFlow();
  const d = f.draft;
  const cat = d.category ?? 'individual';
  return (
    <div className="sec" data-invalid={f.errors.description ? 'true' : undefined}>
      <TextField
        label={label}
        multiline
        value={d.description}
        onChange={(v) => f.update({ description: v })}
        onBlur={() => f.touch('description')}
        placeholder={DESCRIPTION_PLACEHOLDER[cat]}
        maxLength={DESC_MAX}
        showCounter
        error={f.errors.description}
      />
      <div className="helper" style={{ marginTop: 8 }}>Tap to add a heading, then type:</div>
      <div className="prompts">
        {DESCRIPTION_PROMPTS[cat].map((p) => (
          <button key={p} className="prompt" onClick={() => f.update({ description: (d.description ? d.description.trimEnd() + '\n' : '') + p + ': ' })}>
            + {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function AreaField({ required }: { required: boolean }) {
  const f = useFlow();
  return (
    <div className="sec">
      <TextField
        label="Approximate area"
        optional={!required}
        value={f.draft.area ?? ''}
        onChange={(v) => f.update({ area: v.replace(/\D/g, '').slice(0, 6) })}
        onBlur={() => f.touch('area')}
        inputMode="numeric"
        suffix="sq ft"
        placeholder="e.g. 1200"
        error={f.errors.area}
        helper={required ? 'Built-up or plot area. An estimate is fine.' : 'Helps professionals estimate better.'}
      />
    </div>
  );
}

/** S03 — Details for an individual professional. */
export function DetailsIndividual() {
  const f = useFlow();
  const d = f.draft;
  const e = f.errors;
  const design = isDesignPro(d);
  return (
    <StepScreen index={1}>
      <h2 className="h-title">Tell us about the job</h2>
      <p className="h-sub">A clear description gets you faster, more accurate quotes.</p>
      <Description label={design ? 'Describe your project' : 'Describe the work'} />
      {design ? (
        <>
          <Section title="Project stage" error={e.stage}>
            <ChipGroup label="Project stage" options={PROJECT_STAGE} value={d.stage} onChange={(v) => f.update({ stage: v })} invalid={!!e.stage} />
          </Section>
          <Section title="Budget" optional>
            <ChipGroup label="Budget" options={budgetOptions('individual')} value={d.budget} onChange={(v) => f.update({ budget: v })} />
          </Section>
        </>
      ) : (
        <Section title="How soon do you need this?" error={e.urgency}>
          <ChipGroup label="Urgency" stack options={URGENCY} value={d.urgency} onChange={(v) => f.update({ urgency: v, ...(v === 'emergency' ? { date: 'today', timeSlot: 'asap' } : d.timeSlot === 'asap' ? { date: undefined, timeSlot: undefined } : {}) })} invalid={!!e.urgency} />
        </Section>
      )}
      <Section title="Photos" optional>
        <Uploader />
      </Section>
    </StepScreen>
  );
}

/** S04 — Project details for contractors. */
export function DetailsContractor() {
  const f = useFlow();
  const d = f.draft;
  const e = f.errors;
  return (
    <StepScreen index={1}>
      <h2 className="h-title">Project details</h2>
      <p className="h-sub">{d.projectType}</p>
      <Section title="Property type" error={e.propertyType}>
        <ChipGroup label="Property type" options={PROPERTY_TYPES} value={d.propertyType} onChange={(v) => f.update({ propertyType: v })} invalid={!!e.propertyType} />
      </Section>
      <AreaField required={areaRequired(d)} />
      {floorsVisible(d) && (
        <Section title="Number of floors" error={e.floors}>
          <ChipGroup label="Floors" options={FLOORS} value={d.floors} onChange={(v) => f.update({ floors: v })} invalid={!!e.floors} />
        </Section>
      )}
      <Description label="Scope of work" />
      <Section title="Estimated budget" error={e.budget} helper="A range is enough — it helps match the right contractors.">
        <ChipGroup label="Budget" options={budgetOptions('contractor', d.projectType)} value={d.budget} onChange={(v) => f.update({ budget: v })} invalid={!!e.budget} />
      </Section>
      <Section title="When do you want to start?" error={e.timeline}>
        <ChipGroup label="Start timeline" options={TIMELINES_CONTRACTOR} value={d.timeline} onChange={(v) => f.update({ timeline: v })} invalid={!!e.timeline} />
      </Section>
      <Section title="Drawings or approvals available?" optional>
        <Segmented label="Drawings available" options={DRAWINGS} value={d.drawings} onChange={(v) => f.update({ drawings: v })} />
      </Section>
      {(d.drawings === 'yes' || d.attachments.length > 0) && (
        <Section title="Drawings, documents & photos" optional>
          <Uploader allowPdf label="Add drawings or photos" />
        </Section>
      )}
      {d.drawings !== 'yes' && d.attachments.length === 0 && (
        <Section title="Site photos" optional>
          <Uploader allowPdf />
        </Section>
      )}
    </StepScreen>
  );
}

/** S05 — Property details (renovation). */
export function PropertyStep() {
  const f = useFlow();
  const p = usePlatform();
  const d = f.draft;
  const e = f.errors;
  const residential = d.propertyType && d.propertyType !== 'commercial';
  const paintOnly = isRenoPaintOnly(d);
  return (
    <StepScreen index={1}>
      <h2 className="h-title">About the property</h2>
      <p className="h-sub">Quick taps — this helps estimate the work.</p>
      <Section title="Property type" error={e.propertyType}>
        <ChipGroup label="Property type" options={RENO_PROPERTY_TYPES} value={d.propertyType} onChange={(v) => f.update({ propertyType: v, bhk: v === 'commercial' ? undefined : d.bhk })} invalid={!!e.propertyType} />
      </Section>
      {residential && (
        <Section title="Size" error={e.bhk}>
          <ChipGroup label="Property size" options={BHK} value={d.bhk} onChange={(v) => f.update({ bhk: v })} invalid={!!e.bhk} />
        </Section>
      )}
      <AreaField required={areaRequired(d)} />
      {paintOnly ? (
        <Section title="Painting scope" error={e.paintScope}>
          <Segmented label="Painting scope" options={PAINT_SCOPE} value={d.paintScope} onChange={(v) => f.update({ paintScope: v })} invalid={!!e.paintScope} />
        </Section>
      ) : (
        <Section title="Property age" optional>
          <ChipGroup label="Property age" options={PROPERTY_AGE} value={d.age} onChange={(v) => f.update({ age: v })} />
        </Section>
      )}
      <Section title="Is someone living there now?" error={e.occupied} helper="Affects work hours, dust control and timelines.">
        <Segmented
          label="Occupied"
          options={[
            { id: 'yes', label: p === 'ios' ? 'Yes, occupied' : 'Yes' },
            { id: 'no', label: p === 'ios' ? 'No, vacant' : 'No' },
          ]}
          value={d.occupied}
          onChange={(v) => f.update({ occupied: v as 'yes' | 'no' })}
          invalid={!!e.occupied}
        />
      </Section>
    </StepScreen>
  );
}

/** S06 — Renovation requirements & budget. */
export function RequirementsStep() {
  const f = useFlow();
  const d = f.draft;
  const e = f.errors;
  return (
    <StepScreen index={2}>
      <h2 className="h-title">Your requirements</h2>
      <p className="h-sub">Describe the result you want. Photos of the current space help a lot.</p>
      <Description label="What would you like done?" />
      <Section title="Budget range" error={e.budget}>
        <ChipGroup label="Budget" options={budgetOptions('renovation', undefined, d.renoAreas)} value={d.budget} onChange={(v) => f.update({ budget: v })} invalid={!!e.budget} />
      </Section>
      <Section title="Preferred start" error={e.timeline}>
        <ChipGroup label="Preferred start" options={TIMELINES_RENO} value={d.timeline} onChange={(v) => f.update({ timeline: v })} invalid={!!e.timeline} />
      </Section>
      <Section title={d.renoAreas.includes('structural') ? 'Photos & existing plans' : 'Photos of the current space'} optional>
        <Uploader allowPdf={d.renoAreas.includes('structural')} />
      </Section>
      {d.attachments.length === 0 && (
        <div style={{ marginTop: 12 }}>
          <Banner kind="info">Requirements with photos usually get more accurate quotes.</Banner>
        </div>
      )}
    </StepScreen>
  );
}
