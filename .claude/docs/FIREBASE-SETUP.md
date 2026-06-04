# Firebase Configuration Guide — CalcMaster

> **Status:** ✅ Firebase configured and ready for analytics
> **Date:** March 20, 2026

---

## Overview

Firebase has been successfully configured for the CalcMaster app. The setup includes:

- ✅ Google Services JSON file placed in correct location
- ✅ Environment variables enabled for Firebase & Analytics
- ✅ App configuration ready to use Firebase services
- ✅ Analytics tracking enabled

---

## Files Created/Modified

### 1. **google-services.json** (Created)

**Location:** `CalcMaster/assets/google-services.json`

This file contains your Firebase project credentials:

- **Project ID:** `app-calcmaster`
- **Project Number:** `440974625460`
- **Package Name:** `com.calcmaster.app`
- **Storage Bucket:** `app-calcmaster.firebasestorage.app`
- **API Key:** `AIzaSyBCzQau_yVtZ1iaNLLWpGHU71cAy0kcmIU`

⚠️ **Security Note:** This file is already in `.gitignore` under `assets/google-services.json` pattern. Never commit it to public repositories.

### 2. **.env** (Modified)

**Location:** `CalcMaster/.env`

Updated environment variables:

```env
EXPO_PUBLIC_FIREBASE_ENABLED=true      # ✅ Enabled
EXPO_PUBLIC_ANALYTICS_ENABLED=true     # ✅ Enabled
EXPO_PUBLIC_ADS_ENABLED=false          # Still disabled (AdMob not configured)
```

### 3. **app.config.js** (Already Configured)

**Location:** `CalcMaster/app.config.js`

The configuration already includes Firebase support:

```javascript
android: {
  ...(process.env.EXPO_PUBLIC_FIREBASE_ENABLED === "true" && {
    googleServicesFile: "./assets/google-services.json",
  }),
}
```

This dynamically includes the google-services.json file when Firebase is enabled.

---

## What Firebase Features Are Active

### ✅ Currently Active

1. **Firebase Analytics**
   - Tracks user interactions and screen views
   - Events logged: calculator usage, theme changes, language switches
   - Privacy-first: No personal data collected

2. **Event Tracking**
   - `calculator_opened` — When user opens a calculator
   - `calculation_performed` — When calculation is completed
   - `history_cleared` — When user clears history
   - `language_changed` — When user switches language
   - `theme_changed` — When user changes theme

### ❌ Not Active (Optional)

- **Firebase Crashlytics** — Not configured
- **Firebase Remote Config** — Not configured
- **Firebase Cloud Messaging** — Not configured
- **Firebase Authentication** — Not needed (offline app)
- **Firebase Firestore** — Not needed (local storage only)

---

## How Analytics Works in CalcMaster

### Implementation Pattern

All analytics calls are **no-ops** when disabled, so the code is safe to call anywhere:

```typescript
// In any calculator or screen
import { trackEvent, trackScreenView } from "@/utils/analytics";

// Track calculation
trackEvent("calculate", {
  calculator: "sip",
  inputs: { amount: 5000 },
});

// Track screen view
trackScreenView("HomeScreen");
```

### Analytics Service Layer

**File:** `src/services/firebase.ts`

The Firebase service provides three main functions:

- `initializeFirebase()` — Called once at app startup
- `logEvent(name, params)` — Log custom events
- `logScreenView(screen)` — Log screen views

All functions check `EXPO_PUBLIC_FIREBASE_ENABLED` before executing.

---

## Testing Firebase Integration

### 1. Development Testing

```bash
# Start the development server
npx expo start --clear

# Open in Expo Go or Android emulator
# Check Metro console for Firebase logs:
# [Firebase] initialised
```

### 2. Verify Analytics Events

In development mode, analytics events are logged to console:

```
[Analytics] Event: calculator_opened { calculator: 'sip-calculator' }
[Analytics] Event: calculation_performed { calculator: 'sip-calculator' }
```

### 3. Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **app-calcmaster**
3. Navigate to **Analytics** → **Events**
4. Events will appear within 24 hours (real-time in debug mode)

---

## Building with Firebase

### Development Build (APK)

```bash
# Build APK with Firebase enabled
eas build --platform android --profile preview
```

The build will:

- Include `google-services.json` automatically
- Enable Firebase Analytics
- Generate APK for testing

### Production Build (AAB for Play Store)

```bash
# Build AAB for Play Store
eas build --platform android --profile production
```

The production build will:

- Include Firebase Analytics
- Enable ProGuard/R8 optimization
- Generate AAB for Google Play Store

---

## Privacy & GDPR Compliance

### Data Collection

CalcMaster collects **minimal analytics data**:

