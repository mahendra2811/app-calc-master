# CalcMaster — Claude Context File

> This file is automatically loaded by Claude Code. It provides essential project context so Claude can assist effectively without repeated explanations.

## What This Project Is

**CalcMaster** is a production-ready, fully-offline Android calculator app built with Expo SDK 55 (React Native 0.83). It contains **36 calculators** across Finance (24) and Math (12) categories. The app is bilingual (English + Hindi), has light/dark theme support, stores all history locally via AsyncStorage, and has pre-wired AdMob + Firebase Analytics infrastructure that activates only when `.env` credentials are provided.

**Package:** `com.calcmaster.app`
**Target:** Android-first (Google Play Store), tablet-responsive

---

## Tech Stack (Critical — Do Not Deviate)

| Tech | Version | Why |
|------|---------|-----|
| Expo SDK | ~55.0.8 | Latest stable |
| expo-router | ~55.0.7 | File-based routing v5 |
| NativeWind | ^4.1.0 | TailwindCSS for RN |
| tailwindcss | ^3.4.x | **NOT v4** — NW4 requires 3.x |
| react-native-reanimated | 4.2.1 | Animations |
| i18n-js | ^4.5.0 | Translations (5KB, no react-i18next) |
| AsyncStorage | 2.2.0 | Local persistence |

**Never install:** redux/zustand/jotai, moment/date-fns, lodash, custom fonts, expo-ads-admob (deprecated).

---

## File Structure (Key Paths)

```
src/
├── app/              # Routes only (thin wrappers)
│   ├── _layout.tsx   # Root: Providers + AnimatedSplash
│   ├── (tabs)/       # Bottom tabs: Home, Favorites, History, Settings
│   ├── calculator/[slug].tsx  # ALL 36 calculators via registry
│   └── search.tsx
├── screens/
│   ├── calculators/  # 36 calculator implementations
│   └── HomeScreen, FavoritesScreen, HistoryScreen, SettingsScreen, SearchScreen
├── components/       # Shared UI (CalculatorShell, ResultCard, etc.)
├── contexts/         # ThemeContext, LanguageContext, HistoryContext, FavoritesContext, RecentContext
├── hooks/            # useCalculator, useDebouncedValue, useResponsive, useNavigationTracking
├── i18n/locales/     # en.ts + hi.ts (complete translations)
├── utils/            # storage.ts, format-number.ts, math-helpers.ts, calculator-registry.ts
├── constants/        # calculators.ts (36 metadata objects), colors.ts, storage-keys.ts
├── types/            # calculator.ts, navigation.ts
└── services/         # ads.ts, firebase.ts
```

---

## Architecture Patterns

### Dynamic Calculator Routing
All 36 calculators are accessed via a **single dynamic route**: `src/app/calculator/[slug].tsx`.
The slug maps to a component via `src/utils/calculator-registry.ts`.

### Context Pattern (Split State/Dispatch)
Every context is split into State + Dispatch to prevent unnecessary re-renders:
```typescript
// CORRECT
const stateValue = useMemo(() => ({ theme, resolvedTheme }), [theme, resolvedTheme]);
// WRONG — inline object causes re-renders on every parent render
<ThemeStateContext.Provider value={{ theme, resolvedTheme }}>
```

Provider nesting order (outer → inner): `Theme → Language → Favorites → Recent → History`

### Storage Pattern
`src/utils/storage.ts` is a singleton with **in-memory cache + debounced AsyncStorage writes**.
Always use `storage.get/set`, never call AsyncStorage directly.

### Number Formatting
Always use `formatIndianCurrency()` from `src/utils/format-number.ts` for ₹ amounts.
Uses `Intl.NumberFormat('en-IN')` → produces Indian lakh/crore format (1,23,456).

### Calculator Shell
Every calculator screen MUST:
1. Be wrapped in `<CalculatorShell slug="..." onReset={...}>`
2. Be wrapped in `React.memo()`
3. Use `useCalculator()` hook for history saving
4. Auto-calculate on input change (debounced 300ms)

