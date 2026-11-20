/** Device frame + platform chrome (status bar, app/navigation bar, progress, bottom bar, system navigation). */
import { createContext, useContext, type ReactNode } from 'react';
import type { Platform } from '../data/types';
import { Icon } from './Icon';

export const PlatformContext = createContext<Platform>('android');
export const usePlatform = () => useContext(PlatformContext);

export function Device({ platform, children, statusBg }: { platform: Platform; children: ReactNode; statusBg?: string }) {
  return (
    <PlatformContext.Provider value={platform}>
      <div
        className={`device p-${platform}`}
        style={{ ['--sb-bg' as string]: statusBg ?? '#fff' }}
        role="region"
        aria-label={`${platform === 'android' ? 'Android' : 'iOS'} prototype screen`}
      >
        <StatusBar platform={platform} />
        {children}
      </div>
    </PlatformContext.Provider>
  );
}

function StatusBar({ platform }: { platform: Platform }) {
  return (
    <div className="statusbar" aria-hidden>
      {platform === 'ios' ? <div className="island" /> : <div className="camera-dot" />}
      <span>9:41</span>
      <span className="sb-icons">
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></g></svg>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2.2 0 4.2.8 5.7 2.2l1.1-1.2A10 10 0 0 0 7.5.5 10 10 0 0 0 .7 3.2l1.1 1.2a8.4 8.4 0 0 1 5.7-2.2Zm0 3.3c1.3 0 2.5.5 3.4 1.3l1.1-1.2a6.6 6.6 0 0 0-9 0l1.1 1.2c.9-.8 2.1-1.3 3.4-1.3Zm0 3.3c.5 0 .9.2 1.2.5L7.5 10.6 6.3 9.3c.3-.3.7-.5 1.2-.5Z" fill="currentColor" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" /><path d="M23 4v4c.8-.3 1.3-1.1 1.3-2S23.8 4.3 23 4Z" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  );
}

export function SystemNav() {
  return (
    <div className="sysnav" aria-hidden>
      <i />
    </div>
  );
}

export interface AppBarProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  onClose?: () => void;
  right?: ReactNode;
  largeTitle?: boolean;
}

export function AppBar({ title, onBack, backLabel = 'Back', onClose, right, largeTitle }: AppBarProps) {
  const p = usePlatform();
  if (p === 'android') {
    return (
      <header className="appbar">
        {onBack ? (
          <button className="icon-btn" onClick={onBack} aria-label="Navigate up">
            <Icon name="arrowBack" />
          </button>
        ) : (
          <span style={{ width: 12 }} />
        )}
        <h1 className="title" style={{ margin: 0 }}>{title}</h1>
        {right}
        {onClose && (
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        )}
      </header>
    );
  }
  return (
    <>
      <header className="appbar">
        {onBack ? (
          <button className="ios-back" onClick={onBack} aria-label={backLabel}>
            <Icon name="chevronLeft" size={28} stroke={2.2} />
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        {!largeTitle && <h1 className="title" style={{ margin: 0 }}>{title}</h1>}
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {right}
          {onClose && (
            <button className="ios-text-btn" onClick={onClose}>
              Cancel
            </button>
          )}
        </span>
      </header>
      {largeTitle && <h1 className="ios-large-title" style={{ margin: 0 }}>{title}</h1>}
    </>
  );
}

export function Progress({ step, total, label, saved }: { step: number; total: number; label: string; saved?: boolean }) {
  const p = usePlatform();
  return (
    <div className="progress-wrap" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-valuetext={`Step ${step} of ${total}, ${label}`}>
      <div className="progress-text">
        <span>
          Step {step} of {total} · <b>{label}</b>
        </span>
        {saved && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-success)', fontSize: 12 }}>
            <Icon name="check" size={14} stroke={2.4} /> Draft saved
          </span>
        )}
      </div>
      {p === 'android' ? (
        <div className="linear">
          <span style={{ width: `${(step / total) * 100}%` }} />
        </div>
      ) : (
        <div className="segments">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < step ? 'done' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return <div className="bottombar">{children}</div>;
}

export function OfflineBar() {
  return (
    <div className="offline-bar" role="status">
      <Icon name="wifiOff" size={18} /> You’re offline. Your draft is saved on this phone.
    </div>
  );
}

export function ShellNav() {
  const items = [
    { icon: 'hammer', label: 'Construction' },
    { icon: 'refresh', label: 'Flips' },
    { icon: 'grid', label: '' },
    { icon: 'doc', label: 'Management' },
    { icon: 'sparkle', label: 'AI' },
  ];
  return (
    <nav className="shell-nav" aria-label="JBCONX main navigation (existing, out of scope)">
      {items.map((it, i) =>
        i === 2 ? (
          <div key={i}>
            <span className="mid" style={{ display: 'flex', alignItems: 'center' }}>
              <Icon name="grid" size={22} />
            </span>
          </div>
        ) : (
          <div key={i}>
            <Icon name={it.icon} size={22} />
            {it.label}
          </div>
        ),
      )}
    </nav>
  );
}
