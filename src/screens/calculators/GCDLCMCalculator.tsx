import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { gcd, gcdMultiple, lcm, lcmMultiple } from '@/utils/math-helpers';
import { formatIndianNumber } from '@/utils/format-number';

interface GCDLCMResult {
  gcdValue: number;
  lcmValue: number;
  numbers: number[];
}

const GCDLCMCalculator = React.memo(function GCDLCMCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('gcd-lcm-calculator', 'GCD & LCM Calculator');

  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [result, setResult] = useState<GCDLCMResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setNum1('');
    setNum2('');
    setNum3('');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');
    setResult(null);

    const a = parseInt(num1, 10);
    const b = parseInt(num2, 10);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      setError('Please enter valid integers for Number 1 and Number 2');
      return;
    }

    if (a <= 0 || b <= 0) {
      setError('Numbers must be positive integers');
      return;
    }

    const numbers: number[] = [a, b];

    // If Number 3 is provided, include it
    if (num3.trim() !== '') {
      const c = parseInt(num3, 10);
      if (!Number.isFinite(c) || c <= 0) {
        setError('Number 3 must be a positive integer if provided');
        return;
      }
      numbers.push(c);
    }

    const gcdValue = numbers.length === 2 ? gcd(numbers[0], numbers[1]) : gcdMultiple(numbers);
    const lcmValue = numbers.length === 2 ? lcm(numbers[0], numbers[1]) : lcmMultiple(numbers);

    const res: GCDLCMResult = { gcdValue, lcmValue, numbers };
    setResult(res);

    saveToHistory(
      { numbers: numbers.join(', ') },
      { gcd: gcdValue, lcm: lcmValue },
      `GCD(${numbers.join(', ')}) = ${formatIndianNumber(gcdValue)}, LCM = ${formatIndianNumber(lcmValue)}`,
    );
  }, [num1, num2, num3, saveToHistory]);

  return (
    <CalculatorShell
      title="GCD & LCM Calculator"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Inputs */}
      <CalculatorInput
        label="Number 1"
        value={num1}
        onChangeText={setNum1}
        placeholder="Enter first number"
        keyboardType="number-pad"
      />
      <CalculatorInput
        label="Number 2"
        value={num2}
        onChangeText={setNum2}
        placeholder="Enter second number"
        keyboardType="number-pad"
      />
      <CalculatorInput
        label="Number 3 (Optional)"
        value={num3}
        onChangeText={setNum3}
        placeholder="Enter third number (optional)"
        keyboardType="number-pad"
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
          <ResultCard
            title="Greatest Common Divisor (GCD)"
            value={formatIndianNumber(result.gcdValue)}
            subtitle={`GCD of ${result.numbers.map(formatIndianNumber).join(', ')}`}
            type="success"
            visible={!!result}
          />

          <ResultCard
            title="Least Common Multiple (LCM)"
            value={formatIndianNumber(result.lcmValue)}
            subtitle={`LCM of ${result.numbers.map(formatIndianNumber).join(', ')}`}
            type="primary"
            visible={!!result}
          />

          <ResultBreakdown
            title="Details"
            items={[
              {
                label: 'Numbers',
                value: result.numbers.map(formatIndianNumber).join(', '),
              },
              {
                label: 'GCD',
                value: formatIndianNumber(result.gcdValue),
                highlight: true,
              },
              {
                label: 'LCM',
                value: formatIndianNumber(result.lcmValue),
                highlight: true,
              },
              {
                label: 'Product of Numbers',
                value: formatIndianNumber(result.numbers.reduce((acc, n) => acc * n, 1)),
              },
              {
                label: 'GCD x LCM (for 2 numbers)',
                value:
                  result.numbers.length === 2
                    ? formatIndianNumber(result.gcdValue * result.lcmValue)
                    : 'N/A (only for 2 numbers)',
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default GCDLCMCalculator;
