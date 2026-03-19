import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatIndianNumber } from '@/utils/format-number';
import { roundTo } from '@/utils/math-helpers';

type Mode = 'whatIsPercent' | 'whatPercent' | 'percentChange';

interface PercentResult {
  value: number;
  label: string;
  subtitle: string;
}

const MODES: { key: Mode; label: string }[] = [
  { key: 'whatIsPercent', label: 'X% of Y' },
  { key: 'whatPercent', label: 'X is ?% of Y' },
  { key: 'percentChange', label: '% Change' },
];

const PercentageCalculator = React.memo(function PercentageCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('percentage-calculator', 'Percentage Calculator');

  const [mode, setMode] = useState<Mode>('whatIsPercent');
  const [inputX, setInputX] = useState('');
  const [inputY, setInputY] = useState('');
  const [result, setResult] = useState<PercentResult | null>(null);

  const reset = useCallback(() => {
    setInputX('');
    setInputY('');
    setResult(null);
  }, []);

  const switchMode = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      reset();
    },
    [reset],
  );

  const calculate = useCallback(() => {
    const x = parseFloat(inputX);
    const y = parseFloat(inputY);

    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    let res: PercentResult;

    switch (mode) {
      case 'whatIsPercent': {
        // What is X% of Y?
        const value = roundTo((x / 100) * y, 4);
        res = {
          value,
          label: `${x}% of ${formatIndianNumber(y)}`,
          subtitle: `= ${formatIndianNumber(value)}`,
        };
        break;
      }

      case 'whatPercent': {
        // X is what % of Y?
        if (y === 0) return;
        const value = roundTo((x / y) * 100, 4);
        res = {
          value,
          label: `${formatIndianNumber(x)} is what % of ${formatIndianNumber(y)}?`,
          subtitle: `= ${value}%`,
        };
        break;
      }

      case 'percentChange': {
        // Percentage change from X to Y
        if (x === 0) return;
        const value = roundTo(((y - x) / Math.abs(x)) * 100, 4);
        const direction = value >= 0 ? 'increase' : 'decrease';
        res = {
          value,
          label: `Change from ${formatIndianNumber(x)} to ${formatIndianNumber(y)}`,
          subtitle: `${Math.abs(value)}% ${direction}`,
        };
        break;
      }
    }

    setResult(res!);

    saveToHistory(
      { mode, x, y },
      { result: res!.value },
      `${res!.label} ${res!.subtitle}`,
    );
  }, [inputX, inputY, mode, saveToHistory]);

  const getLabelX = (): string => {
    switch (mode) {
      case 'whatIsPercent':
        return 'Percentage (X)';
      case 'whatPercent':
        return 'Value (X)';
      case 'percentChange':
        return 'Original Value';
    }
  };

  const getLabelY = (): string => {
    switch (mode) {
      case 'whatIsPercent':
        return 'Number (Y)';
      case 'whatPercent':
        return 'Total (Y)';
      case 'percentChange':
        return 'New Value';
    }
  };

  const getSuffixX = (): string | undefined => {
    return mode === 'whatIsPercent' ? '%' : undefined;
  };

  return (
    <CalculatorShell
      title="Percentage Calculator"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Mode Tabs */}
      <View className="flex-row gap-2">
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => switchMode(m.key)}
            className={`flex-1 items-center rounded-xl border py-3 ${
              mode === m.key
                ? 'border-primary bg-primary/15'
                : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                mode === m.key ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Mode Description */}
      <View className="rounded-lg bg-surface-elevated/50 px-4 py-3">
        <Text className="text-center text-sm text-text-secondary">
          {mode === 'whatIsPercent' && 'What is X% of Y?'}
          {mode === 'whatPercent' && 'X is what percentage of Y?'}
          {mode === 'percentChange' && 'Percentage change from original to new value'}
        </Text>
      </View>

      {/* Inputs */}
      <CalculatorInput
        label={getLabelX()}
        value={inputX}
        onChangeText={setInputX}
        placeholder="Enter value"
        suffix={getSuffixX()}
        keyboardType="numeric"
      />

      <CalculatorInput
        label={getLabelY()}
        value={inputY}
        onChangeText={setInputY}
        placeholder="Enter value"
        keyboardType="numeric"
      />

      {/* Results */}
      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={result.label}
            value={
              mode === 'whatPercent'
                ? `${result.value}%`
                : mode === 'percentChange'
                  ? `${result.value >= 0 ? '+' : ''}${result.value}%`
                  : formatIndianNumber(result.value)
            }
            subtitle={result.subtitle}
            type={
              mode === 'percentChange'
                ? result.value >= 0
                  ? 'success'
                  : 'error'
                : 'primary'
            }
            visible={!!result}
          />

          <ResultBreakdown
            title="Calculation Details"
            items={[
              { label: getLabelX(), value: inputX + (getSuffixX() ?? '') },
              { label: getLabelY(), value: inputY },
              {
                label: 'Result',
                value:
                  mode === 'whatPercent'
                    ? `${result.value}%`
                    : mode === 'percentChange'
                      ? `${result.value >= 0 ? '+' : ''}${result.value}%`
                      : String(result.value),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default PercentageCalculator;
