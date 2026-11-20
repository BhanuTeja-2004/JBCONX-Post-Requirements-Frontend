/** Renders the current route for one platform, plus global overlays (dialogs, sheets, snackbar, busy state). */
import { Device, usePlatform } from '../components/Chrome';
import { ActionSheet, Dialog, Snackbar } from '../components/Controls';
import type { Platform } from '../data/types';
import { DetailsContractor, DetailsIndividual, PropertyStep, RequirementsStep } from '../screens/DetailsSteps';
import { Landing } from '../screens/Landing';
import { LocationStep } from '../screens/LocationStep';
import { DetailScreen, FailedScreen, ListScreen, SuccessScreen } from '../screens/Outcome';
import { ReviewStep } from '../screens/ReviewStep';
import { ServiceStep } from '../screens/ServiceStep';
import { UploadSourcePicker } from '../screens/Uploader';
import { OtpScreen, PhoneScreen } from '../screens/Verify';
import { stepKey } from '../services/validation';
import { useFlow } from './flow';

function StepRouter({ index }: { index: number }) {
  const f = useFlow();
  switch (stepKey(f.draft, index)) {
    case 'service':
      return <ServiceStep />;
    case 'details-ind':
      return <DetailsIndividual />;
    case 'details-con':
      return <DetailsContractor />;
    case 'property':
      return <PropertyStep />;
    case 'requirements':
      return <RequirementsStep />;
    case 'location':
      return <LocationStep />;
    case 'review':
      return <ReviewStep />;
    default:
      return null;
  }
}

function Overlays() {
  const f = useFlow();
  const p = usePlatform();
  const d = f.ui.dialog;
  return (
    <>
      {f.ui.sheet === 'upload' && <UploadSourcePicker />}
      {d === 'exit' &&
        (p === 'ios' ? (
          <ActionSheet
            message="Your progress is saved on this phone as a draft."
            onDismiss={f.closeOverlays}
            actions={[
              { label: 'Save Draft & Exit', onClick: f.home },
              { label: 'Discard Requirement', onClick: f.discardDraft, kind: 'destructive' },
              { label: 'Keep Editing', onClick: f.closeOverlays, kind: 'cancel' },
            ]}
          />
        ) : (
          <Dialog
            title="Leave this requirement?"
            message="Your progress is saved as a draft on this phone. You can continue later."
            onDismiss={f.closeOverlays}
            actions={[
              { label: 'Discard', onClick: f.discardDraft, kind: 'destructive' },
              { label: 'Keep editing', onClick: f.closeOverlays, kind: 'cancel' },
              { label: 'Save draft', onClick: f.home, kind: 'default' },
            ]}
          />
        ))}
      {d === 'discardDraft' && (
        <Dialog
          title="Discard draft?"
          message="The details you entered will be deleted from this phone."
          onDismiss={f.closeOverlays}
          actions={[
            { label: 'Cancel', onClick: f.closeOverlays, kind: 'cancel' },
            { label: 'Discard', onClick: f.discardDraft, kind: 'destructive' },
          ]}
        />
      )}
      {d === 'sessionExpired' && (
        <Dialog
          title="Please confirm it’s you"
          message="Your session has expired. Verify your mobile number to submit — your requirement is saved."
          onDismiss={f.closeOverlays}
          actions={[
            { label: 'Not now', onClick: f.closeOverlays, kind: 'cancel' },
            {
              label: 'Verify number',
              onClick: () => {
                f.closeOverlays();
                f.go({ name: 'phone' });
              },
              kind: 'default',
            },
          ]}
        />
      )}
      {d === 'cancelReq' && f.route.name === 'detail' && (
        <Dialog
          title="Cancel this requirement?"
          message="Professionals will stop seeing it and won’t contact you about it. This can’t be undone."
          onDismiss={f.closeOverlays}
          actions={[
            { label: 'Keep it', onClick: f.closeOverlays, kind: 'cancel' },
            { label: 'Cancel requirement', onClick: () => f.route.name === 'detail' && f.cancelRequirement(f.route.id), kind: 'destructive' },
          ]}
        />
      )}
      {f.ui.busy && (
        <div className="busy" role="status" aria-live="assertive">
          <div className="big-spin" />
          <h3>Submitting your requirement…</h3>
          <p>Please keep the app open. Tapping again won’t create a duplicate.</p>
        </div>
      )}
      {f.ui.snackbar && <Snackbar text={f.ui.snackbar} />}
    </>
  );
}

export function Screen() {
  const f = useFlow();
  const r = f.route;
  switch (r.name) {
    case 'landing':
      return <Landing />;
    case 'step':
      return <StepRouter index={r.index} />;
    case 'phone':
      return <PhoneScreen />;
    case 'otp':
      return <OtpScreen />;
    case 'failed':
      return <FailedScreen />;
    case 'success':
      return <SuccessScreen id={r.id} />;
    case 'list':
      return <ListScreen />;
    case 'detail':
      return <DetailScreen id={r.id} />;
    default:
      return <Landing />;
  }
}

export function PhoneApp({ platform }: { platform: Platform }) {
  return (
    <Device platform={platform}>
      <Screen />
      <Overlays />
    </Device>
  );
}

export { Overlays };
