import { AppBar, OfflineBar, ShellNav, SystemNav, usePlatform } from '../components/Chrome';
import { Button, Card } from '../components/Controls';
import { Icon } from '../components/Icon';
import { CATEGORIES, categoryById } from '../data/catalog';
import { titleFor, useFlow } from '../navigation/flow';

function ago(ts?: number) {
  if (!ts) return 'just now';
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

/** S01 — Post Requirements landing. One tap on a category starts the flow (no separate Continue). */
export function Landing() {
  const f = useFlow();
  const p = usePlatform();
  const draft = f.savedDraft;
  const draftCat = categoryById(draft?.category);
  const openCount = f.requirements.filter((r) => r.status !== 'cancelled' && r.status !== 'closed').length;

  return (
    <>
      <AppBar
        title={p === 'ios' ? 'Post Requirement' : 'Post Requirements'}
        onBack={() => f.toast('Returns to the JBCONX home screen (outside this prototype)')}
        backLabel="Home"
        largeTitle={p === 'ios'}
        right={
          p === 'android' ? (
            <button className="icon-btn" onClick={f.openList} aria-label="My requirements">
              <Icon name="list" />
            </button>
          ) : (
            <button className="ios-text-btn" onClick={f.openList}>
              My Requests
            </button>
          )
        }
      />
      {f.demo.offline && <OfflineBar />}
      <div className="content">
        <h2 className="h-title" style={{ marginTop: p === 'ios' ? 0 : 4 }}>What do you need help with?</h2>
        <p className="h-sub">Choose a service. Verified professionals will contact you with quotes.</p>

        {draft && draftCat && (
          <Card className="draft-card">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-warning)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Unfinished draft</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titleFor(draft)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-secondary)', marginTop: 2 }}>
                Step {draft.step + 1} of {draftCat.steps.length} · saved {ago(draft.updatedAt)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
              <Button small onClick={f.resumeDraft}>
                Continue
              </Button>
              <button className="btn text sm" style={{ fontSize: 13 }} onClick={() => f.openDialog('discardDraft')}>
                Discard
              </button>
            </div>
          </Card>
        )}

        {CATEGORIES.map((c) => (
          <button key={c.id} className="card cat-card" onClick={() => f.startCategory(c.id)} aria-label={`${c.title}. ${c.description}. ${c.effort}`}>
            <span className="cat-art" style={{ background: c.tint }}>
              <Icon name={c.icon} size={34} stroke={1.6} />
            </span>
            <span className="cat-body">
              <span className="cat-title" style={{ display: 'block' }}>{c.title}</span>
              <span className="cat-desc" style={{ display: 'block' }}>{c.description}</span>
              <span className="cat-ex" style={{ display: 'block' }}>{c.examples}</span>
              <span className="cat-effort">
                <Icon name="clock" size={13} stroke={2.2} /> {c.effort}
              </span>
            </span>
            <Icon name="chevronRight" size={22} color="var(--c-outline-strong)" />
          </button>
        ))}

        <div className="rows" style={{ marginTop: 8 }}>
          <button className="row" onClick={f.openList}>
            <span className="lead">
              <Icon name="doc" size={22} />
            </span>
            <span className="grow">
              <span className="t" style={{ display: 'block' }}>My requirements</span>
              <span className="s" style={{ display: 'block' }}>{openCount ? `${openCount} active` : 'Track what you’ve posted'}</span>
            </span>
            <Icon name="chevronRight" size={20} color="var(--c-outline-strong)" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 20, padding: '0 4px', color: 'var(--c-text-secondary)', fontSize: 12.5, lineHeight: '18px' }}>
          <Icon name="shieldCheck" size={20} color="var(--c-success)" />
          <span>Your phone number is shared only with professionals matched to your requirement.</span>
        </div>
      </div>
      <ShellNav />
      <SystemNav />
    </>
  );
}
