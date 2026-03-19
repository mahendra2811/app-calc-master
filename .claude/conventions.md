# CalcMaster — Code Conventions & Patterns

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase.tsx | `SIPCalculator.tsx` |
| Hooks | camelCase with `use` prefix | `useCalculator.ts` |
| Utilities | kebab-case.ts | `format-number.ts` |
| Constants | kebab-case.ts | `storage-keys.ts` |
| Contexts | PascalCase + `Context` | `ThemeContext.tsx` |
| Types | PascalCase + `.ts` (no `.tsx`) | `calculator.ts` |

---

## Calculator Screen Template

Every new calculator MUST follow this exact pattern:

```typescript
import React, { memo, useState, useCallback } from 'react';
import { View } from 'react-native';
import CalculatorShell from '@/components/CalculatorShell';
import CalculatorInput from '@/components/CalculatorInput';
import ResultCard from '@/components/ResultCard';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatIndianCurrency } from '@/utils/format-number';

const MyCalculator = memo(function MyCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('my-calculator-slug');

  // 1. Input state
  const [principal, setPrincipal] = useState('10000');

  // 2. Result state
  const [result, setResult] = useState<number | null>(null);

  // 3. Pure calculation function
  const calculate = useCallback(() => {
    const p = parseFloat(principal);
    if (!p || p <= 0) return;

    const computed = p * 2; // your formula
    setResult(computed);

    // 4. Save to history
    saveToHistory(
      { principal },           // inputs
      { result: computed }     // outputs
    );
  }, [principal, saveToHistory]);

  // 5. Reset
  const handleReset = useCallback(() => {
    setPrincipal('10000');
    setResult(null);
  }, []);

  return (
    <CalculatorShell slug="my-calculator-slug" onReset={handleReset}>
      <CalculatorInput
        label={t('calculators.myCalc.principal')}
        value={principal}
        onChangeText={setPrincipal}
        keyboardType="numeric"
        suffix="₹"
      />
      {result !== null && (
        <ResultCard
          label={t('calc.result')}
          value={formatIndianCurrency(result)}
        />
      )}
    </CalculatorShell>
  );
});

export default MyCalculator;
```

---

## Context Usage Rules

```typescript
// ✅ CORRECT — use specific hook
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useRecent } from '@/contexts/RecentContext';

// ❌ WRONG — never import useContext + raw context
import { useContext } from 'react';
import { ThemeStateContext } from '@/contexts/ThemeContext';
```

---

## NativeWind Styling Rules

```typescript
// ✅ CORRECT — always use className
<View className="flex-1 bg-background px-4 py-6">
  <Text className="text-xl font-bold text-text">Hello</Text>
</View>

// ❌ WRONG — no StyleSheet, no inline style for theming
const styles = StyleSheet.create({ container: { backgroundColor: '#fff' } });
<View style={{ backgroundColor: colors.background }}>
```

### Dark mode classes:
```typescript
// These auto-switch with theme:
"bg-background"    // gray-50 light / gray-900 dark
"bg-surface"       // white light / gray-800 dark
"text-text"        // gray-900 light / gray-100 dark
"text-primary"     // teal-600 light / teal-400 dark
"border-border"    // gray-200 light / gray-600 dark
```

---

## Number Formatting

```typescript
import { formatIndianCurrency, formatPercent, formatNumber } from '@/utils/format-number';

formatIndianCurrency(1234567)    // "₹12,34,567"
formatIndianCurrency(1234567.5)  // "₹12,34,567.50"
formatPercent(12.5678)           // "12.57%"
formatNumber(1234567)            // "12,34,567"
```

**Never use:**
```typescript
value.toLocaleString()           // inconsistent across platforms
new Intl.NumberFormat('en-IN')   // use the utility instead
```

---

## Storage Rules

```typescript
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

// Reading
const theme = await storage.get<ThemeOption>(STORAGE_KEYS.THEME, 'system');

// Writing (fire and forget — sync to cache immediately)
storage.set(STORAGE_KEYS.THEME, 'dark');

// Never use AsyncStorage directly in components/contexts
```

---

## Math Helpers

```typescript
import {
  factorial,
  gcd, lcm,
  isPrime,
  nPr, nCr,
  mean, median, mode, stdDev
} from '@/utils/math-helpers';
```

---

## Analytics Pattern

```typescript
import { trackEvent, trackScreenView } from '@/utils/analytics';

// In calculators — track calculation
trackEvent('calculate', { calculator: 'sip', inputs: { amount: 5000 } });

// In [slug].tsx — track screen view
trackScreenView(slug);
```

Analytics calls are no-ops when `EXPO_PUBLIC_ANALYTICS_ENABLED=false`.

---

## Error Handling

All calculator components are wrapped in `<ErrorBoundary>` at the route level (`[slug].tsx`).
Inside calculators, handle edge cases gracefully:

```typescript
// Input validation pattern
const p = parseFloat(principal);
if (isNaN(p) || p <= 0) {
  setError(t('calc.invalidInput'));
  setResult(null);
  return;
}
setError(null);
// proceed with calculation
```

---

## History Entry Format

```typescript
// Always use this shape when calling saveToHistory
saveToHistory(
  {
    // All input field values (raw, before formatting)
    monthlyInvestment: 5000,
    rate: 12,
    years: 10,
  },
  {
    // All computed outputs
    investedAmount: 600000,
    estimatedReturns: 517482,
    totalValue: 1117482,
  }
);
```

The `useCalculator` hook automatically adds: `id`, `calcId`, `calcName`, `timestamp`.

---

## Icon Usage

```typescript
import { FontAwesome6 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Finance calculators: FontAwesome6
<FontAwesome6 name="trending-up" size={24} color={primaryColor} />

// Math calculators: MaterialCommunityIcons
<MaterialCommunityIcons name="calculator-variant" size={24} />
```

---

## Responsive Layout

```typescript
import { useResponsive } from '@/hooks/useResponsive';

function HomeScreen() {
  const { numColumns } = useResponsive();
  // numColumns: 2 (phone) | 3 (large phone/tablet) | 4 (tablet landscape)

  return (
    <FlatList
      numColumns={numColumns}
      key={numColumns} // force re-render on orientation change
    />
  );
}
```
