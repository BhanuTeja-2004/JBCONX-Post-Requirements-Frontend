import { AppBar, BottomBar, OfflineBar, SystemNav, usePlatform } from '../components/Chrome';
import { Banner, Button, Card } from '../components/Controls';
import { Icon } from '../components/Icon';
import { categoryById } from '../data/catalog';
import type { ReqStatus, Requirement } from '../data/types';
import { useFlow } from '../navigation/flow';
import { summaryRows } from './ReviewStep';

const STATUS_LABEL: Record<ReqStatus, string> = {
  submitted: 'Submitted',
  review: 'Under review',
  matched: 'Matched',
  quotes: 'Quotes received',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export function StatusChip({ s }: { s: ReqStatus }) {
  return <span className={`status-chip ${s}`}>{STATUS_LABEL[s]}</span>;
}

const fmtDate = (ts: number) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** S16 — Confirmation. */
export function SuccessScreen({ id }: { id: string }) {
  const f = useFlow();
  const req = f.requirements.find((r) => r.id === id);
  return (
    <>
      <AppBar title="Requirement sent" onBack={f.home} backLabel="Post" />
      <div className="content" style={{ background: '#fff' }}>
        <div className="success-hero">
          <div className="success-icon">
            <Icon name="check" size={44} stroke={2.6} />
          </div>
          <h2 className="h-title" style={{ fontSize: 24 }}>Requirement submitted</h2>
          <p className="h-sub" style={{ margin: '6px 0 0' }}>{req?.title}</p>
        </div>
        <Card className="ref-box" style={{ background: 'var(--c-surface-variant)', boxShadow: 'none' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>Reference number</div>
            <div className="id">{id}</div>
          </div>
          <button className="btn text sm" onClick={() => f.toast('Reference copied')} aria-label="Copy reference number">
            Copy
          </button>
        </Card>
        <h3 style={{ fontSize: 16, margin: '8px 0 14px' }}>What happens next</h3>
        <ol className="next-steps">
          <li>
            <span className="n">1</span>
            <span>
              <b>We review your requirement</b>
              <br />
              <span style={{ color: 'var(--c-text-secondary)' }}>Usually within a few hours.</span>
            </span>
          </li>
          <li>
            <span className="n">2</span>
            <span>
              <b>Up to 5 verified professionals contact you</b>
              <br />
              <span style={{ color: 'var(--c-text-secondary)' }}>Typically within 24 hours, by call or in the app.</span>
            </span>
          </li>
          <li>
            <span className="n">3</span>
            <span>
              <b>Compare quotes and choose</b>
              <br />
              <span style={{ color: 'var(--c-text-secondary)' }}>Track everything in My requirements.</span>
            </span>
          </li>
        </ol>
        <p className="helper" style={{ marginTop: 18 }}>Timelines shown are placeholders pending JBCONX approval (PD-07).</p>
      </div>
      <BottomBar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button
            block
            onClick={() => {
              f.home();
              f.go({ name: 'detail', id });
            }}
          >
            Track requirement
          </Button>
          <Button block variant="text" small onClick={f.home}>
            Post another requirement
          </Button>
        </div>
      </BottomBar>
      <SystemNav />
    </>
  );
}

/** S15 — Submission failed (retry uses the same idempotency key → no duplicates). */
export function FailedScreen() {
  const f = useFlow();
  return (
    <>
      <AppBar title="Not submitted" onBack={f.back} backLabel="Review" />
      {f.demo.offline && <OfflineBar />}
      <div className="content">
        <div className="empty">
          <div className="ic" style={{ background: 'var(--c-error-container)', color: 'var(--c-error)' }}>
            <Icon name="wifiOff" size={34} />
          </div>
          <h3>We couldn’t submit your requirement</h3>
          <p>The connection dropped before we got a response. Your details are saved on this phone.</p>
        </div>
        <Banner kind="info">
          Retrying is safe — if the first attempt actually went through, you won’t get a duplicate.
        </Banner>
      </div>
      <BottomBar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button block onClick={f.retrySubmit} icon="refresh">
            Try again
          </Button>
          <Button block variant="text" small onClick={f.home}>
            Save draft & exit
          </Button>
        </div>
      </BottomBar>
      <SystemNav />
    </>
  );
}

function ReqCard({ r, onOpen }: { r: Requirement; onOpen: () => void }) {
  const c = categoryById(r.draft.category);
  return (
    <button className="card" style={{ width: '100%', textAlign: 'left', padding: 16, marginBottom: 12, display: 'block' }} onClick={onOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{c?.title}</div>
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 2, lineHeight: '21px' }}>{r.title}</div>
        </div>
        <StatusChip s={r.status} />
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12.5, color: 'var(--c-text-secondary)' }}>
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          <Icon name="doc" size={14} /> {r.id}
        </span>
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          <Icon name="clock" size={14} /> {fmtDate(r.createdAt)}
        </span>
      </div>
    </button>
  );
}

