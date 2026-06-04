# CalcMaster — Architecture Reference

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                         │
│  Expo Router (File-based) + NativeWind (TailwindCSS)     │
├──────────────────┬──────────────────────────────────────┤
│   NAVIGATION     │           STATE                       │
│  expo-router v5  │  React Context (split state/dispatch) │
│  Stack + Tabs    │  ThemeContext, LanguageContext,        │
│  Dynamic [slug]  │  HistoryContext, FavoritesContext,     │
│                  │  RecentContext                         │
├──────────────────┴──────────────────────────────────────┤
│                    PERSISTENCE                           │
│  storage.ts singleton (in-memory cache + AsyncStorage)   │
│  No SQLite, no MMKV, no external DB — pure AsyncStorage  │
├─────────────────────────────────────────────────────────┤
│              OPTIONAL SERVICES (disabled by default)     │
│  AdMob (react-native-google-mobile-ads)                  │
│  Firebase Analytics (@react-native-firebase)             │
└─────────────────────────────────────────────────────────┘
```

---

## Navigation Tree

```
src/app/
├── _layout.tsx          ← Root Stack + All Providers + AnimatedSplash gate
├── index.tsx            ← Redirect to /(tabs)
├── (tabs)/
│   ├── _layout.tsx      ← Bottom tab navigator config
│   ├── index.tsx        ← HomeScreen
│   ├── favorites.tsx    ← FavoritesScreen
│   ├── history.tsx      ← HistoryScreen
│   └── settings.tsx     ← SettingsScreen
├── calculator/
│   ├── _layout.tsx      ← Stack header config (title from calc metadata)
│   └── [slug].tsx       ← Dynamic: loads component from calculatorRegistry
├── search.tsx           ← Full-screen search (modal presentation)
└── +not-found.tsx       ← 404 fallback
```

**Key pattern:** Routes are thin wrappers. All real logic lives in `src/screens/`.

---

## Data Flow

### Calculator Calculation Flow
```
User Input
    ↓
useDebouncedValue(300ms)
    ↓
Calculator math function (pure, no side effects)
    ↓
setState(result)
    ↓
ResultCard animates in
    ↓
useCalculator hook debounces 1500ms
    ↓
HistoryContext.addHistory(entry)
    ↓
storage.set() → cache + AsyncStorage
```

### Theme Switching Flow
```
User picks theme in Settings
    ↓
ThemeDispatch.setTheme(value)
    ↓
storage.set(STORAGE_KEYS.THEME, value)
    ↓
resolveTheme() returns 'light' | 'dark'
    ↓
setColorScheme(resolved) via NativeWind
    ↓
CSS variables swap (global.css .dark class)
    ↓
All NativeWind className re-evaluates
```

---

## Context Architecture (Split Pattern)

```typescript
// Two separate contexts per domain — prevents re-renders
const ThemeStateContext = createContext<ThemeState>();
const ThemeDispatchContext = createContext<ThemeDispatch>();

// Components that only read state don't re-render on dispatch changes
function ReadOnlyComponent() {
  const { resolvedTheme } = useContext(ThemeStateContext); // only re-renders when state changes
}

// Components that only dispatch don't re-render on state changes
function SettingsComponent() {
  const { setTheme } = useContext(ThemeDispatchContext); // never re-renders
}
```

---

## Storage Architecture

```typescript
// storage.ts — Singleton with in-memory cache
class Storage {
  private cache: Map<string, any> = new Map();
  private writeTimers: Map<string, NodeJS.Timeout> = new Map();

  get<T>(key: string, fallback: T): Promise<T>
  // 1. Check cache → return immediately (sync speed)
  // 2. Cache miss → AsyncStorage.getItem → parse → cache → return

  set<T>(key: string, value: T): void
  // 1. Write to cache immediately (sync)
  // 2. Debounce 500ms → write to AsyncStorage (async)
  // Result: UI updates instantly, disk write is batched
}
```

**Storage key namespacing:**
```
@calcmaster/theme
@calcmaster/language
@calcmaster/favorites
@calcmaster/recent
@calcmaster/global_history      (max 200 entries)
@calcmaster/history/{calcId}    (max 50 entries per calculator)
```

---

## Calculator Registry Pattern

```typescript
// src/utils/calculator-registry.ts
export const calculatorRegistry: Record<string, React.ComponentType> = {
  'sip-calculator': SIPCalculator,
  'emi-calculator': EMICalculator,
  // ... all 36
};

// src/app/calculator/[slug].tsx
const { slug } = useLocalSearchParams();
const Calculator = calculatorRegistry[slug];
if (!Calculator) return <NotFound />;
return <Calculator />;
```

---

## Component Hierarchy

```
[slug].tsx
└── <CalculatorShell slug="..." onReset={...}>
    ├── <AdBanner />                    (no-op if ads disabled)
    ├── {children}                      (calculator-specific inputs)
    │   ├── <CalculatorInput />
    │   ├── <CalculatorSlider />
    │   ├── <CalculatorDropdown />
    │   └── <CalculatorToggle />
    ├── <ResultCard />                  (animated, positive=green, negative=red)
    ├── <ResultBreakdown />             (expandable detail table)
    ├── <HapticButton onPress={reset}>Reset</HapticButton>
    └── <HistoryList calcId={slug} />   (last 5, expandable to 50)
```

---

## Performance Strategy

| Technique | Applied To | Benefit |
|-----------|-----------|---------|
| `React.memo` | All 36 calculator screens | Skip re-render if props unchanged |
| `useMemo` on context values | All 5 contexts | Stable reference, no child re-renders |
| `useCallback` on dispatch fns | All contexts | Stable function references |
| Debounced calculation (300ms) | All calculators | No calc on every keystroke |
| Debounced history save (1.5s) | All calculators | No AsyncStorage on every keystroke |
| Debounced storage write (500ms) | storage.ts | Batch disk writes |
| In-memory storage cache | storage.ts | Instant reads after first load |
| FlashList (or FlatList) | History, Search | Virtualized long lists |

---

## i18n Architecture

```typescript
// Single i18n instance shared across app
// src/i18n/index.ts
const i18n = new I18n({ en, hi });

// LanguageContext wraps it with React state
function LanguageProvider() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const t = useCallback((key: string, params?: object) => {
    return i18n.t(key, params);
  }, [language]); // re-memoizes when language changes
}

// Usage in any component
const { t } = useLanguage();
t('calculators.sip.name') // "SIP Calculator" | "SIP कैलकुलेटर"
```

---

## CSS Variable Theming

NativeWind reads CSS variables from `global.css`. The dark theme uses `.dark` class on root:

```css
/* Light (default) */
:root { --color-primary: 13 148 136; }

/* Dark — activated when NativeWind sets class="dark" on root */
.dark { --color-primary: 45 212 191; }
```

**Why RGB tuples?** Tailwind's opacity modifier syntax requires bare numbers:
```
bg-primary/50  →  rgba(13, 148, 136, 0.5)  ✓
bg-#0D9488/50  →  INVALID                   ✗
```
