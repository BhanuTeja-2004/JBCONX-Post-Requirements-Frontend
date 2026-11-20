/** Platform-aware form controls and feedback components. */
import { useId, type ReactNode, type InputHTMLAttributes } from 'react';
import { usePlatform } from './Chrome';
import { Icon } from './Icon';
import type { Option } from '../data/catalog';

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  loading,
  block,
  small,
  icon,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: 'primary' | 'tonal' | 'outlined' | 'text' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  small?: boolean;
  icon?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      className={`btn ${variant === 'danger' ? 'text danger' : variant} ${block ? 'block' : ''} ${small ? 'sm' : ''}`}
      onClick={loading ? undefined : onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
    >
      {loading ? <span className="spinner" aria-hidden /> : icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </button>
  );
}

export function ErrorText({ msg, id }: { msg?: string; id?: string }) {
  if (!msg) return null;
  return (
    <div className="err-text" id={id} role="alert">
      <Icon name="error" size={16} />
      <span>{msg}</span>
    </div>
  );
}

export function Section({ title, optional, children, error, helper }: { title: string; optional?: boolean; children: ReactNode; error?: string; helper?: string }) {
  return (
    <section className="sec" data-invalid={error ? 'true' : undefined}>
      <h2 className="sec-title" style={{ margin: undefined }}>
        <span>{title}</span>
        {optional && <span className="opt">Optional</span>}
      </h2>
      {children}
      {helper && !error && <div className="helper">{helper}</div>}
      <ErrorText msg={error} />
    </section>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  multi,
  invalid,
  label,
  stack,
}: {
  options: (Option | string)[];
  value?: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
  invalid?: boolean;
  label: string;
  stack?: boolean;
}) {
  const p = usePlatform();
  return (
    <div className={`chips ${invalid ? 'invalid' : ''} ${stack ? 'stack' : ''}`} role={multi ? 'group' : 'radiogroup'} aria-label={label}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { id: o, label: o } : o;
        const on = Array.isArray(value) ? value.includes(opt.id) : value === opt.id;
        return (
          <button
            key={opt.id}
            className="chip"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onChange(opt.id)}
          >
            {on && p === 'android' && !stack && <Icon name="check" size={18} stroke={2.2} />}
            <span>
              {opt.label}
              {opt.hint && stack && (
                <>
                  <br />
                  <small>{opt.hint}</small>
                </>
              )}
            </span>
            {opt.hint && !stack && <small>{opt.hint}</small>}
            {stack && on && <Icon name="check" size={20} stroke={2.4} />}
          </button>
        );
      })}
    </div>
  );
}

