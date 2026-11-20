import { useState } from 'react';
import { usePlatform } from '../components/Chrome';
import { Banner, Button, Card, ChipGroup, Section, Sheet, TextField } from '../components/Controls';
import { Icon } from '../components/Icon';
import { categoryById, DEMO_CURRENT_LOCATION, SAVED_ADDRESSES, SITE_VISIT, TIME_SLOTS } from '../data/catalog';
import type { Address, Errors } from '../data/types';
import { useFlow } from '../navigation/flow';
import { isServiceable, validateAddress } from '../services/validation';
import { StepScreen } from './StepScreen';

const fmt = (a: Address) => [a.house, a.street, a.area, a.city].filter(Boolean).join(', ') + ` – ${a.pincode}`;

function dateLabel(v?: string) {
  if (!v) return '';
  if (v === 'today') return 'Today';
  if (v === 'tomorrow') return 'Tomorrow';
  const dt = new Date(v + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
export { dateLabel, fmt as formatAddress };

/** S07 — Location (+ date & time for individual professionals, site-visit preference for contractors). */
export function LocationStep() {
  const f = useFlow();
  const p = usePlatform();
  const d = f.draft;
  const e = f.errors;
  const index = (categoryById(d.category)?.steps.length ?? 4) - 2;
  const [prefill, setPrefill] = useState<Partial<Address> | null>(null);
  const [locating, setLocating] = useState(false);

  const today = new Date();
  const iso = (dt: Date) => dt.toISOString().slice(0, 10);
  const maxDate = new Date(today.getTime() + 365 * 864e5);

  const useCurrent = () => {
    f.closeOverlays();
    setLocating(true);
    window.setTimeout(() => {
      setLocating(false);
      setPrefill({ ...DEMO_CURRENT_LOCATION });
      f.openSheet('address');
    }, 900);
  };

  const title = d.category === 'individual' ? 'Where and when?' : d.category === 'contractor' ? 'Where is the site?' : 'Where is the property?';
  return (
    <>
      <StepScreen index={index}>
        <h2 className="h-title">{title}</h2>
        <p className="h-sub">Only your area is shown to professionals until you choose to share more.</p>

        <Section title="Address" error={e.address}>
          {d.address ? (
            <Card style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Icon name="location" color="var(--c-primary)" />
                <div style={{ flex: 1, fontSize: 14.5, lineHeight: '20px' }}>
                  {d.address.label && <div style={{ fontWeight: 600 }}>{d.address.label}</div>}
                  {fmt(d.address)}
                </div>
                <button className="btn text sm" onClick={() => f.update({ address: undefined })}>
                  Change
                </button>
              </div>
              {isServiceable(d.address.pincode) ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10, color: 'var(--c-success)', fontSize: 13, fontWeight: 500 }}>
                  <Icon name="check" size={16} stroke={2.4} /> We serve this area
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <Banner kind="warning">
                    <b>Not available in {d.address.pincode} yet.</b> We’re expanding — tap Notify me and we’ll tell you when we launch here.
                    <div style={{ marginTop: 8 }}>
                      <button className="link" onClick={() => f.toast('We’ll notify you (demo)')}>Notify me</button>
                    </div>
                  </Banner>
                </div>
              )}
            </Card>
          ) : (
            <div className="rows card" data-invalid={e.address ? 'true' : undefined}>
              {f.demo.signedIn &&
                SAVED_ADDRESSES.map((a) => (
                  <button key={a.label} className="row" onClick={() => f.update({ address: a })}>
                    <span className="lead">
                      <Icon name={a.label === 'Home' ? 'home' : 'building'} size={22} />
                    </span>
                    <span className="grow">
                      <span className="t" style={{ display: 'block' }}>{a.label}</span>
                      <span className="s" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmt(a)}</span>
                    </span>
                  </button>
                ))}
              <button className="row" onClick={() => f.openSheet('permission')} disabled={locating}>
                <span className="lead">{locating ? <span className="spinner" /> : <Icon name="gps" size={22} />}</span>
                <span className="grow">
                  <span className="t" style={{ display: 'block' }}>{locating ? 'Finding your location…' : 'Use current location'}</span>
                  <span className="s" style={{ display: 'block' }}>You can adjust the details</span>
                </span>
              </button>
              <button
                className="row"
                onClick={() => {
                  setPrefill({});
                  f.openSheet('address');
                }}
              >
                <span className="lead">
                  <Icon name="edit" size={22} />
                </span>
                <span className="grow">
                  <span className="t" style={{ display: 'block' }}>Enter address manually</span>
                </span>
              </button>
            </div>
          )}
        </Section>

        {d.category === 'individual' &&
          (d.urgency === 'emergency' ? (
            <div style={{ marginTop: 20 }}>
              <Banner kind="info" icon="clock">
                <b>Emergency request.</b> We’ll ask available professionals to call you as soon as possible today.
              </Banner>
            </div>
          ) : (
            <>
              <Section title="Preferred date" error={e.date}>
                <div className="chips" role="radiogroup" aria-label="Preferred date">
                  {['today', 'tomorrow'].map((v) => (
                    <button key={v} className="chip" role="radio" aria-checked={d.date === v} onClick={() => f.update({ date: v })}>
                      {d.date === v && p === 'android' && <Icon name="check" size={18} stroke={2.2} />}
                      {dateLabel(v)}
                    </button>
                  ))}
                  <label className="chip" role="radio" aria-checked={!!d.date && d.date !== 'today' && d.date !== 'tomorrow'} style={{ position: 'relative', cursor: 'pointer' }}>
                    <Icon name="calendar" size={18} />
                    {d.date && d.date !== 'today' && d.date !== 'tomorrow' ? dateLabel(d.date) : 'Pick a date'}
                    <input
                      type="date"
                      aria-label="Pick a date"
                      min={iso(today)}
                      max={iso(maxDate)}
                      value={d.date && d.date.length === 10 ? d.date : ''}
                      onChange={(ev) => ev.target.value && f.update({ date: ev.target.value })}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </Section>
              <Section title="Time window" error={e.timeSlot}>
                <ChipGroup label="Time window" options={TIME_SLOTS} value={d.timeSlot} onChange={(v) => f.update({ timeSlot: v })} invalid={!!e.timeSlot} />
              </Section>
            </>
          ))}

        {d.category === 'contractor' && (
          <Section title="Best time for a site visit" error={e.siteVisit}>
            <ChipGroup label="Site visit" options={SITE_VISIT} value={d.siteVisit} onChange={(v) => f.update({ siteVisit: v })} invalid={!!e.siteVisit} />
          </Section>
        )}
      </StepScreen>

      {f.ui.sheet === 'permission' && (
        <Sheet title={p === 'ios' ? 'Location' : 'Use your location?'} onClose={f.closeOverlays}>
          <div style={{ textAlign: 'center', padding: '4px 8px 8px' }}>
            <div className="empty" style={{ padding: '8px 0 0' }}>
              <div className="ic">
                <Icon name="location" size={34} />
              </div>
            </div>
            <p style={{ fontSize: 15, lineHeight: '21px', margin: '0 0 6px' }}>JBCONX uses your location once to fill in the address. It isn’t tracked.</p>
            <p style={{ fontSize: 13, color: 'var(--c-text-secondary)', margin: '0 0 20px' }}>Next, your phone will ask for permission. Demo: a sample location is used.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button block onClick={useCurrent}>
                Continue
              </Button>
              <Button
                block
                variant="text"
                onClick={() => {
                  setPrefill({});
                  f.openSheet('address');
                }}
              >
                Enter address manually
              </Button>
            </div>
          </div>
        </Sheet>
      )}

      {f.ui.sheet === 'address' && (
        <AddressSheet
          initial={prefill ?? d.address ?? {}}
          onSave={(a) => {
            f.update({ address: a });
            f.closeOverlays();
          }}
          onClose={f.closeOverlays}
        />
      )}
    </>
  );
}