/** S17 — My requirements (loading, empty, list). */
export function ListScreen() {
  const f = useFlow();
  const p = usePlatform();
  return (
    <>
      <AppBar title="My requirements" onBack={f.back} backLabel="Post" largeTitle={p === 'ios'} />
      {f.demo.offline && <OfflineBar />}
      <div className="content">
        {f.ui.listLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: 16, marginBottom: 12 }} aria-hidden>
              <div className="skel" style={{ width: '40%', height: 12 }} />
              <div className="skel" style={{ width: '80%', height: 16, marginTop: 10 }} />
              <div className="skel" style={{ width: '55%', height: 12, marginTop: 12 }} />
            </div>
          ))
        ) : f.requirements.length === 0 ? (
          <div className="empty">
            <div className="ic">
              <Icon name="doc" size={34} />
            </div>
            <h3>No requirements yet</h3>
            <p>When you post a requirement, you can track its progress and quotes here.</p>
            <Button onClick={f.home}>Post a requirement</Button>
          </div>
        ) : (
          f.requirements.map((r) => <ReqCard key={r.id} r={r} onOpen={() => f.go({ name: 'detail', id: r.id })} />)
        )}
        {f.ui.listLoading && <span className="sr-only">Loading requirements</span>}
      </div>
      <SystemNav />
    </>
  );
}

/** S18 — Requirement detail with status timeline. */
export function DetailScreen({ id }: { id: string }) {
  const f = useFlow();
  const r = f.requirements.find((x) => x.id === id);
  if (!r) return null;
  const order: ReqStatus[] = ['submitted', 'review', 'matched', 'quotes', 'closed'];
  const cur = r.status === 'cancelled' ? -1 : order.indexOf(r.status);
  const steps = [
    { t: 'Submitted', s: fmtDate(r.createdAt) },
    { t: 'Under review', s: 'JBCONX checks the details' },
    { t: 'Matched with professionals', s: 'Up to 5 verified professionals' },
    { t: 'Quotes received', s: 'Compare and choose' },
    { t: 'Closed', s: 'Work awarded or requirement closed' },
  ];
  return (
    <>
      <AppBar title="Requirement" onBack={f.back} backLabel="Back" />
      <div className="content">
        <Card style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{r.id}</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{r.title}</div>
            </div>
            <StatusChip s={r.status} />
          </div>
        </Card>
        {r.status === 'cancelled' ? (
          <Banner kind="info">This requirement was cancelled. Professionals can no longer see it.</Banner>
        ) : (
          <Card style={{ padding: 16, marginBottom: 12 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 15 }}>Progress</h4>
            <ol className="timeline">
              {steps.map((s, i) => (
                <li key={s.t} className={i < cur ? 'done' : i === cur ? 'current' : 'pending'}>
                  <span className="dot">{i < cur ? <Icon name="check" size={14} stroke={3} /> : null}</span>
                  <span>
                    <div className="tl-t">{s.t}</div>
                    <div className="tl-s">{s.s}</div>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        )}
        {summaryRows(r.draft).map((s) => (
          <Card key={s.title} className="rev-sec">
            <div className="rev-head" style={{ minHeight: 24 }}>
              <h4>{s.title}</h4>
            </div>
            <dl className="kv" style={{ margin: 0 }}>
              {s.rows
                .filter(([, v]) => v !== undefined && v !== '')
                .map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </Card>
        ))}
      </div>
      {r.status !== 'cancelled' && r.status !== 'closed' && (
        <BottomBar>
          <Button block variant="outlined" onClick={() => f.openDialog('cancelReq')}>
            Cancel requirement
          </Button>
        </BottomBar>
      )}
      <SystemNav />
    </>
  );
}
