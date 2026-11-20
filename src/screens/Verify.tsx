/**
 * S11–S13 — Phone entry and OTP verification.
 * SIMULATED: no SMS is sent. Demo code 123456. Must not be presented as real authentication.
 */
import { useEffect, useRef, useState } from 'react';
import { AppBar, BottomBar, OfflineBar, SystemNav, usePlatform } from '../components/Chrome';
import { Banner, Button, TextField } from '../components/Controls';
import { Icon } from '../components/Icon';
import { useFlow } from '../navigation/flow';
import { DEMO_OTP, RESEND_COOLDOWN_MS } from '../services/mockApi';
import { PHONE_RE } from '../services/validation';
import { maskPhone } from './ReviewStep';

function DemoStrip() {
  return (
    <div className="demo-strip" role="note">
      <Icon name="info" size={16} />
      <span>
        <b>Demo mode</b> — no SMS is sent. Use code <b>{DEMO_OTP}</b>.
      </span>
    </div>
  );
}

export function PhoneScreen() {
  const f = useFlow();
  const [phone, setPhone] = useState(f.draft.contact.phone);
  const [touched, setTouched] = useState(false);
  const sending = f.otp?.status === 'sending';
  const err = !phone ? 'Enter your 10-digit mobile number' : !PHONE_RE.test(phone) ? 'Enter a valid 10-digit Indian mobile number' : undefined;
  const send = () => {
    setTouched(true);
    if (!err) void f.sendCode(phone);
  };
  return (
    <>
      <AppBar title="Verify your number" onBack={f.back} backLabel="Review" />
      {f.demo.offline && <OfflineBar />}
      <div className="content">
        <DemoStrip />
        <div className="empty" style={{ padding: '12px 0 8px', textAlign: 'left' }}>
          <div className="ic" style={{ margin: '0 0 16px' }}>
            <Icon name="phone" size={32} />
          </div>
        </div>
        <h2 className="h-title">Confirm your mobile number</h2>
        <p className="h-sub">We’ll send a 6-digit code by SMS. This confirms professionals can reach you — it’s the last step before your requirement is sent.</p>
        <TextField
          label="Mobile number"
          value={phone}
          onChange={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
          onBlur={() => setTouched(true)}
          prefix={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>🇮🇳 +91</span>}
          inputMode="numeric"
          type="tel"
          autoComplete="tel-national"
          error={touched ? err : undefined}
          autoFocus
        />
        <p className="helper" style={{ marginTop: 14 }}>Standard SMS rates may apply. Your requirement is saved — nothing is lost if you leave.</p>
      </div>
      <BottomBar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button block onClick={send} loading={sending} disabled={f.demo.offline}>
            {sending ? 'Sending code…' : 'Send code'}
          </Button>
          <Button block variant="text" small onClick={f.skipVerification}>
            Skip verification (demo only)
          </Button>
        </div>
      </BottomBar>
      <SystemNav />
    </>
  );
}

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function OtpScreen() {
  const f = useFlow();
  const p = usePlatform();
  const otp = f.otp;
  const [code, setCode] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const lastSent = useRef(otp?.sentAt);

  useEffect(() => {
    if (otp && otp.sentAt !== lastSent.current) {
      lastSent.current = otp.sentAt;
      setCode('');
    }
  }, [otp]);

  useEffect(() => {
    if (otp?.error === 'wrong') setCode('');
  }, [otp?.error, otp?.attemptsLeft]);

  if (!otp) return null;
  const status = otp.status;
  const expired = f.now > otp.expiresAt && status !== 'verified' && status !== 'locked';
  const cooldown = RESEND_COOLDOWN_MS - (f.now - otp.sentAt);
  const verifying = status === 'verifying';
  const verified = status === 'verified';
  const locked = status === 'locked';

  const onChange = (v: string) => {
    const c = v.replace(/\D/g, '').slice(0, 6);
    setCode(c);
    if (c.length === 6 && !expired && !locked) void f.verifyCode(c);
  };

  const boxState = (i: number) => {
    if (verified) return 'ok';
    if (otp.error === 'wrong' && !code) return 'invalid';
    if (i === code.length && !verifying) return 'active';
    return '';
  };

  let message: React.ReactNode = null;
  if (locked)
    message = (
      <Banner kind="error" icon="lock">
        <b>Too many attempts.</b> For your security, try again in 15 minutes. Your requirement is saved as a draft.
      </Banner>
    );
  else if (expired || otp.error === 'expired')
    message = (
      <Banner kind="warning" icon="clock">
        This code has expired. Request a new one below.
      </Banner>
    );
  else if (otp.error === 'wrong')
    message = (
      <Banner kind="error">
        That code isn’t right. {otp.attemptsLeft} attempt{otp.attemptsLeft === 1 ? '' : 's'} left.
      </Banner>
    );
  else if (verified)
    message = (
      <Banner kind="success" icon="shieldCheck">
        <b>Number confirmed.</b> Submitting your requirement…
      </Banner>
    );

  return (
    <>
      <AppBar title="Enter code" onBack={f.back} backLabel="Number" />
      {f.demo.offline && <OfflineBar />}
      <div className="content">
        <DemoStrip />
        <h2 className="h-title">Enter the 6-digit code</h2>
        <p className="h-sub">
          Sent to {maskPhone(otp.phone)} ·{' '}
          <button className="link" onClick={f.back}>
            Change
          </button>
        </p>
        <div className="otp-wrap" onClick={() => input.current?.focus()}>
          <input
            ref={input}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-label="6-digit verification code"
            disabled={locked || verified || verifying}
            autoFocus
          />
          <div className="otp-boxes" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={`otp-box ${boxState(i)}`}>
                {code[i] ?? (verified ? DEMO_OTP[i] : '')}
              </div>
            ))}
          </div>
        </div>

        <div className="otp-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {verifying ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Checking…
              </>
            ) : status === 'sending' ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending…
              </>
            ) : !locked && !verified && !expired ? (
              <>Code expires in {mmss(otp.expiresAt - f.now)}</>
            ) : null}
          </span>
          {!verified &&
            (locked ? null : cooldown > 0 && !expired ? (
              <span>Resend in {mmss(cooldown)}</span>
            ) : (
              <button className="btn text sm" onClick={() => void f.resendCode()} disabled={status === 'sending'}>
                Resend code {otp.resendsLeft < 3 ? `(${otp.resendsLeft} left)` : ''}
              </button>
            ))}
        </div>

        {p === 'android' && !verified && !locked && !expired && status === 'waiting' && !otp.error && (
          <div className="banner info" style={{ marginTop: 4 }}>
            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            <div>
              Waiting for the SMS — we’ll fill the code in automatically.{' '}
              <button className="link" onClick={() => onChange(DEMO_OTP)}>
                Simulate auto-fill
              </button>
            </div>
          </div>
        )}
        {message && <div style={{ marginTop: 12 }}>{message}</div>}
        <p className="helper" style={{ marginTop: 18 }}>
          Didn’t get it? Check the number, wait for the timer, then resend. Codes are valid for 5 minutes.
        </p>
      </div>
      {p === 'ios' && !verified && !locked && !expired && (
        <div className="ios-qtype">
          <button onClick={() => onChange(DEMO_OTP)} aria-label="AutoFill code from Messages (simulated)">
            <small>From Messages (simulated)</small>
            {DEMO_OTP}
          </button>
        </div>
      )}
      <BottomBar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {locked ? (
            <Button block variant="outlined" onClick={f.home}>
              Back to Post Requirements
            </Button>
          ) : (
            <Button block onClick={() => void f.verifyCode(code)} disabled={code.length !== 6 || expired || verified} loading={verifying || verified}>
              {verified ? 'Submitting…' : 'Verify & submit'}
            </Button>
          )}
          {!verified && (
            <Button block variant="text" small onClick={f.skipVerification}>
              Skip verification (demo only)
            </Button>
          )}
        </div>
      </BottomBar>
      <SystemNav />
    </>
  );
}
