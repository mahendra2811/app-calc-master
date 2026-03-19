# EAS Build Fix — AdMob Plugin Resolution Error

## Problem

EAS Build was failing with:

```
Failed to resolve plugin for module "react-native-google-mobile-ads" relative to "/home/primathon/Documents/p_projet/APP/3. multi calculator/CalcMaster"
```

## Root Cause

The [`app.config.js`](../app.config.js:75) file had conditional plugin loading for `react-native-google-mobile-ads`, but:

1. **The package was not installed** in [`package.json`](../package.json:1)
2. **EAS Build resolves ALL plugins** during the config phase, even if they're conditionally excluded via environment variables
3. The condition `process.env.EXPO_PUBLIC_ADS_ENABLED === "true"` only works at runtime, not during EAS Build's prebuild phase

## Solution Applied

### 1. Commented Out AdMob & Firebase Plugins

Changed [`app.config.js`](../app.config.js:75) to comment out the plugin references entirely:

```javascript
plugins: [
  "expo-router",
  "expo-localization",
  // ... other plugins

  // AdMob and Firebase plugins are commented out by default
  // Uncomment and install packages when ready to use:
  // ...(process.env.EXPO_PUBLIC_ADS_ENABLED === "true"
  //   ? [
  //       [
  //         "react-native-google-mobile-ads",
  //         { androidAppId: "...", iosAppId: "..." }
  //       ],
  //     ]
  //   : []),
],
```

### 2. Added `cli.appVersionSource`

Added the required field to [`app.config.js`](../app.config.js:11):

```javascript
cli: {
  appVersionSource: "remote",
},
```

This tells EAS CLI to use the remote version from EAS servers instead of the local `version` field.

## How to Enable AdMob & Firebase Later

When you're ready to add ads and analytics:

### Step 1: Install Required Packages

```bash
cd CalcMaster
npx expo install react-native-google-mobile-ads
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

### Step 2: Uncomment Plugin Configuration

In [`app.config.js`](../app.config.js:75), uncomment the plugin sections:

```javascript
plugins: [
  // ... existing plugins

  ...(process.env.EXPO_PUBLIC_ADS_ENABLED === "true"
    ? [
        [
          "react-native-google-mobile-ads",
          {
            androidAppId:
              process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
              "ca-app-pub-0000000000000000~0000000000",
            iosAppId:
              process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
              "ca-app-pub-0000000000000000~0000000000",
          },
        ],
      ]
    : []),
  ...(process.env.EXPO_PUBLIC_FIREBASE_ENABLED === "true"
    ? ["@react-native-firebase/app", "@react-native-firebase/analytics"]
    : []),
],
```

### Step 3: Configure Environment Variables

Create a `.env` file (copy from [`.env.example`](../.env.example)):

```env
EXPO_PUBLIC_ADS_ENABLED=true
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_FIREBASE_ENABLED=true
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
```

### Step 4: Add Google Services Files

- **Android:** Place `google-services.json` in `assets/`
- **iOS:** Place `GoogleService-Info.plist` in `assets/google-services/`

### Step 5: Rebuild

```bash
eas build --platform android --profile preview
```

## Current Build Status

✅ **EAS Build should now work** without the AdMob plugin error

The app will build successfully with:

- ✅ All 36 calculators functional
- ✅ Theme switching (light/dark)
- ✅ Bilingual support (English/Hindi)
- ✅ History & Favorites
- ⚠️ Ads disabled (no-op placeholders)
- ⚠️ Analytics disabled (no-op tracking)

## Testing the Fix

### First-Time Setup

If this is your first time building with EAS, you need to initialize the project:

```bash
cd CalcMaster

# 1. Login to your Expo account
eas login

# 2. Initialize the EAS project (creates project ID)
eas build:configure

# 3. Now you can build
eas build --platform android --profile preview
```

The `eas build:configure` command will:

- Create a project on EAS servers
- Generate a unique project ID
- Update your [`app.config.js`](../app.config.js:109) with the project ID

### Subsequent Builds

After initial setup, just run:

```bash
cd CalcMaster
eas build --platform android --profile preview
```

Expected output:

```
✔ Select platform › Android
✔ Credentials configured
✔ Build queued
✔ Build successful
```

### Common First-Time Issues

**"Invalid UUID appId"** — You need to run `eas build:configure` first to create the project.

**"Not logged in"** — Run `eas login` to authenticate with your Expo account.

## Related Files

- [`app.config.js`](../app.config.js) — Main config with plugin definitions
- [`src/services/ads.ts`](../src/services/ads.ts) — AdMob service (no-op when disabled)
- [`src/services/firebase.ts`](../src/services/firebase.ts) — Firebase service (no-op when disabled)
- [`.env.example`](../.env.example) — Environment variable template
- [`SETUP.md`](../SETUP.md) — Full setup instructions

## Why This Approach?

1. **Clean builds without optional dependencies** — No need to install AdMob/Firebase packages until you're ready
2. **No runtime errors** — Services gracefully no-op when disabled
3. **Easy to enable later** — Just install packages, uncomment config, add credentials
4. **Follows Expo best practices** — Conditional plugins work correctly when packages are installed

## Additional Notes

- The `cli.appVersionSource: "remote"` field is now required by EAS CLI
- AdMob and Firebase are **completely optional** for this app
- All calculator functionality works without ads/analytics
- The app is production-ready even without monetization enabled
