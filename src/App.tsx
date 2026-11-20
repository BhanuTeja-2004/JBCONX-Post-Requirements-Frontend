import { useEffect, useState } from 'react';
import type { Platform } from './data/types';
import { Gallery } from './gallery/Gallery';
import { FlowContext, useFlowController } from './navigation/flow';
import { PhoneApp } from './navigation/PhoneApp';

type View = 'android' | 'ios' | 'both';
type Mode = 'prototype' | 'gallery';

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className="toggle" role="switch" aria-checked={on} onClick={() => onChange(!on)} style={{ width: '100%', textAlign: 'left', color: 'inherit' }}>
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <span className={`switch ${on ? 'on' : ''}`} />
    </button>
  );
}

function detectPlatform(): View {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'both';
}

export default function App() {
  const flow = useFlowController();
  const [view, setView] = useState<View>(() => {
    const q = new URLSearchParams(location.search).get('platform');
    return q === 'android' || q === 'ios' || q === 'both' ? q : detectPlatform();
  });
  const [mode, setMode] = useState<Mode>(() => (new URLSearchParams(location.search).get('mode') === 'gallery' ? 'gallery' : 'prototype'));
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const h = window.innerHeight - 90;
      setScale(Math.min(1, Math.max(0.6, h / 864)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const platforms: Platform[] = view === 'both' ? ['android', 'ios'] : [view];

  return (
    <FlowContext.Provider value={flow}>
      <div className="workspace">
        <aside className="panel" aria-label="Presenter controls">
          <div>
            <h1>JBCONX · Post Requirements</h1>
            <p style={{ marginTop: 4 }}>Interactive UI/UX prototype · v0.1 · 20 Nov 2026</p>
          </div>
          <div className="demo-badge">
            <b>Prototype — simulated data.</b> No backend, no real SMS, nothing leaves this browser. OTP code: <code>123456</code>
          </div>
          <div>
            <h2>View</h2>
            <div className="seg" role="group" aria-label="Mode">
              <button aria-pressed={mode === 'prototype'} onClick={() => setMode('prototype')}>
                Interactive
              </button>
              <button aria-pressed={mode === 'gallery'} onClick={() => setMode('gallery')}>
                Screen gallery
              </button>
            </div>
          </div>
          {mode === 'prototype' && (
            <>
              <div>
                <h2>Platform</h2>
                <div className="seg" role="group" aria-label="Platform">
                  {(['android', 'ios', 'both'] as View[]).map((v) => (
                    <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
                      {v === 'android' ? 'Android' : v === 'ios' ? 'iOS' : 'Side by side'}
                    </button>
                  ))}
                </div>
                {view === 'both' && <p style={{ marginTop: 8 }}>Both phones share one session — interact with either.</p>}
              </div>
              <div>
                <h2>Demo scenario</h2>
                <Toggle label="Signed in" hint="Off = guest path with OTP" on={flow.demo.signedIn} onChange={(v) => flow.setDemo({ signedIn: v })} />
                <Toggle label="Session expired" hint="Asks to re-verify at submit" on={flow.demo.sessionExpired} onChange={(v) => flow.setDemo({ sessionExpired: v })} />
                <Toggle label="Offline" hint="Shows offline state; blocks submit" on={flow.demo.offline} onChange={(v) => flow.setDemo({ offline: v })} />
                <Toggle label="Fail next submit" hint="Shows failure + safe retry" on={flow.demo.failNextSubmit} onChange={(v) => flow.setDemo({ failNextSubmit: v })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h2>Shortcuts</h2>
                <button className="pbtn" onClick={flow.home}>
                  ⟲ Go to landing screen
                </button>
                <button className="pbtn" onClick={flow.resetAll}>
                  ✕ Reset demo (clear drafts & requirements)
                </button>
              </div>
              <div>
                <h2>Try this</h2>
                <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Tap Continue without filling a step to see validation.</li>
                  <li>Close (✕) mid-flow, then resume the draft from the landing screen.</li>
                  <li>Turn off “Signed in” to walk through OTP.</li>
                  <li>Enter a pincode starting with 9 to see the not-serviceable state.</li>
                </ul>
              </div>
            </>
          )}
          {mode === 'gallery' && <p>Every key screen and state for both platforms, rendered from the same components as the interactive prototype. Use for UI reference exports.</p>}
        </aside>
        {mode === 'prototype' ? (
          <main className="stage">
            {platforms.map((p) => (
              <div className="stage-col" key={p} style={{ zoom: scale } as React.CSSProperties}>
                <div className="stage-label">{p === 'android' ? 'Android · Material 3' : 'iOS · Human Interface Guidelines'}</div>
                <PhoneApp platform={p} />
              </div>
            ))}
          </main>
        ) : (
          <Gallery
            only={(['android', 'ios'] as const).find((x) => x === new URLSearchParams(location.search).get('only'))}
            zoom={Number(new URLSearchParams(location.search).get('zoom')) || undefined}
          />
        )}
      </div>
    </FlowContext.Provider>
  );
}
