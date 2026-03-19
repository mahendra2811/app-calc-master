# CalcMaster — Setup & Build Guide

## Prerequisites

- Node.js >= 18
- npm or yarn
- Android Studio (for emulator) or a physical Android device with Expo Go
- EAS CLI (for production builds): `npm install -g eas-cli`

---

## 1. Install Dependencies

```bash
npm install
```

If you get peer dependency errors:

```bash
npm install --legacy-peer-deps
```

---

## 2. Environment Setup

Copy the env template (optional — app works fully without it):

```bash
cp .env.example .env
```

Edit `.env` to add AdMob/Firebase keys when ready. Leave empty for now.

---

## 3. Run in Development

### Android (Expo Go)

```bash
npx expo start --clear
```

Then press `a` to open on Android emulator, or scan the QR code with Expo Go app on your phone.

### Android (direct)

```bash
npx expo start --android --clear
```

### Web (browser preview)

```bash
npx expo start --web --clear
```

---

## 4. Fix Version Warnings

If you see package version warnings, run:

```bash
npx expo install --fix
```

This auto-resolves all packages to versions compatible with your Expo SDK.

---

## 5. Build for Android

### Development APK (for testing)

```bash
# Login to EAS first (one-time)
eas login

# Build debug APK
eas build --platform android --profile development
```

### Preview APK (internal testing)

```bash
eas build --platform android --profile preview
```

### Production AAB (for Play Store)

```bash
eas build --platform android --profile production
```

The production build:
- Generates an `.aab` (Android App Bundle)
- Enables ProGuard/R8 minification
- Enables resource shrinking
- Enables ads and analytics (if env vars are set in `eas.json`)

---

## 6. Local APK Build (without EAS cloud)

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK locally
cd android && ./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`

---

## 7. Submit to Play Store

```bash
# Requires google-services.json and pc-api-key.json
eas submit --platform android --profile production
```

---

## 8. Common Commands

| Command | Description |
|---------|-------------|
| `npx expo start --clear` | Start dev server (clear cache) |
| `npx expo start --android` | Start and open on Android |
| `npx expo start --web` | Start and open in browser |
| `npx expo install --fix` | Fix package version mismatches |
| `npx expo prebuild --clean` | Regenerate native projects |
| `npx tsc --noEmit` | TypeScript type check |
| `eas build -p android --profile preview` | Build preview APK |
| `eas build -p android --profile production` | Build production AAB |
| `eas submit -p android` | Submit to Play Store |

---

## 9. Project Structure

```
src/
├── app/              # Routes (expo-router file-based)
│   ├── (tabs)/       # Bottom tab screens
│   └── calculator/   # Dynamic [slug] route for all 36 calcs
├── screens/          # Screen implementations
│   └── calculators/  # 36 calculator screens (24 finance + 12 math)
├── components/       # 16 shared UI components
├── contexts/         # 5 React Context providers
├── hooks/            # Custom hooks
├── i18n/             # English + Hindi translations
├── utils/            # Storage, formatting, math helpers
├── constants/        # Calculator metadata, colors, storage keys
├── types/            # TypeScript interfaces
└── services/         # Ads & analytics stubs
```

---

## 10. Troubleshooting

**"Cannot find module react-native-web"**
→ Run: `npx expo install react-native-web react-dom`

**Version mismatch warnings**
→ Run: `npx expo install --fix`

**Metro bundler stuck**
→ Stop it (Ctrl+C), then: `npx expo start --clear`

**TypeScript errors**
→ Run: `npx tsc --noEmit` to see all errors

**Peer dependency conflicts on npm install**
→ Run: `npm install --legacy-peer-deps`