---

## Design System

### Colors (CSS Variables via global.css)
```
primary: teal #0D9488 (light) / #2DD4BF (dark)
secondary: indigo #6366F1 (light) / #818CF8 (dark)
accent: amber #F59E0B
success: green #22C55E
error: red #EF4444
```

### Tailwind Semantic Tokens
Use these class names (auto-switch light/dark):
- `bg-background`, `bg-surface`, `bg-surface-elevated`
- `text-text`, `text-text-secondary`, `text-text-tertiary`
- `border-border`
- `text-primary`, `bg-primary`

**Dark mode config:** `tailwind.config.js` uses `darkMode: "class"` (required for NativeWind manual switching).

---

## i18n Usage

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
const { t } = useLanguage();
// Usage:
t('calculators.sip.name')  // → "SIP Calculator" or "SIP कैलकुलेटर"
```

Never hardcode English strings in components — always use `t()`.

---

## Ads & Analytics (Disabled by Default)

Both are **no-ops** until `.env` is configured:
```env
EXPO_PUBLIC_ADS_ENABLED=true         # Enable AdMob
EXPO_PUBLIC_ANALYTICS_ENABLED=true   # Enable Firebase Analytics
EXPO_PUBLIC_FIREBASE_ENABLED=true    # Required for Analytics
```

Check before using: `import { adsEnabled } from '@/services/ads'`

---

## Common Mistakes to Avoid

1. **Don't use `useColorScheme` from react-native** — use `useTheme()` from ThemeContext
2. **Don't import from `nativewind` directly** for setColorScheme — it's wrapped in ThemeContext
3. **Don't use `router.push` for calculators** — use `router.push('/calculator/' + slug)`
4. **Don't add new packages without checking** SDK 55 compatibility via `npx expo install`
5. **Don't use `StyleSheet.create`** — use NativeWind className only
6. **Don't hardcode colors** — use Tailwind semantic tokens
7. **Don't skip `React.memo`** on calculator screens — performance critical

---

## Calculator Slugs Reference

| Slug | Component |
|------|-----------|
| sip-calculator | SIPCalculator |
| lumpsum-calculator | LumpSumCalculator |
| emi-calculator | EMICalculator |
| simple-interest | SimpleInterestCalculator |
| compound-interest | CompoundInterestCalculator |
| fd-rd-calculator | FDRDCalculator |
| ppf-calculator | PPFCalculator |
| currency-converter | CurrencyConverter |
| gst-calculator | GSTCalculator |
| profit-loss | ProfitLossCalculator |
| discount-calculator | DiscountCalculator |
| salary-calculator | SalaryCalculator |
| income-tax-calculator | IncomeTaxCalculator |
| mortgage-calculator | MortgageCalculator |
| retirement-calculator | RetirementCalculator |
| roi-calculator | ROICalculator |
| nps-calculator | NPSCalculator |
| cagr-calculator | CAGRCalculator |
| hra-calculator | HRACalculator |
| gratuity-calculator | GratuityCalculator |
| epf-calculator | EPFCalculator |
| home-loan-vs-rent | HomeLoanVsRent |
| net-worth-calculator | NetWorthCalculator |
| break-even-calculator | BreakEvenCalculator |
| basic-calculator | BasicCalculator |
| scientific-calculator | ScientificCalculator |
| percentage-calculator | PercentageCalculator |
| fraction-calculator | FractionCalculator |
| number-system-converter | NumberSystemConverter |
| prime-checker | PrimeChecker |
| gcd-lcm-calculator | GCDLCMCalculator |
| statistics-calculator | StatisticsCalculator |
| matrix-calculator | MatrixCalculator |
| quadratic-solver | QuadraticSolver |
| logarithm-calculator | LogarithmCalculator |
| permutation-combination | PermutationCombination |

---

## Build Commands

```bash
# Development
npx expo start --clear

# Android APK (preview)
eas build --platform android --profile preview

# Android AAB (production Play Store)
eas build --platform android --profile production

# Fix dependency warnings
npx expo install --fix
```
