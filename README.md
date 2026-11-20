# Prototype source — JBCONX Post Requirements

React 18 + TypeScript + Vite. Builds to one self-contained HTML file. **Mock data and simulated services only.**

## Run
```bash
npm install
npm run dev        # http://localhost:5173  (?platform=android|ios|both, ?mode=gallery)
npm run build      # dist/index.html — single file, copy anywhere
```

## Test
```bash
pip install playwright && playwright install chromium
npm run build
python tests/e2e_flows.py dist/index.html test-results
```

## Structure
```
src/
  data/         types.ts, catalog.ts (ILLUSTRATIVE services, budgets, demo user)
  services/     validation.ts, mockApi.ts (SIMULATED OTP + submit + idempotency), storage.ts (localStorage drafts)
  navigation/   flow.tsx (state machine: routes, drafts, validation, OTP, submit), PhoneApp.tsx (router + overlays)
  screens/      Landing, ServiceStep, DetailsSteps, LocationStep, Uploader, ReviewStep, Verify, Outcome, StepScreen
  components/   Chrome.tsx (device frame, app bars, progress, bottom bar), Controls.tsx (buttons, chips, fields, sheets, dialogs), Icon.tsx
  theme/        tokens.ts (design tokens), styles.css (.p-android = Material 3, .p-ios = HIG)
  gallery/      Gallery.tsx (static renders of all 32 screen states)
tests/          e2e_flows.py (Playwright, both platforms)
```

Android and iOS share one flow engine and differ only in presentation (`usePlatform()` + `.p-android` / `.p-ios` styles), so business behaviour is identical by construction.

## Production notes
- `mockApi.ts` must be replaced by a real API: OTP service with server-side limits, `POST /requirements` with `Idempotency-Key`, signed upload URLs.
- `storage.ts` must use encrypted storage (Keychain / Keystore).
- See `../workflow/functional_requirements.md` (SR-01…SR-14).
