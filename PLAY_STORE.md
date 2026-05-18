# CalcMaster — Play Store Publishing Guide

Complete checklist and steps to publish CalcMaster to the Google Play Store.

---

## Snapshot — what your project already has

| Area | Status | Where |
|---|---|---|
| Package name | `com.calcmaster.app` | `app.config.js:33` |
| App version | `1.0.1` | `app.config.js:5` |
| versionCode | `2` | `app.config.js:34` |
| target SDK | `35` (Play Store accepts) | `app.config.js:37` |
| min SDK | `24` | `app.config.js:35` |
| App icon, adaptive icon, splash | All present | `assets/` |
| ProGuard / shrink | Enabled | `app.config.js:59-60` |
| EAS production profile (AAB) | Configured | `eas.json:13-15` |
| EAS submit (track: internal) | Configured | `eas.json:25-32` |
| Privacy Policy page | Exists on web | `multi_calculator_web/src/app/privacy/page.tsx` |
| Firebase | Project exists, ads/analytics **disabled** | `.env` flags all false |
| AdMob | Not wired (intentional, post-launch) | commented in `app.config.js:76-79` |
| `package.json` version | **`1.0.0`** — out of sync with `app.config.js:5` (`1.0.1`) | minor cleanup |

The app is **build-ready, ads-free, single-package** — the simplest possible Play Store submission.

---

## What you DON'T need to bring (already in repo)

- App icon (`assets/icon.png`)
- Adaptive icon foreground/background/monochrome
- Splash image
- AAB build pipeline (EAS)
- Privacy policy page (live on the web project)

## What you DO need to bring / create

These are the only external things — everything else is a UI click in Play Console.

### 1. Google Play Developer account
You already have 2 apps → done. Same account, just "Create app".

### 2. Play App Signing — let Google manage it (recommended)
You don't need to generate a keystore. EAS generates one; on first upload Google Play does the rest. Skip this section entirely.

### 3. Service account JSON for `eas submit` (optional)
Only needed if you want `eas submit` to push the AAB automatically. **You can skip this for the first release** and just upload the `.aab` by hand from the EAS dashboard to Play Console.

If you want it later:
- Google Cloud Console → IAM → Service Accounts → create → grant access in Play Console → download JSON → save as `pc-api-key.json` in repo root (already gitignored).

### 4. Store listing assets — what you must produce

Play Console will reject submission without these:

| Asset | Size | How to make it |
|---|---|---|
| App icon (hi-res) | 512×512 PNG, 32-bit | Resize your existing `assets/icon.png` |
| Feature graphic | 1024×500 PNG (no transparency) | Make in Figma/Canva — single-line tagline + logo |
| Phone screenshots | 2–8 images, 1080×1920 or similar | Run app on emulator, capture Home / a calculator / History / Settings (light + dark) |
| Tablet screenshots | Optional but recommended | Same, on a tablet emulator |
| Short description | ≤ 80 chars | "36 finance & math calculators. Fully offline. Hindi + English." |
| Full description | ≤ 4000 chars | Write once, can reuse from `multi_calculator_web` landing copy |
| Privacy policy URL | public URL | Already exists — see step 5 below |

### 5. Privacy Policy URL
You already have `/privacy` in `multi_calculator_web`. Deploy that site to Vercel (if not already), then your privacy URL is `https://<your-vercel-domain>/privacy`. That's what you paste into Play Console.

### 6. Data Safety form answers (Play Console asks)
Because the app is **fully offline, AdMob disabled, analytics disabled**, your answers are:
- **Data collected?** No
- **Data shared?** No
- **Encryption in transit?** N/A (no network)
- **Users can request deletion?** N/A

This is the easiest Data Safety form possible — keep it that way for v1.

### 7. Content rating questionnaire
~5 minutes in Play Console. Calculator app → "Everyone" / IARC 3+. No alcohol, no violence, no purchases.

### 8. Target audience and ads
- Target age: **13+** or **18+** (pick 13+ for broadest reach)
- Contains ads: **No** (since ads are disabled)
- In-app purchases: **No**

---

## Step-by-step: from repo to a live Play Store listing

