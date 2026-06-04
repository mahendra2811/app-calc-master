# CalcMaster — Quick Reference

**All-in-one Android calculator app. 36 calculators. Fully offline. Bilingual (EN/HI).**

---

## Stack
`Expo SDK 55` · `React Native 0.83` · `expo-router v5` · `NativeWind v4` · `TailwindCSS 3.x`

## Run
```bash
npx expo start --clear     # Dev (Expo Go)
eas build -p android --profile preview      # APK
eas build -p android --profile production   # AAB (Play Store)
```

## 36 Calculators

**Finance (24):** SIP · Lumpsum · EMI · Simple Interest · Compound Interest · FD/RD · PPF · Currency Converter · GST · Profit & Loss · Discount · Salary/CTC · Income Tax · Mortgage · Retirement · ROI · NPS · CAGR · HRA · Gratuity · EPF · Buy vs Rent · Net Worth · Break-Even

**Math (12):** Basic · Scientific · Percentage · Fractions · Number System · Prime Checker · GCD & LCM · Statistics · Matrix · Quadratic · Logarithm · nPr & nCr

## Key Files
| Need to... | Edit this file |
|-----------|---------------|
| Add a calculator | `src/utils/calculator-registry.ts` + `src/constants/calculators.ts` + new screen |
| Change colors | `global.css` (CSS vars) |
| Add translations | `src/i18n/locales/en.ts` + `hi.ts` |
| Change storage keys | `src/constants/storage-keys.ts` |
| Enable ads | Set `EXPO_PUBLIC_ADS_ENABLED=true` in `.env` |
| Enable analytics | Set `EXPO_PUBLIC_ANALYTICS_ENABLED=true` in `.env` |

## Architecture in 3 Lines
1. Routes (`src/app/`) are thin wrappers — real logic is in `src/screens/`
2. All 36 calculators share one dynamic route `calculator/[slug].tsx` via a registry
3. State = React Context (split state/dispatch) · Storage = AsyncStorage with in-memory cache

## Rules
- Every calculator screen → `React.memo()` + `CalculatorShell` wrapper
- Numbers → `formatIndianCurrency()` from `src/utils/format-number.ts`
- Strings → `t()` from `useLanguage()` — never hardcode English
- Colors → Tailwind semantic tokens (`bg-background`, `text-primary`) — never hardcode hex
- Storage → `storage.get/set()` from `src/utils/storage.ts` — never call AsyncStorage directly
- Packages → `npx expo install pkg` — never `npm install pkg` directly

## Env Variables
```env
EXPO_PUBLIC_ADS_ENABLED=false          # true → enables AdMob
EXPO_PUBLIC_ANALYTICS_ENABLED=false    # true → enables Firebase Analytics
EXPO_PUBLIC_FIREBASE_ENABLED=false     # true → loads Firebase
```
App works 100% with all values as `false`.
