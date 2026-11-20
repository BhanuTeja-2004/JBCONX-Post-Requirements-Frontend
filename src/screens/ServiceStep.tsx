import { useState } from 'react';
import { Banner, ChipGroup, Section, TextField, Tiles } from '../components/Controls';
import { Icon } from '../components/Icon';
import { CONTRACTOR_TYPES, PROFESSIONS, PROJECT_TYPES, RENO_AREAS, SERVICES } from '../data/catalog';
import { useFlow } from '../navigation/flow';
import { StepScreen } from './StepScreen';

/** S02 — Service selection. Questions differ by category. */
export function ServiceStep() {
  const f = useFlow();
  const d = f.draft;
  const e = f.errors;
  const [q, setQ] = useState('');

  if (d.category === 'individual') {
    const list = q.trim()
      ? PROFESSIONS.filter((p) => p.label.toLowerCase().includes(q.trim().toLowerCase()) || (SERVICES[p.id] ?? []).some((s) => s.toLowerCase().includes(q.trim().toLowerCase())))
      : PROFESSIONS;
    const services = d.profession ? SERVICES[d.profession] : [];
    return (
      <StepScreen index={0}>
        <h2 className="h-title">Who do you need?</h2>
        <p className="h-sub">Pick a professional, then the job.</p>
        <TextField label="Search" value={q} onChange={setQ} placeholder="e.g. fan installation, leak, plan" prefix={<Icon name="search" size={20} />} />
        <Section title="Professional" error={e.profession}>
          {list.length ? (
            <Tiles
              label="Professional"
              options={list}
              value={d.profession}
              onChange={(v) => f.update({ profession: v, service: v === 'other' ? 'Describe in details' : undefined, urgency: undefined, stage: undefined })}
            />
          ) : (
            <Banner kind="info">
              No match for “{q}”. Choose <b>Other</b> and describe what you need.
            </Banner>
          )}
        </Section>
        {d.profession && services.length > 1 && (
          <Section title="What do you need done?" error={e.service}>
            <ChipGroup label="Service" options={services} value={d.service} onChange={(v) => f.update({ service: v })} invalid={!!e.service} />
          </Section>
        )}
      </StepScreen>
    );
  }

  if (d.category === 'contractor') {
    return (
      <StepScreen index={0}>
        <h2 className="h-title">What kind of contractor?</h2>
        <p className="h-sub">Choose the type of work. You’ll describe the project next.</p>
        <Section title="Contractor type" error={e.contractorType}>
          <div className="rows card" role="radiogroup" aria-label="Contractor type">
            {CONTRACTOR_TYPES.map((c) => {
              const on = d.contractorType === c.id;
              return (
                <button key={c.id} className={`row ${on ? 'selected' : ''}`} role="radio" aria-checked={on} onClick={() => f.update({ contractorType: c.id, projectType: undefined, area: undefined, floors: undefined })}>
                  <span className="lead">
                    <Icon name={c.icon ?? 'more'} size={22} />
                  </span>
                  <span className="grow">
                    <span className="t" style={{ display: 'block' }}>{c.label}</span>
                    <span className="s" style={{ display: 'block' }}>{c.hint}</span>
                  </span>
                  <span className={`radio ${on ? 'on' : ''}`} />
                </button>
              );
            })}
          </div>
        </Section>
        {d.contractorType && (
          <Section title="Project type" error={e.projectType}>
            <ChipGroup label="Project type" options={PROJECT_TYPES[d.contractorType]} value={d.projectType} onChange={(v) => f.update({ projectType: v, budget: undefined })} invalid={!!e.projectType} />
          </Section>
        )}
      </StepScreen>
    );
  }

  // renovation
  return (
    <StepScreen index={0}>
      <h2 className="h-title">What would you like to renovate?</h2>
      <p className="h-sub">Select all that apply.</p>
      <Section title="Areas" error={e.renoAreas} helper={d.renoAreas.length ? `${d.renoAreas.length} selected` : undefined}>
        <Tiles
          label="Areas to renovate"
          multi
          cols={3}
          options={RENO_AREAS}
          value={d.renoAreas}
          onChange={(v) => {
            let next = d.renoAreas.includes(v) ? d.renoAreas.filter((x) => x !== v) : [...d.renoAreas, v];
            if (v === 'full' && next.includes('full')) next = ['full', ...next.filter((x) => x === 'structural' || x === 'exterior')];
            else if (v !== 'full' && ['kitchen', 'bathroom', 'bedroom', 'living'].includes(v)) next = next.filter((x) => x !== 'full');
            f.update({ renoAreas: next, budget: undefined, paintScope: undefined });
          }}
        />
      </Section>
      {d.renoAreas.includes('structural') && (
        <div style={{ marginTop: 16 }}>
          <Banner kind="warning">
            <b>Site inspection needed.</b> Structural changes need a check by a qualified structural engineer before any work starts. You can upload existing plans in a later step.
          </Banner>
        </div>
      )}
    </StepScreen>
  );
}
