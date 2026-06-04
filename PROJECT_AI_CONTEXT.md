# CalcMaster — AI Project Context

> **Purpose of this file**: Give any AI (Claude, ChatGPT, Gemini) or human reader a complete understanding of this project in one read. Also serves as my personal interview-prep cheat sheet.

---

## 1. Quick Snapshot (TL;DR)

- **Project ID**: `calc-master`
- **Title**: CalcMaster — Multi Calculator Mobile App
- **Category**: Mobile App / Utility
- **Status**: Live
- **Year**: 2026
- **Role**: Solo Developer (Self)
- **Duration**: 2026-03
- **Local path**: `a_APP/3. multi calculator/CalcMaster/`
- **GitHub**: https://github.com/mahendra2811/app-calc-master

## 2. One-Sentence Description
A multi-calculator React Native (Expo) app — bundles many calculators (basic, scientific, GST, EMI, percentage, age, date diff, etc.) into one app with i18n, localized number formatting, and persistent calculation history.

## 3. Long Description
CalcMaster is the third app in my Expo learning-to-production series and the most feature-dense of the three (Unit Converter → BMI → CalcMaster). It uses `i18n-js + expo-localization` for translation, NativeWind for Tailwind styling, AsyncStorage for history persistence, expo-haptics for tactile feedback, deep linking via expo-linking, and `uuid` for session IDs in history. The goal: one install instead of 10 separate calculator apps, with proper Indian locale support (lakh/crore formatting via Intl APIs).

## 4. Tech Stack
- **Framework**: Expo SDK, Expo Router
- **UI**: React Native, NativeWind + Tailwind
- **Storage**: `@react-native-async-storage/async-storage`
- **i18n**: `i18n-js`, `expo-localization`
- **Native modules**: `expo-haptics`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`
- **Animation**: `react-native-reanimated`, `react-native-worklets`
- **IDs**: `uuid`

## 5. Key Highlights
- Multi-calculator suite in one app (vs 5+ separate downloads)
- i18n (English + Hindi planned) via `i18n-js`
- Localized number formatting (Indian lakh/crore vs US million)
- AsyncStorage history per calculator
- Native haptics on result events
- File-based routing with Expo Router
- Splash screen + status-bar theming

## 6. Problem → Solution
- **Problem**: Users install 5+ calculator apps for different use-cases (GST, EMI, age, scientific). Each app is ad-heavy.
- **Solution**: One ad-free app with consistent UI for all common calculators, with India-specific formatting that competitors get wrong.

## 7. Architecture
- File-based routing via Expo Router — likely `app/(tabs)/[calc].tsx` or per-calc screens
- i18n initialized once with `expo-localization` device locale
- Per-calculator history stored in AsyncStorage under namespaced keys
- Shared "calculator" engine layer (math) + per-calc UI layer

## 8. Important File Paths
- App icon: `assets/icon.png`
- Splash: `assets/splash-icon.png`
- Android adaptive icon: `assets/android-icon-foreground.png`

## 9. Tags
`expo`, `react-native`, `calculator`, `i18n`, `nativewind`, `india`, `mobile`

---

## 10. Interview Questions I Should Be Ready For

### Beginner / Conceptual
1. How does `i18n-js` differ from `react-i18next` or `next-intl`?
2. How does `expo-localization` detect device locale? What about regional variations (en-IN vs en-US)?
3. Why use `uuid` for history entries instead of timestamps?
4. What is NativeWind and how does it differ from inline `StyleSheet`?
5. How does Expo Router differ from React Navigation directly?

### Architecture / Design
6. How did you structure the codebase to add new calculators easily? (Plugin pattern? Registry?)
7. How would you support cloud sync of history across devices?
8. How would you implement a "favorites" or "pinned calculators" feature?
9. How would you handle complex calculators like financial NPV/IRR that need iterative algorithms?
10. How do you keep the splash screen visible until the i18n bundle is loaded?

### Implementation
11. How do you format `1,00,000` in Indian style? (Intl.NumberFormat with `en-IN`)
12. How do you handle right-to-left languages if you added Arabic / Urdu later?
13. How do you persist calculation history without exploding storage size?
14. How does Expo handle splash screen on Android vs iOS?
15. How would you sync the active theme (light/dark) with system?

### GST / EMI specific
16. What's the GST formula? Inclusive vs exclusive tax — how do you compute both?
17. EMI formula: `EMI = P × r × (1+r)^n / ((1+r)^n - 1)`. How do you handle r=0 (interest-free)?
18. How do you handle floating-point errors in financial math? (Hint: integer rupees × 100 paise)
19. How would you produce an amortization schedule? (Loop over n months, track principal vs interest)

### Edge Cases / Performance
20. What happens when AsyncStorage grows to 6 MB? How would you migrate to SQLite/MMKV?
21. How do you handle huge inputs (1e308) without crashing?
22. How do you avoid keyboard covering the input on Android?
23. How would you add unit tests for the calculator engines?

### Distribution
24. How do you ship i18n bundles? Bundled at build vs lazy-loaded?
25. How do you A/B test calculator layouts via EAS Update channels?

---

## 11. Extra Talking Points (Things to Bring Up Voluntarily)

- **Why this beats single-purpose calc apps**: Bundling = one set of permissions, one update pipeline, one Play Store listing.
- **Indian formatting was the hidden value**: Western calc apps show `100,000` — Indian users want `1,00,000`. Built-in via `Intl.NumberFormat("en-IN")`.
- **i18n architecture**: Translation files are JSON per locale; lazy-loaded based on device locale; fallback chain `hi → en`.
- **Why I chose i18n-js over react-intl**: Smaller bundle, simpler API; my app doesn't need ICU MessageFormat.
- **Future plans**: Add scientific (matrix, calculus), tip calc with Indian service charge rules, loan comparison, SIP calculator.
- **What I learned**: Calculator "engines" should be pure functions — easy to test, easy to reuse across web (Next.js port someday).

---

## 12. If I Need to Revisit This Project Later
Read in this order:
1. `package.json` — Expo SDK version, i18n libs
2. `app/_layout.tsx` — root nav + i18n init
3. `lib/i18n.ts` or wherever i18n is initialized
4. `lib/calculators/` — per-calc math modules (pure functions)
5. AsyncStorage helpers

To run locally:
```bash
cd "a_APP/3. multi calculator/CalcMaster"
npm install
npx expo start
```

Indian number formatting snippet:
```ts
new Intl.NumberFormat("en-IN").format(100000)  // → "1,00,000"
new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(100000)
// → "₹1,00,000.00"
```

EMI formula reminder:
```
EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
P = principal, r = monthly interest (annual%/12/100), n = months
```