Two parallel tracks. Track A produces the binary; Track B fills the Play Console form. They merge at the upload step.

### Track A — Build the AAB (do this once)

```bash
cd "/home/primathon/Documents/p_projet/a_APP/3. multi calculator/CalcMaster"

# 1. One-time: log in to EAS
eas login

# 2. Sync package.json version with app.config.js (cleanup)
#    Edit package.json: "version": "1.0.0" → "1.0.1"

# 3. Build production AAB
eas build --platform android --profile production
```

When EAS finishes (15–25 min), download the `.aab` from the EAS dashboard.

### Track B — Set up the Play Console listing

Open Play Console → **Create app**:

1. **App details**
   - App name: `CalcMaster`
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
   - Declarations: tick both

2. **Set up your app** (left-side checklist — do them in any order):
   - App access → "All functionality available without restrictions"
   - Ads → **No, my app does not contain ads** (matches `EXPO_PUBLIC_ADS_ENABLED=false`)
   - Content rating → fill the questionnaire (Everyone)
   - Target audience → 13+
   - News app → No
   - COVID-19 contact tracing → No
   - Data safety → **No data collected, no data shared** (matches the offline app)
   - Government app → No
   - Financial features → Tick "Manages or invests user money" ONLY if you want — for a calculator that just does math, leave it No
   - Health features → No
   - Store settings → Category: **Finance** (primary) or **Tools**
   - Privacy policy → paste the `multi_calculator_web/privacy` URL

3. **Main store listing**
   - Upload icon (512×512), feature graphic (1024×500), phone screenshots
   - Short + full description
   - App category
   - Contact email, website

4. **Production release**
   - Releases → Production → Create new release
   - Upload the `.aab` from EAS
   - Release name: `1.0.1 (2)`
   - Release notes: short bullet list
   - Save → Review release → Roll out to production

First release goes through Google review (a few hours to a few days). Subsequent releases are much faster.

---

## Recommended first-launch strategy

Don't push straight to Production. Use this order — it's what your existing 2 apps probably also did:

1. **Internal testing** track first → invite yourself + 1–2 testers via email. Validates the upload, signing, install on a real phone.
2. Once happy → promote that same build to **Production**.

In Play Console: Releases → Internal testing → Create new release → upload AAB → add testers. The opt-in link in that page is what your testers tap.

Your `eas.json` already targets `"track": "internal"` for this exact reason.

---

## Tiny cleanup items before submitting

1. **Bump `package.json` version** to match `app.config.js`:
   ```
   "version": "1.0.0"  →  "1.0.1"
   ```
2. **Confirm `assets/google-services.json` is intended for the production build.** It's currently checked in (commit `037d505`), which is fine because Firebase is gated by `EXPO_PUBLIC_FIREBASE_ENABLED=false`. If you're truly not using Firebase in v1, you can remove it to keep the AAB lean.
3. **Confirm `multi_calculator_web` is deployed** — without a live privacy URL, Play Console blocks submission.

---

## Quick checklist (print this)

**External / one-time:**
- [ ] `multi_calculator_web` deployed to Vercel → privacy URL live
- [ ] 512×512 app icon PNG
- [ ] 1024×500 feature graphic PNG
- [ ] 2–8 phone screenshots
- [ ] Short description (≤80) + full description text

**In repo:**
- [ ] `package.json` version → `1.0.1`
- [ ] `eas build -p android --profile production` → AAB downloaded

**In Play Console:**
- [ ] Create app
- [ ] Fill: App access / Ads (No) / Content rating / Target audience / Data safety (No data) / Privacy policy URL
- [ ] Main store listing assets uploaded
- [ ] Internal testing release with AAB → install & smoke-test
- [ ] Promote to Production

Because the app is offline and ad-free, this is a 1-day submission once the screenshots are ready.

---

## Useful references in this repo

- [`SETUP.md`](./SETUP.md) — local development & build commands
- [`DISTRIBUTE.md`](./DISTRIBUTE.md) — sideload distribution via `calcMaster-web`
- [`app.config.js`](./app.config.js) — version, package, SDK config
- [`eas.json`](./eas.json) — build & submit profiles