/** S08 — Manual address entry sheet. */
function AddressSheet({ initial, onSave, onClose }: { initial: Partial<Address>; onSave: (a: Address) => void; onClose: () => void }) {
  const p = usePlatform();
  const [a, setA] = useState<Partial<Address>>(initial);
  const [shown, setShown] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const errs = validateAddress(a);
  const err = (k: keyof Address) => (tried || shown[k] ? errs[k] : undefined);
  const set = (k: keyof Address) => (v: string) => setA((x) => ({ ...x, [k]: k === 'pincode' ? v.replace(/\D/g, '').slice(0, 6) : v }));
  const blur = (k: keyof Address) => () => setShown((s) => ({ ...s, [k]: 'y' }));
  const save = () => {
    setTried(true);
    if (Object.keys(errs).length === 0) onSave(a as Address);
  };
  const fields = (
    <>
      <TextField label="House / flat / plot no." value={a.house ?? ''} onChange={set('house')} onBlur={blur('house')} error={err('house')} autoComplete="address-line1" autoFocus={!initial.street} />
      <TextField label="Street / road" value={a.street ?? ''} onChange={set('street')} onBlur={blur('street')} error={err('street')} autoComplete="address-line2" />
      <TextField label="Area / locality" value={a.area ?? ''} onChange={set('area')} onBlur={blur('area')} error={err('area')} />
      <TextField label="City" value={a.city ?? ''} onChange={set('city')} onBlur={blur('city')} error={err('city')} autoComplete="address-level2" />
      <TextField label="Pincode" value={a.pincode ?? ''} onChange={set('pincode')} onBlur={blur('pincode')} error={err('pincode')} inputMode="numeric" autoComplete="postal-code" helper="6 digits" />
    </>
  );
  return (
    <Sheet title="Service address" onClose={onClose} footer={<Button block onClick={save}>Save address</Button>}>
      {initial.street && (
        <div style={{ marginBottom: 14 }}>
          <Banner kind="info" icon="gps">
            Location found. Add your house or flat number.
          </Banner>
        </div>
      )}
      {p === 'ios' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{fields}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 6 }}>{fields}</div>
      )}
    </Sheet>
  );
}
