import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { roundTo } from '@/utils/math-helpers';
import { formatIndianNumber } from '@/utils/format-number';

interface LogResult {
  number: number;
  log10: number | null;
  ln: number | null;
  customBase: number | null;
  customBaseValue: number | null;
  antilog: number;
}

const LogarithmCalculator = React.memo(function LogarithmCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('logarithm-calculator', 'Logarithm Calculator');

  const [numberInput, setNumberInput] = useState('');
  const [baseInput, setBaseInput] = useState('');
  const [result, setResult] = useState<LogResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setNumberInput('');
    setBaseInput('');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');
    setResult(null);

    const x = Number(numberInput);

    if (!Number.isFinite(x)) {
      setError('Please enter a valid number');
      return;
    }

    // Logarithm results
    let log10Val: number | null = null;
    let lnVal: number | null = null;
    let customBaseVal: number | null = null;
    let customBase: number | null = null;

    // log10 and ln require positive number
    if (x > 0) {
      log10Val = roundTo(Math.log10(x), 8);
      lnVal = roundTo(Math.log(x), 8);
    }

    // Custom base log
    if (baseInput.trim() !== '') {
      const base = Number(baseInput);
      if (!Number.isFinite(base)) {
        setError('Base must be a valid number');
        return;
      }
      if (base <= 0 || base === 1) {
        setError('Base must be positive and not equal to 1');
        return;
      }
      customBase = base;
      if (x > 0) {
        customBaseVal = roundTo(Math.log(x) / Math.log(base), 8);
      }
    }

    // Antilog: 10^x (always valid for finite x)
    const antilog = roundTo(Math.pow(10, x), 8);

    const res: LogResult = {
      number: x,
      log10: log10Val,
      ln: lnVal,
      customBase,
      customBaseValue: customBaseVal,
      antilog,
    };

    setResult(res);

    saveToHistory(
      { number: x, base: customBase ?? 'N/A' },
      {
        log10: log10Val ?? 'undefined',
        ln: lnVal ?? 'undefined',
        antilog,
      },
      `log\u2081\u2080(${x}) = ${log10Val ?? 'undefined'}, ln(${x}) = ${lnVal ?? 'undefined'}`,
    );
  }, [numberInput, baseInput, saveToHistory]);

  return (
    <CalculatorShell
      title="Logarithm Calculator"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Inputs */}
      <CalculatorInput
        label="Number (x)"
        value={numberInput}
        onChangeText={setNumberInput}
        placeholder="Enter a number"
        keyboardType="numeric"
      />
      <CalculatorInput
        label="Custom Base (optional, for log base n)"
        value={baseInput}
        onChangeText={setBaseInput}
        placeholder="e.g. 2, 5, e..."
        keyboardType="numeric"
      />

      {/* Error */}
      {error ? (
        <View className="rounded-lg bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {/* Results */}
      {result && !error && (
        <View className="mt-4 gap-4">
          {/* Log base 10 */}
          <ResultCard
            title={`Log\u2081\u2080(${result.number})`}
            value={result.log10 !== null ? String(result.log10) : 'Undefined'}
            subtitle={
              result.log10 !== null
                ? `10^${result.log10} = ${result.number}`
                : 'Logarithm undefined for non-positive numbers'
            }
            type={result.log10 !== null ? 'success' : 'error'}
            visible={!!result}
          />

          {/* Natural log */}
          <ResultCard
            title={`ln(${result.number})`}
            value={result.ln !== null ? String(result.ln) : 'Undefined'}
            subtitle={
              result.ln !== null
                ? `e^${result.ln} \u2248 ${result.number}`
                : 'Natural log undefined for non-positive numbers'
            }
            type={result.ln !== null ? 'primary' : 'error'}
            visible={!!result}
          />

          {/* Custom base log */}
          {result.customBase !== null && (
            <ResultCard
              title={`Log base ${result.customBase}(${result.number})`}
              value={
                result.customBaseValue !== null
                  ? String(result.customBaseValue)
                  : 'Undefined'
              }
              subtitle={
                result.customBaseValue !== null
                  ? `${result.customBase}^${result.customBaseValue} \u2248 ${result.number}`
                  : 'Log undefined for non-positive numbers'
              }
              type={result.customBaseValue !== null ? 'success' : 'error'}
              visible={!!result}
            />
          )}

          {/* Antilog */}
          <ResultCard
            title={`Antilog(${result.number}) = 10^${result.number}`}
            value={
              Number.isFinite(result.antilog)
                ? formatIndianNumber(result.antilog)
                : result.antilog > 0
                  ? 'Infinity'
                  : '0'
            }
            type="primary"
            visible={!!result}
          />

          <ResultBreakdown
            title="All Results"
            items={[
              { label: 'Number (x)', value: String(result.number) },
              {
                label: 'Log\u2081\u2080(x)',
                value: result.log10 !== null ? String(result.log10) : 'Undefined',
                highlight: true,
              },
              {
                label: 'ln(x)',
                value: result.ln !== null ? String(result.ln) : 'Undefined',
                highlight: true,
              },
              ...(result.customBase !== null
                ? [
                    {
                      label: `Log base ${result.customBase}(x)`,
                      value:
                        result.customBaseValue !== null
                          ? String(result.customBaseValue)
                          : 'Undefined',
                      highlight: true,
                    },
                  ]
                : []),
              {
                label: `Antilog (10^x)`,
                value: Number.isFinite(result.antilog)
                  ? formatIndianNumber(result.antilog)
                  : String(result.antilog),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default LogarithmCalculator;
