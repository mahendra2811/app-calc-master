# EAS Android Build Failure — Analysis & Pending Fixes

> **Status:** ⚠️ Build still failing after 2 rounds of fixes
> **Last updated:** 2026-03-20
> **Build profile:** `production` (AAB format)

---

## What Has Been Fixed So Far

### Fix 1 — Firebase packages removed (commit `f47410e`)
**Problem:** `@react-native-firebase/app` and `@react-native-firebase/analytics` were installed as native npm packages. Expo auto-links ALL native packages regardless of env vars. Firebase BOM 34.10.0 conflicted with other AARs.
**Symptom:** `> Task :app:checkReleaseAarMetadata FAILED` (very early in build)
**Fix applied:**
- Removed `@react-native-firebase/app`, `@react-native-firebase/analytics`, `firebase` from `package.json`
- Removed unconditional `googleServicesFile` from `app.config.js` (was always injecting Google Services plugin)
- Gitignored `assets/google-services.json`
- Set `EXPO_PUBLIC_FIREBASE_ENABLED=false`, `EXPO_PUBLIC_ANALYTICS_ENABLED=false` in `.env`

**Result:** ✅ Firebase fully gone from build. Build now progresses much further.

---

### Fix 2 — Native library pickFirst rules (commit `bb80ef8`)
**Problem:** `react-native-reanimated`, `react-native-worklets`, and `expo-modules-core` all ship `libc++_shared.so` and `libfbjni.so`. Without `pickFirst` rules, Gradle's `mergeReleaseNativeLibs` task fails on duplicates.
**Symptom:** Build log truncated at `> Task :react-native-safe-area-context:mergeReleaseJniLibFolders` → `> Task :react-na...`
**Fix applied:** Added to `app.config.js` → `expo-build-properties` android config:
```javascript
packagingOptions: {
  pickFirst: ["**/libc++_shared.so", "**/libfbjni.so"],
},
```

**Result:** ❓ Build still fails — actual error unknown (log truncated at 50K chars in user message)

---

## Current State of `app.config.js`

```javascript
["expo-build-properties", {
  android: {
    minSdkVersion: 24,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    enableProguardInReleaseBuilds: true,
    enableShrinkResourcesInReleaseBuilds: true,
    useLegacyPackaging: false,
    packagingOptions: {
      pickFirst: ["**/libc++_shared.so", "**/libfbjni.so"],
    },
  },
  ios: { deploymentTarget: "15.1", useFrameworks: "static" },
}]
```

---

## How to Get the Actual Error

The build log shared in chat was truncated at 50K chars. The real error is not visible.

**Steps:**
1. Open the EAS build page (latest build URL from `eas build` output)
2. Click on the **"Run gradlew"** phase
3. Scroll to the **very bottom** of the log
4. Look for lines with `FAILED`, `error:`, `Exception`, or `BUILD FAILED`
5. Share the last 50–100 lines

---

## Most Likely Remaining Causes (In Priority Order)

### Candidate A — R8/ProGuard stripping native module registration
`enableProguardInReleaseBuilds: true` enables R8. If R8 removes React Native module registration classes, the app builds but crashes on launch (or build itself fails if classes are needed at build time).

**How to test:** Temporarily set `enableProguardInReleaseBuilds: false` and `enableShrinkResourcesInReleaseBuilds: false` in `app.config.js`. If build passes → ProGuard is the issue.

**Fix if confirmed:** Add ProGuard keep rules via `extraProguardRules` in `expo-build-properties`:
```javascript
extraProguardRules: `
  -keep class com.swmansion.reanimated.** { *; }
  -keep class com.swmansion.worklets.** { *; }
  -keep class com.facebook.react.turbomodule.** { *; }
  -keep class com.facebook.react.bridge.** { *; }
  -keep class expo.modules.** { *; }
`,
```

---

### Candidate B — More duplicate native libraries
`libc++_shared.so` and `libfbjni.so` were added to `pickFirst`, but there may be additional conflicting `.so` files from other packages.

