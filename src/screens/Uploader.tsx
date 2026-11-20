import { useRef } from 'react';
import { usePlatform } from '../components/Chrome';
import { ActionSheet, Sheet } from '../components/Controls';
import { Icon } from '../components/Icon';
import { useFlow } from '../navigation/flow';

/** S09 — Photo & document upload (thumbnails, progress, errors). */
export function Uploader({ allowPdf, label = 'Add photos' }: { allowPdf?: boolean; label?: string }) {
  const f = useFlow();
  const list = f.draft.attachments;
  return (
    <div>
      <div className="uploads">
        {list.map((a) => (
          <div key={a.id} className={`thumb ${a.error ? 'err' : ''}`} title={a.name}>
            {a.error ? (
              <div style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 600, padding: 4 }}>
                <Icon name="error" size={20} />
                <div>{a.error}</div>
              </div>
            ) : a.kind === 'image' && a.url ? (
              <img src={a.url} alt={a.name} />
            ) : (
              <>
                <Icon name={a.kind === 'pdf' ? 'file' : 'image'} size={28} />
                <span className="fname">{a.name}</span>
              </>
            )}
            {!a.error && a.progress < 100 && (
              <span className="bar" aria-label={`Uploading ${a.progress}%`}>
                <span style={{ width: `${a.progress}%` }} />
              </span>
            )}
            <button className="rm" onClick={() => f.removeAttachment(a.id)} aria-label={`Remove ${a.name}`}>
              <Icon name="close" size={14} stroke={2.6} />
            </button>
          </div>
        ))}
        {list.length < 8 && (
          <button className="add-tile" onClick={() => f.openSheet('upload')} aria-label={label}>
            <Icon name={allowPdf ? 'plus' : 'camera'} size={24} />
            {list.length ? 'Add more' : allowPdf ? 'Add files' : 'Add'}
          </button>
        )}
      </div>
      <div className="helper">
        {allowPdf ? 'Photos or PDF drawings' : 'Photos'} · up to 8 files, 10 MB each. Please don’t upload ID documents.
      </div>
    </div>
  );
}

/** Source picker: Material bottom sheet (Android) / action sheet (iOS). Permission is requested only for the chosen source. */
export function UploadSourcePicker() {
  const f = useFlow();
  const p = usePlatform();
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);
  const doc = useRef<HTMLInputElement>(null);
  const onFiles = (fl: FileList | null) => {
    if (fl && fl.length) f.addAttachments(Array.from(fl));
  };
  const inputs = (
    <>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFiles(e.target.files)} />
      <input ref={gal} type="file" accept="image/jpeg,image/png,image/heic,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <input ref={doc} type="file" accept="application/pdf,image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
    </>
  );
  if (p === 'ios') {
    return (
      <>
        {inputs}
        <ActionSheet
          message="Add photos or documents"
          onDismiss={f.closeOverlays}
          actions={[
            { label: 'Take Photo', onClick: () => cam.current?.click() },
            { label: 'Photo Library', onClick: () => gal.current?.click() },
            { label: 'Choose File', onClick: () => doc.current?.click() },
            { label: 'Use Sample Photo (Demo)', onClick: () => f.addAttachments('sample') },
            { label: 'Cancel', onClick: f.closeOverlays, kind: 'cancel' },
          ]}
        />
      </>
    );
  }
  const rows = [
    { icon: 'camera', t: 'Take photo', s: 'Camera permission is asked only now', on: () => cam.current?.click() },
    { icon: 'image', t: 'Choose from gallery', s: 'Uses the system photo picker — no storage permission', on: () => gal.current?.click() },
    { icon: 'file', t: 'Choose file', s: 'PDF drawings or approvals', on: () => doc.current?.click() },
    { icon: 'sparkle', t: 'Use sample photo', s: 'Demo only', on: () => f.addAttachments('sample') },
  ];
  return (
    <>
      {inputs}
      <Sheet title="Add photos or files" onClose={f.closeOverlays}>
        <div className="rows" style={{ background: 'transparent' }}>
          {rows.map((r) => (
            <button key={r.t} className="row" onClick={r.on}>
              <span className="lead">
                <Icon name={r.icon} size={22} />
              </span>
              <span className="grow">
                <span className="t" style={{ display: 'block' }}>{r.t}</span>
                <span className="s" style={{ display: 'block' }}>{r.s}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