export function Tiles({
  options,
  value,
  onChange,
  multi,
  label,
  cols = 4,
}: {
  options: Option[];
  value?: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
  label: string;
  cols?: 3 | 4;
}) {
  return (
    <div className={`tiles ${cols === 3 ? 'cols3' : ''}`} role={multi ? 'group' : 'radiogroup'} aria-label={label}>
      {options.map((o) => {
        const on = Array.isArray(value) ? value.includes(o.id) : value === o.id;
        return (
          <button key={o.id} className="tile" role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={() => onChange(o.id)}>
            {on && multi && (
              <span className="tick" aria-hidden>
                <Icon name="check" size={12} stroke={3} />
              </span>
            )}
            <span className="ic">
              <Icon name={o.icon ?? 'more'} size={22} />
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented({ options, value, onChange, label, invalid }: { options: Option[]; value?: string; onChange: (v: string) => void; label: string; invalid?: boolean }) {
  const p = usePlatform();
  return (
    <div className={`segmented ${invalid ? 'invalid' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}>
          {value === o.id && p === 'android' && <Icon name="check" size={16} stroke={2.4} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  helper?: string;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  multiline?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  type?: string;
  optional?: boolean;
  autoFocus?: boolean;
};

export function TextField(props: FieldProps) {
  const p = usePlatform();
  const id = useId();
  const { label, value, onChange, onBlur, error, helper, placeholder, prefix, suffix, multiline, maxLength, showCounter, inputMode, autoComplete, type, optional, autoFocus } = props;
  const describedBy = error ? `${id}-err` : helper ? `${id}-help` : undefined;
  const lbl = optional ? `${label} (optional)` : label;
  const input = multiline ? (
    <textarea
      id={id}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={!!error}
      aria-describedby={describedBy}
      autoFocus={autoFocus}
    />
  ) : (
    <input
      id={id}
      value={value}
      type={type ?? 'text'}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={!!error}
      aria-describedby={describedBy}
      autoFocus={autoFocus}
    />
  );
  return (
    <div className={`field ${error ? 'invalid' : ''}`} data-invalid={error ? 'true' : undefined}>
      {p === 'ios' && (
        <label className="lbl" htmlFor={id}>
          {lbl}
        </label>
      )}
      <div className="box">
        {p === 'android' && (
          <label className="lbl" htmlFor={id}>
            {lbl}
          </label>
        )}
        {prefix && <span className="prefix">{prefix}</span>}
        {input}
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {error ? (
        <ErrorText msg={error} id={`${id}-err`} />
      ) : helper ? (
        <div className="helper" id={`${id}-help`}>
          {helper}
        </div>
      ) : null}
      {showCounter && maxLength && (
        <div className="counter" aria-live="polite">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}

export function Banner({ kind, icon, children }: { kind: 'info' | 'warning' | 'error' | 'success'; icon?: string; children: ReactNode }) {
  return (
    <div className={`banner ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon name={icon ?? (kind === 'success' ? 'check' : kind === 'info' ? 'info' : kind === 'error' ? 'error' : 'warning')} size={20} />
      <div>{children}</div>
    </div>
  );
}

export function CheckRow({ checked, onChange, children, invalid }: { checked: boolean; onChange: () => void; children: ReactNode; invalid?: boolean }) {
  return (
    <button className={`check-row ${invalid ? 'invalid' : ''}`} role="checkbox" aria-checked={checked} onClick={onChange} data-invalid={invalid ? 'true' : undefined}>
      <span className="check-box">{checked && <Icon name="check" size={16} stroke={3} />}</span>
      <span>{children}</span>
    </button>
  );
}

export function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const p = usePlatform();
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-head">
          {p === 'ios' && (
            <button className="ios-text-btn" onClick={onClose}>
              Cancel
            </button>
          )}
          <h3>{title}</h3>
          {p === 'android' ? (
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          ) : (
            <span style={{ width: 60 }} />
          )}
        </div>
        {children}
        {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
      </div>
    </div>
  );
}

export interface DialogAction {
  label: string;
  onClick: () => void;
  kind?: 'default' | 'destructive' | 'cancel';
}

export function Dialog({ title, message, actions, onDismiss }: { title: string; message?: string; actions: DialogAction[]; onDismiss: () => void }) {
  const p = usePlatform();
  return (
    <div className="scrim center" onClick={onDismiss}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="actions" style={p === 'android' && actions.length > 2 ? { flexDirection: 'column', alignItems: 'flex-end' } : undefined}>
          {(p === 'android' ? [...actions].sort((a, b) => (a.kind === 'cancel' ? -1 : b.kind === 'cancel' ? 1 : 0)) : actions).map((a) =>
            p === 'android' ? (
              <button key={a.label} className={`btn text sm ${a.kind === 'destructive' ? 'danger' : ''}`} onClick={a.onClick}>
                {a.label}
              </button>
            ) : (
              <button key={a.label} className={a.kind === 'destructive' ? 'destructive' : a.kind === 'default' ? 'default' : ''} onClick={a.onClick}>
                {a.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/** iOS action sheet; on Android the caller uses Sheet with rows instead. */
export function ActionSheet({ message, actions, onDismiss }: { message?: string; actions: DialogAction[]; onDismiss: () => void }) {
  const main = actions.filter((a) => a.kind !== 'cancel');
  const cancel = actions.find((a) => a.kind === 'cancel');
  return (
    <div className="scrim" onClick={onDismiss}>
      <div className="action-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="group">
          {message && <p>{message}</p>}
          {main.map((a) => (
            <button key={a.label} className={a.kind === 'destructive' ? 'destructive' : ''} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
        {cancel && (
          <button className="cancel" onClick={cancel.onClick}>
            {cancel.label}
          </button>
        )}
      </div>
    </div>
  );
}

export function Snackbar({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="snackbar" role="status" aria-live="polite">
      <span style={{ flex: 1 }}>{text}</span>
      {action && (
        <button style={{ color: '#A9C7FF', fontWeight: 600, minHeight: 36 }} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}