**How to test:** Look at the FAILED task name in the actual error. If it's still `mergeReleaseNativeLibs`, the error message will list which `.so` file is conflicting.

**Fix if confirmed:** Add the specific file to `packagingOptions.pickFirst`:
```javascript
pickFirst: [
  "**/libc++_shared.so",
  "**/libfbjni.so",
  "**/libhermes.so",        // if hermes conflict
  "**/libworklets.so",       // if worklets conflict
  "**/libreanimated.so",     // if reanimated conflict
],
```

---

### Candidate C — expo-dev-client in production build
`expo-dev-client` is in `dependencies` (not `devDependencies`). The `production` EAS profile does NOT have `developmentClient: true`, but the package still gets compiled. In some SDK 55 + New Architecture combinations this can cause issues.

**How to test:** Look at whether `expo-dev-client`, `expo-dev-launcher`, or `expo-dev-menu` tasks appear in the FAILED section.

**Fix if confirmed:** Remove `expo-dev-client` from `dependencies` and only install it for dev/preview builds, OR add to `eas.json` production profile:
```json
"production": {
  "android": { "buildType": "app-bundle" },
  "env": { "EXPO_NO_DEVELOPMENT_CLIENT": "1" }
}
```

---

### Candidate D — react-native-worklets C++ build failure
`react-native-worklets 0.7.2` compiles C++ code on the EAS build server. The EAS build environment uses NDK `27.1.12297006`. There could be a C++ compilation error specific to the server environment.

**How to test:** Look for C++ compiler error lines in the actual build log (lines starting with file paths ending in `.cpp:` or `.h:`).

**Fix if confirmed:** Downgrade to a more stable version:
```bash
npx expo install react-native-worklets@0.6.x
npx expo install react-native-reanimated@4.1.x  # match worklets version
```

---

### Candidate E — Gradle 9.0.0 breaking change
The build uses Gradle 9.0.0. Some patterns used in older `build.gradle` templates (e.g., deprecated `packagingOptions` syntax, removed APIs) can fail with Gradle 9.

**How to test:** Look for `DeprecatedException` or `NoSuchMethodError` in the Gradle output.

**Fix if confirmed:** Usually an Expo SDK update or specific Gradle property fix.

---

## Quick Debug Checklist for Next Session

When resuming, do these in order:

1. **Get the actual error first:**
   - Open the EAS build page → "Run gradlew" phase → scroll to bottom
   - Note the exact FAILED task name and error message

2. **Quick isolation test — disable ProGuard:**
   ```javascript
   // In app.config.js, expo-build-properties android:
   enableProguardInReleaseBuilds: false,
   enableShrinkResourcesInReleaseBuilds: false,
   ```
   Run `eas build --platform android --profile production`. If it passes → Candidate A.

3. **Try preview (APK) build:**
   ```bash
   eas build --platform android --profile preview
   ```
   APK and AAB builds go through slightly different Gradle paths. If preview passes → the issue may be AAB-specific.

4. **Try local prebuild + Gradle:**
   ```bash
   npx expo prebuild --clean --platform android
   cd android && ./gradlew :app:bundleRelease 2>&1 | grep -A 5 "FAILED\|error:\|Exception"
   ```
   Gives faster feedback than EAS.

---

## Package Versions at Time of Analysis

| Package | Version | Has native code |
|---------|---------|-----------------|
| expo | ~55.0.8 | ✅ |
| react-native | 0.83.2 | ✅ |
| react-native-reanimated | 4.2.1 | ✅ C++ |
| react-native-worklets | 0.7.2 | ✅ C++ |
| react-native-screens | ~4.23.0 | ✅ Kotlin |
| react-native-safe-area-context | ~5.6.2 | ✅ Kotlin |
| expo-modules-core | 55.0.17 | ✅ (links worklets) |
| expo-dev-client | ~55.0.18 | ✅ |
| @react-native-async-storage/async-storage | 2.2.0 | ✅ Java |

**Gradle version on EAS:** 9.0.0
**NDK version:** 27.1.12297006
**Kotlin version:** 2.1.20
