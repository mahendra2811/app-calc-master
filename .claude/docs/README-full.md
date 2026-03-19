# CalcMaster — Complete Project Documentation

> **Version:** 1.0.0 · **Platform:** Android (Google Play) · **SDK:** Expo 55 · **Date:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Project Structure](#4-project-structure)
5. [Architecture](#5-architecture)
6. [All 36 Calculators](#6-all-36-calculators)
7. [Design System](#7-design-system)
8. [Internationalization](#8-internationalization)
9. [State Management](#9-state-management)
10. [Storage & Persistence](#10-storage--persistence)
11. [Navigation](#11-navigation)
12. [Shared Components](#12-shared-components)
13. [Ads & Analytics](#13-ads--analytics)
14. [Build & Deployment](#14-build--deployment)
15. [Adding a New Calculator](#15-adding-a-new-calculator)
16. [Environment Variables](#16-environment-variables)

---

## 1. Project Overview

**CalcMaster** is a production-ready, fully-offline Android calculator app with 36 calculators across Finance and Math categories.

**Core Features:**
- 36 fully functional calculators with complete mathematical formulas
- Bilingual: English & Hindi (Devanagari script)
- Light/Dark theme with system auto-detection
- Per-calculator calculation history (stored locally, no cloud)
- Favorites system (star any calculator)
- Recent calculators (last 10 used)
- Full-text search across all 36 calculators
- Indian number formatting (lakh/crore system)
- Responsive layout (phone + tablet)
- Pre-wired AdMob + Firebase Analytics (disabled until `.env` configured)

**Core Non-Features (by design):**
- No network calls (fully offline)
- No user accounts
- No cloud sync
- No analytics by default (privacy-first)

---

## 2. Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ~55.0.8 | Core framework (React Native 0.83) |
| expo-router | ~55.0.7 | File-based routing v5 |
| nativewind | ^4.1.0 | TailwindCSS for React Native |
| tailwindcss | ^3.4.x | CSS utility framework (NOT v4!) |
| react-native-reanimated | 4.2.1 | Animations (Spring, Timing) |
| @react-native-async-storage | 2.2.0 | Local key-value storage |
| expo-localization | ~55.0.9 | Device locale detection |
| i18n-js | ^4.5.0 | Lightweight translations (5KB) |
| expo-splash-screen | ~55.0.12 | Native splash control |
| expo-haptics | ~55.0.9 | Tactile button feedback |
| expo-build-properties | ~55.0.10 | ProGuard/R8 optimization |
| @expo/vector-icons | ^15.0.2 | FontAwesome6, MaterialCommunity |
| react-native-safe-area-context | ~5.6.2 | Safe area insets |
| uuid | ^9.x | Unique IDs for history entries |

**Optional (activate via `.env`):**
- `react-native-google-mobile-ads` — AdMob Banner/Interstitial/Rewarded
- `@react-native-firebase/analytics` — Firebase Analytics

---

## 3. Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Android device or emulator with Expo Go installed

### Setup
```bash
# 1. Clone and install
git clone <repo>
cd CalcMaster
npm install

# 2. Configure environment (optional — app works without it)
cp .env.example .env
# Edit .env to add AdMob/Firebase credentials

# 3. Start development server
npx expo start --clear

# 4. Open on Android
# Option A: Scan QR code in Expo Go
# Option B: Press 'a' for Android emulator
```

### Common Commands
```bash
npx expo start --clear          # Start with cache cleared
npx expo install --fix          # Fix package version mismatches
npx tsc --noEmit               # TypeScript check (no build)
eas build -p android --profile preview     # Build APK for testing
eas build -p android --profile production  # Build AAB for Play Store
```

---

## 4. Project Structure

```
CalcMaster/
├── .env.example              # Template (commit this)
├── .env                      # Secrets (gitignored)
├── app.config.js             # Dynamic Expo config (reads .env)
├── babel.config.js           # Babel + NativeWind + Reanimated
├── metro.config.js           # Metro + NativeWind
├── tailwind.config.js        # Tailwind tokens + darkMode: "class"
├── global.css                # CSS variables for light/dark themes
├── tsconfig.json             # TypeScript paths (@/* alias)
├── eas.json                  # EAS Build profiles
│
├── assets/images/            # icon.png, adaptive-icon.png, splash-icon.png
│
└── src/
    ├── app/                  # Routes (thin wrappers only)
    │   ├── _layout.tsx       # Root: Providers + AnimatedSplash
    │   ├── (tabs)/           # Home, Favorites, History, Settings
    │   ├── calculator/
    │   │   └── [slug].tsx    # Single route for all 36 calculators
    │   └── search.tsx        # Search modal
    │
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── FavoritesScreen.tsx
    │   ├── HistoryScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── SearchScreen.tsx
    │   └── calculators/      # 36 calculator implementations
    │
    ├── components/           # Shared UI components
    ├── contexts/             # State management (5 contexts)
    ├── hooks/                # Custom hooks (4 hooks)
    ├── i18n/locales/         # en.ts, hi.ts translations
    ├── utils/                # Helpers, registry, storage
    ├── constants/            # Calculator metadata, colors, keys
    ├── types/                # TypeScript interfaces
    └── services/             # Ads, Firebase (optional)
```

---

## 5. Architecture

### The Registry Pattern
All 36 calculators are accessed through a **single dynamic route** (`calculator/[slug].tsx`).

```
User taps "SIP Calculator"
        ↓
router.push('/calculator/sip-calculator')
        ↓
[slug].tsx extracts slug = "sip-calculator"
        ↓
calculatorRegistry['sip-calculator'] = SIPCalculator component
        ↓
Renders <SIPCalculator />
```

This means adding a calculator = adding 1 file + 2 registry entries.

### Context Architecture (Split Pattern)
Each domain has TWO contexts — state and dispatch — to prevent unnecessary re-renders:

```
ThemeProvider (outermost)
  LanguageProvider
    FavoritesProvider
      RecentProvider
        HistoryProvider (innermost)
          App
```

### Storage Pipeline
```
User inputs change
    ↓ (300ms debounce)
calculate() runs
    ↓
setState(result) — UI updates instantly
    ↓ (1500ms debounce)
saveToHistory() → HistoryContext.addHistory()
    ↓
storage.set() → cache updates immediately
    ↓ (500ms debounce)
AsyncStorage.setItem() — disk write
```

---

## 6. All 36 Calculators

### Finance (24)

| # | Name | Slug | Formula |
|---|------|------|---------|
| 1 | SIP Calculator | `sip-calculator` | `M = P × [{(1+r)^n - 1} / r] × (1+r)` |
| 2 | Lumpsum Calculator | `lumpsum-calculator` | `A = P × (1 + r/100)^t` |
| 3 | EMI Calculator | `emi-calculator` | `EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]` |
| 4 | Simple Interest | `simple-interest` | `SI = (P × R × T) / 100` |
| 5 | Compound Interest | `compound-interest` | `A = P × (1 + r/n)^(n×t)` |
| 6 | FD/RD Calculator | `fd-rd-calculator` | FD: quarterly compounding; RD: monthly deposits |
| 7 | PPF Calculator | `ppf-calculator` | 15-year yearly compounding at given rate |
| 8 | Currency Converter | `currency-converter` | User-provided exchange rate (offline) |
| 9 | GST Calculator | `gst-calculator` | Add/Remove GST with CGST/SGST split |
| 10 | Profit & Loss | `profit-loss` | `(SP - CP) / CP × 100` |
| 11 | Discount Calculator | `discount-calculator` | `Final = Original × (1 - D/100)` |
| 12 | Salary/CTC Calculator | `salary-calculator` | Indian salary structure (Basic/HRA/PF) |
| 13 | Income Tax | `income-tax-calculator` | Old vs New regime (FY 2025-26 slabs) |
| 14 | Mortgage Calculator | `mortgage-calculator` | EMI formula + amortization |
| 15 | Retirement Calculator | `retirement-calculator` | Inflation-adjusted corpus calculation |
| 16 | ROI Calculator | `roi-calculator` | Simple + Annualized ROI |
| 17 | NPS Calculator | `nps-calculator` | Monthly contribution to age 60 |
| 18 | CAGR Calculator | `cagr-calculator` | `CAGR = (FV/PV)^(1/n) - 1` |
| 19 | HRA Calculator | `hra-calculator` | Min of 3 conditions (metro/non-metro) |
| 20 | Gratuity Calculator | `gratuity-calculator` | `G = (15 × last salary × years) / 26` |
| 21 | EPF Calculator | `epf-calculator` | 12% employee + 3.67% employer, 8.15% interest |
| 22 | Buy vs Rent | `home-loan-vs-rent` | Total cost of ownership vs renting |
| 23 | Net Worth | `net-worth-calculator` | Assets − Liabilities |
| 24 | Break-Even | `break-even-calculator` | `BEU = Fixed Cost / (SP - VC)` |

### Math (12)

| # | Name | Slug | Description |
|---|------|------|-------------|
| 25 | Basic Calculator | `basic-calculator` | Full arithmetic with history |
| 26 | Scientific Calculator | `scientific-calculator` | Trig, log, powers, constants |
| 27 | Percentage Calculator | `percentage-calculator` | % of number, % change, reverse % |
| 28 | Fraction Calculator | `fraction-calculator` | Add/subtract/multiply/divide fractions |
| 29 | Number System | `number-system-converter` | Binary ↔ Octal ↔ Decimal ↔ Hex |
| 30 | Prime Checker | `prime-checker` | Single check + find primes in range |
| 31 | GCD & LCM | `gcd-lcm-calculator` | Euclidean algorithm for 2-3 numbers |
| 32 | Statistics | `statistics-calculator` | Mean, median, mode, std dev, variance |
| 33 | Matrix Calculator | `matrix-calculator` | 2×2/3×3: add, multiply, det, inverse, transpose |
| 34 | Quadratic Solver | `quadratic-solver` | ax²+bx+c=0 → real/complex roots |
| 35 | Logarithm | `logarithm-calculator` | Log₁₀, logₙ, ln, antilog |
| 36 | nPr & nCr | `permutation-combination` | Permutations + combinations with steps |

---

## 7. Design System

### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `primary` | `#0D9488` (teal-600) | `#2DD4BF` (teal-400) | Buttons, active states |
| `secondary` | `#6366F1` (indigo-500) | `#818CF8` (indigo-400) | Math category |
| `accent` | `#F59E0B` (amber-500) | `#FBBF24` (amber-400) | Stars, favorites |
| `success` | `#22C55E` (green-500) | `#4ADE80` (green-400) | Positive results |
| `error` | `#EF4444` (red-500) | `#F87171` (red-400) | Negative results |
| `background` | `#F9FAFB` (gray-50) | `#111827` (gray-900) | App background |
| `surface` | `#FFFFFF` (white) | `#1F2937` (gray-800) | Cards, inputs |

### Typography (System Font — 0KB overhead)
- Display: 32px Bold (splash screen)
- H1: 24px Bold (screen titles)
- Body: 16px Regular
- Caption: 12px Medium (chips, timestamps)
- Result: 28px Bold (calculator output)

### Grid System
- Phone portrait: 2 columns
- Large phone / landscape: 3 columns
- Tablet portrait: 3-4 columns
- Tablet landscape: 4-5 columns

---

## 8. Internationalization

### Supported Languages
- **English** (`en`) — default
- **Hindi** (`hi`) — Devanagari script, mixed Hinglish for financial terms

### Auto-detection
On first launch, detects device locale. Falls back to English if not Hindi.

### Manual Toggle
Settings screen → Language → English / हिन्दी

### Adding a Translation Key
1. Add key to `src/i18n/locales/en.ts`
2. Add same key to `src/i18n/locales/hi.ts`
3. Use in component: `const { t } = useLanguage(); t('your.key')`

### Retained English Terms in Hindi
These acronyms stay in English even in Hindi mode (financial convention):
SIP, EMI, GST, PPF, CTC, NPS, CAGR, ROI, EPF, HRA, FD, RD, ATM, UPI

---

## 9. State Management

Five React Contexts using the **split state/dispatch pattern**:

### ThemeContext
- Stores: `theme` ('light' | 'dark' | 'system'), `resolvedTheme`
- Syncs: NativeWind `setColorScheme()` → CSS variable swap
- Persists: `@calcmaster/theme`

### LanguageContext
- Stores: `language` ('en' | 'hi'), `t()` function
- Syncs: `i18n.locale`
- Persists: `@calcmaster/language`

### HistoryContext
- Stores: `globalHistory[]` (max 200), per-calculator history (max 50 each)
- Actions: `addHistory`, `clearHistory`, `deleteHistoryEntry`, `toggleHistoryFavorite`
- Persists: `@calcmaster/global_history`, `@calcmaster/history/{calcId}`

### FavoritesContext
- Stores: `favorites[]` (array of slugs)
- Actions: `toggleFavorite`, `isFavorite`
- Persists: `@calcmaster/favorites`

### RecentContext
- Stores: `recentCalculators[]` (last 10 slugs)
- Actions: `addRecent`
- Persists: `@calcmaster/recent`

---

## 10. Storage & Persistence

### Storage Singleton (`src/utils/storage.ts`)
- **Reads:** In-memory cache first → AsyncStorage fallback
- **Writes:** Cache immediately + debounced AsyncStorage (500ms)
- **Total worst-case storage:** ~400KB (well under Android's 6MB limit)

### Data Limits
| Data | Limit | Cleanup |
|------|-------|---------|
| History per calculator | 50 entries | Remove oldest non-favorited |
| Global history | 200 entries | Remove oldest non-favorited |
| Favorites | 36 max | N/A |
| Recent | 10 slugs | Remove oldest |

---

## 11. Navigation

### Route Structure
```
/(tabs)/          → Bottom tab navigator
  index           → Home
  favorites       → Favorites
  history         → History
  settings        → Settings
/calculator/[slug]→ Any of 36 calculators
/search           → Search modal
```

### Tab Bar
- 4 tabs: Home (house), Favorites (star), History (clock), Settings (cog)
- Active: primary color; Inactive: text-tertiary
- Haptic feedback on tab press

### Deep Linking
Scheme: `calcmaster://`
Example: `calcmaster://calculator/sip-calculator`

---

## 12. Shared Components

| Component | Purpose |
|-----------|---------|
| `CalculatorShell` | Wrapper for all 36 calculators (header, history, ads) |
| `CalculatorInput` | Styled numeric/text input with validation |
| `CalculatorSlider` | Slider with bubble value display |
| `CalculatorDropdown` | Bottom-sheet option picker |
| `CalculatorToggle` | Two-option segmented control |
| `ResultCard` | Animated result display (spring animation) |
| `ResultBreakdown` | Expandable detail table (year-by-year, etc.) |
| `CalculatorCard` | Grid card on home screen |
| `CategoryChip` | Filter chip (All/Finance/Math) |
| `SearchBar` | Animated search input |
| `EmptyState` | Empty list placeholder |
| `HistoryItem` | Single history entry row |
| `AdBanner` | AdMob banner (no-op when ads disabled) |
| `ErrorBoundary` | React error boundary |
| `HapticButton` | Pressable with haptic feedback |
| `AnimatedSplash` | 2.5s math symbols → logo animation |

---

## 13. Ads & Analytics

### AdMob (Google)
- Disabled by default — zero cost/impact
- Activate: Set `EXPO_PUBLIC_ADS_ENABLED=true` + add App ID in `.env`
- Ad placements: Banner between inputs and results (CalculatorShell)
- Ad types pre-wired: Banner, Interstitial, Rewarded, App Open

### Firebase Analytics
- Disabled by default
- Activate: Set `EXPO_PUBLIC_ANALYTICS_ENABLED=true` + `EXPO_PUBLIC_FIREBASE_ENABLED=true`
- Events tracked: `calculator_opened`, `calculation_performed`, `history_cleared`, `language_changed`, `theme_changed`
- All events are no-ops when disabled — analytics calls don't throw

---

## 14. Build & Deployment

### Development Build (APK — internal testing)
```bash
eas build --platform android --profile preview
```
Produces an APK installable on any Android device.

### Production Build (AAB — Google Play)
```bash
eas build --platform android --profile production
```
Produces an AAB optimized for Play Store delivery.

### Play Store Submission
```bash
eas submit --platform android
```
Requires `pc-api-key.json` (Google Play service account key).

### Build Configuration (`eas.json`)
| Profile | Output | Use Case |
|---------|--------|----------|
| `development` | APK | Expo dev client |
| `preview` | APK | Internal QA testing |
| `production` | AAB | Play Store upload |

### ProGuard/R8 (enabled in production)
- Minifies and shrinks code
- Target APK size: < 15MB download

---

## 15. Adding a New Calculator

Follow these 4 steps:

### Step 1: Create the screen file
```
src/screens/calculators/MyNewCalculator.tsx
```
Use the template from `.claude/conventions.md#calculator-screen-template`.

### Step 2: Add to calculator registry
```typescript
// src/utils/calculator-registry.ts
import MyNewCalculator from '@/screens/calculators/MyNewCalculator';

export const calculatorRegistry = {
  // ... existing entries
  'my-new-calculator': MyNewCalculator,
};
```

### Step 3: Add metadata
```typescript
// src/constants/calculators.ts
{
  id: 'my-new-calculator',
  slug: 'my-new-calculator',
  category: 'finance', // or 'math'
  icon: 'calculator',
  iconFamily: 'FontAwesome6',
  color: '#0D9488',
},
```

### Step 4: Add translations
```typescript
// src/i18n/locales/en.ts → calculators section
myNew: {
  name: "My New Calculator",
  shortDesc: "What it does briefly",
  // ... input/output labels
}

// src/i18n/locales/hi.ts → same structure in Hindi
```

That's it — the calculator is automatically available in Home, Search, Favorites, History.

---

## 16. Environment Variables

```env
# AdMob — get from https://admob.google.com
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_APP_OPEN_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# Feature flags
EXPO_PUBLIC_ADS_ENABLED=false           # Set to true when AdMob configured
EXPO_PUBLIC_ANALYTICS_ENABLED=false     # Set to true when Firebase configured
EXPO_PUBLIC_FIREBASE_ENABLED=false      # Set to true when google-services.json added
```

All values default to disabled. The app works perfectly with all flags as `false`.

---

## License & Credits

- **Framework:** Expo (MIT)
- **Icons:** FontAwesome Free (SIL OFL 1.1) via @expo/vector-icons
- **Fonts:** System default (no license needed)
- **Financial formulas:** Standard Indian financial calculations per RBI/SEBI guidelines
- **Tax slabs:** FY 2025-26 (India)