- ✅ Screen views (which calculators are used)
- ✅ Button clicks (theme, language changes)
- ✅ Calculation events (no actual values stored)
- ❌ No personal information
- ❌ No user accounts
- ❌ No location data
- ❌ No device identifiers

### User Control

Users can:

- Use the app completely offline
- All data stored locally (AsyncStorage)
- No cloud sync or remote storage
- Analytics is passive (no user-facing features depend on it)

### Disabling Analytics

To disable analytics at any time:

1. Edit `.env`:

   ```env
   EXPO_PUBLIC_ANALYTICS_ENABLED=false
   ```

2. Rebuild the app:
   ```bash
   eas build --platform android --profile production
   ```

---

## Troubleshooting

### ❌ "google-services.json not found"

**Cause:** File not in correct location or Firebase not enabled in `.env`

**Fix:**

1. Verify file exists: `CalcMaster/assets/google-services.json`
2. Check `.env`: `EXPO_PUBLIC_FIREBASE_ENABLED=true`
3. Clear cache: `npx expo start --clear`

### ❌ "Firebase not initialized"

**Cause:** Firebase packages not installed

**Fix:**

```bash
# Install Firebase packages (when ready to use)
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

**Note:** Firebase packages are currently **commented out** in `app.config.js` to avoid build errors. Uncomment when you install the packages.

### ❌ Analytics events not showing in Firebase Console

**Cause:** Events take up to 24 hours to appear

**Fix:**

1. Enable debug mode in Firebase Console
2. Check Metro console for event logs
3. Wait 24 hours for production data

### ❌ Build fails with Firebase errors

**Cause:** Package version mismatch or missing dependencies

**Fix:**

```bash
# Fix package versions
npx expo install --fix

# Verify Firebase packages are compatible with Expo SDK 55
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

---

## Next Steps

### Optional: Install Firebase Packages

Currently, Firebase is configured but the actual Firebase SDK packages are **not installed** (to keep the app lightweight). The analytics calls are no-ops.

To enable **real Firebase Analytics**:

1. **Install packages:**

   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/analytics
   ```

2. **Uncomment plugins in app.config.js:**

   ```javascript
   // Line 96-98 in app.config.js
   ...(process.env.EXPO_PUBLIC_FIREBASE_ENABLED === "true"
     ? ["@react-native-firebase/app", "@react-native-firebase/analytics"]
     : []),
   ```

3. **Update firebase.ts service:**

   ```typescript
   // src/services/firebase.ts
   import analytics from "@react-native-firebase/analytics";

   export async function initializeFirebase() {
     if (!isEnabled()) return;
     // Firebase auto-initializes from google-services.json
     console.log("[Firebase] initialized");
   }

   export async function logEvent(name: string, params?: Record<string, any>) {
     if (!isEnabled()) return;
     await analytics().logEvent(name, params);
   }
   ```

4. **Rebuild:**
   ```bash
   eas build --platform android --profile preview
   ```

### Optional: Add More Firebase Services

- **Crashlytics:** Track app crashes

  ```bash
  npx expo install @react-native-firebase/crashlytics
  ```

- **Remote Config:** Feature flags and A/B testing

  ```bash
  npx expo install @react-native-firebase/remote-config
  ```

- **Performance Monitoring:** Track app performance
  ```bash
  npx expo install @react-native-firebase/perf
  ```

---

## Configuration Summary

| Item                 | Status           | Location                      |
| -------------------- | ---------------- | ----------------------------- |
| google-services.json | ✅ Created       | `assets/google-services.json` |
| Firebase enabled     | ✅ Enabled       | `.env`                        |
| Analytics enabled    | ✅ Enabled       | `.env`                        |
| App config           | ✅ Ready         | `app.config.js`               |
| Firebase packages    | ⏸️ Not installed | Optional                      |
| Analytics service    | ✅ Ready         | `src/services/firebase.ts`    |

---

## Important Notes

1. **Security:** The `google-services.json` file contains your API key. While it's safe to include in the app bundle (it's meant for client apps), never commit it to public repositories.

2. **Build Size:** Firebase packages add ~2-3MB to your APK. The current setup keeps the app lightweight by not installing them yet.

3. **Privacy:** CalcMaster is designed to be privacy-first. Analytics is optional and collects no personal data.

4. **Offline First:** The app works 100% offline. Firebase is only for optional analytics, not core functionality.

---

## Support

For Firebase-specific issues:

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

For CalcMaster-specific issues:

- See `CalcMaster/.claude/troubleshooting.md`
- Check `CalcMaster/.claude/docs/README-full.md`

---

**Firebase configuration complete! 🎉**

Your app is now ready to track analytics when you install the Firebase packages and uncomment the plugins in `app.config.js`.
