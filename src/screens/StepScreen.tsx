import { useEffect, useRef, type ReactNode } from 'react';
import { AppBar, BottomBar, OfflineBar, Progress, SystemNav, usePlatform } from '../components/Chrome';
import { Button } from '../components/Controls';
import { categoryById } from '../data/catalog';
import { useFlow } from '../navigation/flow';

/** Wrapper for every numbered step: app bar, progress, scrollable content, bottom action. */
export function StepScreen({
  index,
  children,
  primaryLabel = 'Continue',
  onPrimary,
  primaryDisabled,
  secondary,
  footerNote,
}: {
  index: number;
  children: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  secondary?: ReactNode;
  footerNote?: ReactNode;
}) {
  const f = useFlow();
  const p = usePlatform();
  const cat = categoryById(f.draft.category)!;
  const scroller = useRef<HTMLDivElement>(null);

  // Scroll to and focus the first invalid field after a failed Continue.
  useEffect(() => {
    if (!f.attemptCount) return;
    const el = scroller.current?.querySelector('[data-invalid="true"]') as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const focusable = el.querySelector('input, textarea, button') as HTMLElement | null;
      focusable?.focus({ preventScroll: true });
    }
  }, [f.attemptCount]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [index]);

  const label = cat.steps[index];
  return (
    <>
      <AppBar
        title={p === 'ios' ? label : cat.title}
        onBack={f.back}
        backLabel={index === 0 ? 'Post' : 'Back'}
        onClose={() => f.openDialog('exit')}
      />
      <Progress step={index + 1} total={cat.steps.length} label={p === 'ios' ? cat.title : label} saved={f.justSaved} />
      {f.demo.offline && <OfflineBar />}
      <div className="content" ref={scroller}>
        {children}
      </div>
      <BottomBar>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {secondary}
            <Button block onClick={onPrimary ?? f.next} disabled={primaryDisabled}>
              {f.editingFromReview && index < cat.steps.length - 1 ? 'Save & return to review' : primaryLabel}
            </Button>
          </div>
          {footerNote && <div className="meta">{footerNote}</div>}
        </div>
      </BottomBar>
      <SystemNav />
    </>
  );
}
