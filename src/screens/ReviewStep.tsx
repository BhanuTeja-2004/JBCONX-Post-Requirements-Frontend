import { useState, type ReactNode } from 'react';
import { Card, CheckRow, ErrorText, TextField } from '../components/Controls';
import { Icon } from '../components/Icon';
import {
  categoryById,
  CONTRACTOR_TYPES,
  DEMO_USER,
  DRAWINGS,
  PAINT_SCOPE,
  PROFESSIONS,
  PROJECT_STAGE,
  PROPERTY_TYPES,
  RENO_AREAS,
  SITE_VISIT,
  TIME_SLOTS,
  TIMELINES_CONTRACTOR,
  TIMELINES_RENO,
  URGENCY,
} from '../data/catalog';
import type { Draft } from '../data/types';
import { useFlow } from '../navigation/flow';
import { validateContact } from '../services/validation';
import { dateLabel, formatAddress } from './LocationStep';
import { StepScreen } from './StepScreen';

const lbl = (list: { id: string; label: string }[], id?: string) => list.find((x) => x.id === id)?.label ?? id ?? '—';
export const maskPhone = (p: string) => (p.length === 10 ? `+91 ${p.slice(0, 2)}•••••${p.slice(7)}` : `+91 ${p}`);

function Sec({ title, onEdit, children }: { title: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <Card className="rev-sec">
      <div className="rev-head">
        <h4>{title}</h4>
        {onEdit && (
          <button className="edit" onClick={onEdit} aria-label={`Edit ${title}`}>
            <Icon name="edit" size={16} /> Edit
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}

function KV({ rows }: { rows: [string, ReactNode | undefined][] }) {
  return (
    <dl className="kv" style={{ margin: 0 }}>
      {rows
        .filter(([, v]) => v !== undefined && v !== '' && v !== null)
        .map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
    </dl>
  );
}

export function summaryRows(d: Draft): { title: string; step: number; rows: [string, ReactNode | undefined][] }[] {
  const out: { title: string; step: number; rows: [string, ReactNode | undefined][] }[] = [];
  const area = d.area ? `${Number(d.area).toLocaleString('en-IN')} sq ft` : undefined;
  if (d.category === 'individual') {
    out.push({ title: 'Service', step: 0, rows: [['Professional', lbl(PROFESSIONS, d.profession)], ['Service', d.service]] });
    out.push({
      title: 'Details',
      step: 1,
      rows: [
        ['Description', <span style={{ whiteSpace: 'pre-wrap' }}>{d.description}</span>],
        ['Urgency', d.urgency ? lbl(URGENCY, d.urgency) : undefined],
        ['Project stage', d.stage ? lbl(PROJECT_STAGE, d.stage) : undefined],
        ['Budget', d.budget],
        ['Photos', d.attachments.length ? `${d.attachments.length} attached` : 'None'],
      ],
    });
    out.push({
      title: 'Location & time',
      step: 2,
      rows: [
        ['Address', d.address ? formatAddress(d.address) : undefined],
        ['When', d.urgency === 'emergency' ? 'As soon as possible (today)' : d.date ? `${dateLabel(d.date)} · ${lbl(TIME_SLOTS, d.timeSlot)}` : undefined],
      ],
    });
  } else if (d.category === 'contractor') {
    out.push({ title: 'Service', step: 0, rows: [['Contractor', lbl(CONTRACTOR_TYPES, d.contractorType)], ['Project', d.projectType]] });
    out.push({
      title: 'Project details',
      step: 1,
      rows: [
        ['Property', lbl(PROPERTY_TYPES, d.propertyType)],
        ['Area', area],
        ['Floors', d.floors],
        ['Scope', <span style={{ whiteSpace: 'pre-wrap' }}>{d.description}</span>],
        ['Budget', d.budget],
        ['Start', lbl(TIMELINES_CONTRACTOR, d.timeline)],
        ['Drawings', d.drawings ? lbl(DRAWINGS, d.drawings) : undefined],
        ['Files', d.attachments.length ? `${d.attachments.length} attached` : 'None'],
      ],
    });
    out.push({ title: 'Site', step: 2, rows: [['Address', d.address ? formatAddress(d.address) : undefined], ['Site visit', lbl(SITE_VISIT, d.siteVisit)]] });
  } else {
    out.push({ title: 'Renovation', step: 0, rows: [['Areas', d.renoAreas.map((a) => lbl(RENO_AREAS, a)).join(', ')]] });
    out.push({
      title: 'Property',
      step: 1,
      rows: [
        ['Type', lbl(PROPERTY_TYPES, d.propertyType)],
        ['Size', d.bhk],
        ['Area', area],
        ['Age', d.age],
        ['Painting', d.paintScope ? lbl(PAINT_SCOPE, d.paintScope) : undefined],
        ['Occupied', d.occupied === 'yes' ? 'Yes' : d.occupied === 'no' ? 'No, vacant' : undefined],
      ],
    });
    out.push({
      title: 'Requirements',
      step: 2,
      rows: [
        ['Description', <span style={{ whiteSpace: 'pre-wrap' }}>{d.description}</span>],
        ['Budget', d.budget],
        ['Start', lbl(TIMELINES_RENO, d.timeline)],
        ['Photos', d.attachments.length ? `${d.attachments.length} attached` : 'None'],
      ],
    });
    out.push({ title: 'Location', step: 3, rows: [['Address', d.address ? formatAddress(d.address) : undefined]] });
  }
  return out;
}

/** S10 — Review & submit, with contact details and consent. */
export function ReviewStep() {
  const f = useFlow();
  const d = f.draft;
  const cat = categoryById(d.category)!;
  const index = cat.steps.length - 1;
  const [editContact, setEditContact] = useState(!f.demo.signedIn);
  const [touchedC, setTouchedC] = useState<Record<string, boolean>>({});
  const cErr = validateContact(d.contact);
  const showErr = (k: string) => (f.errors[k] || touchedC[k] ? cErr[k] : undefined);
  const setC = (k: 'name' | 'phone' | 'email') => (v: string) => f.update({ contact: { ...d.contact, [k]: k === 'phone' ? v.replace(/\D/g, '').slice(0, 10) : v } });
  const blurC = (k: string) => () => setTouchedC((t) => ({ ...t, [k]: true }));
  const verify = f.needsVerification();
  const phoneChanged = f.demo.signedIn && d.contact.phone !== DEMO_USER.phone;
  const contactInvalid = !!(f.errors.name || f.errors.phone || f.errors.email);

  return (
    <StepScreen
      index={index}
      primaryLabel={verify ? 'Continue to verify' : 'Submit requirement'}
      onPrimary={() => {
        if (Object.keys(cErr).length) setEditContact(true);
        f.submit();
      }}
      footerNote={
        f.demo.offline ? (
          <span style={{ color: 'var(--c-error)' }}>You’re offline — connect to submit</span>
        ) : verify ? (
          'We’ll text a code to confirm your number'
        ) : (
          'You can edit or cancel after submitting'
        )
      }
    >
      <h2 className="h-title">Review your requirement</h2>
      <p className="h-sub">Check everything before you submit.</p>

      {summaryRows(d).map((s) => (
        <Sec key={s.title} title={s.title} onEdit={() => f.editStep(s.step)}>
          <KV rows={s.rows} />
          {s.rows.some(([k]) => k === 'Photos' || k === 'Files') && d.attachments.some((a) => a.url) && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {d.attachments
                .filter((a) => a.url)
                .slice(0, 5)
                .map((a) => (
                  <img key={a.id} src={a.url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                ))}
            </div>
          )}
        </Sec>
      ))}

      <Card className="rev-sec" style={contactInvalid ? { boxShadow: '0 0 0 2px var(--c-error)' } : undefined}>
        <div className="rev-head">
          <h4>Contact details</h4>
          {!editContact && (
            <button className="edit" onClick={() => setEditContact(true)} aria-label="Edit contact details">
              <Icon name="edit" size={16} /> Edit
            </button>
          )}
        </div>
        {!editContact ? (
          <KV
            rows={[
              ['Name', d.contact.name],
              [
                'Mobile',
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {maskPhone(d.contact.phone)}
                  {!phoneChanged && f.demo.signedIn && (
                    <span className="status-chip closed" style={{ padding: '2px 8px' }}>
                      <Icon name="check" size={12} stroke={3} /> Verified
                    </span>
                  )}
                </span>,
              ],
              ['Email', d.contact.email || 'Not added'],
            ]}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }} data-invalid={contactInvalid ? 'true' : undefined}>
            <TextField label="Your name" value={d.contact.name} onChange={setC('name')} onBlur={blurC('name')} error={showErr('name')} autoComplete="name" />
            <TextField
              label="Mobile number"
              value={d.contact.phone}
              onChange={setC('phone')}
              onBlur={blurC('phone')}
              error={showErr('phone')}
              prefix="+91"
              inputMode="numeric"
              type="tel"
              autoComplete="tel-national"
              helper={phoneChanged ? 'You’ll verify this new number with a one-time code' : 'Professionals will call you on this number'}
            />
            <TextField label="Email" optional value={d.contact.email} onChange={setC('email')} onBlur={blurC('email')} error={showErr('email')} inputMode="email" type="email" autoComplete="email" helper="For updates about quotes" />
          </div>
        )}
      </Card>

      <div style={{ marginTop: 4 }} data-invalid={f.errors.consent ? 'true' : undefined}>
        <CheckRow checked={d.consent} onChange={() => f.update({ consent: !d.consent })} invalid={!!f.errors.consent}>
          I agree to share these details with JBCONX and up to 5 matched professionals to get quotes, as described in the{' '}
          <span className="link" role="link">Privacy Notice</span>.
        </CheckRow>
        <ErrorText msg={f.errors.consent} />
      </div>
    </StepScreen>
  );
}
