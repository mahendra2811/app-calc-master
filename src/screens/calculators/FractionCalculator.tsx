import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorDropdown } from '@/components/CalculatorDropdown';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { gcd, roundTo } from '@/utils/math-helpers';

interface FractionResult {
  numerator: number;
  denominator: number;
  simplifiedNum: number;
  simplifiedDen: number;
  decimal: number;
}

const OPERATIONS = [
  { label: 'Add (+)', value: 'add' },
  { label: 'Subtract (\u2212)', value: 'subtract' },
  { label: 'Multiply (\u00d7)', value: 'multiply' },
  { label: 'Divide (\u00f7)', value: 'divide' },
];

const OP_SYMBOL: Record<string, string> = {
  add: '+',
  subtract: '\u2212',
  multiply: '\u00d7',
  divide: '\u00f7',
};

const FractionCalculator = React.memo(function FractionCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('fraction-calculator', 'Fraction Calculator');

  const [num1, setNum1] = useState('');
  const [den1, setDen1] = useState('');
  const [num2, setNum2] = useState('');
  const [den2, setDen2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState<FractionResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setNum1('');
    setDen1('');
    setNum2('');
    setDen2('');
    setOperation('add');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');

    const a = parseInt(num1, 10);
    const b = parseInt(den1, 10);
    const c = parseInt(num2, 10);
    const d = parseInt(den2, 10);

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) {
      setError('Please enter valid integers for all fields');
      return;
    }

    if (b === 0 || d === 0) {
      setError('Denominators cannot be zero');
      return;
    }

    let resNum: number;
    let resDen: number;

    switch (operation) {
      case 'add':
        // a/b + c/d = (ad + bc) / bd
        resNum = a * d + b * c;
        resDen = b * d;
        break;

      case 'subtract':
        // a/b - c/d = (ad - bc) / bd
        resNum = a * d - b * c;
        resDen = b * d;
        break;

      case 'multiply':
        // a/b × c/d = ac / bd
        resNum = a * c;
        resDen = b * d;
        break;

      case 'divide':
        // a/b ÷ c/d = ad / bc
        if (c === 0) {
          setError('Cannot divide by zero (second numerator is 0)');
          return;
        }
        resNum = a * d;
        resDen = b * c;
        break;

      default:
        return;
    }

    // Simplify using GCD
    const divisor = gcd(Math.abs(resNum), Math.abs(resDen));
    let simplifiedNum = resNum / divisor;
    let simplifiedDen = resDen / divisor;

    // Ensure the negative sign is on the numerator
    if (simplifiedDen < 0) {
      simplifiedNum = -simplifiedNum;
      simplifiedDen = -simplifiedDen;
    }

    const decimal = roundTo(resNum / resDen, 6);

    const res: FractionResult = {
      numerator: resNum,
      denominator: resDen,
      simplifiedNum,
      simplifiedDen,
      decimal,
    };

    setResult(res);

    const opSymbol = OP_SYMBOL[operation];
    saveToHistory(
      { fraction1: `${a}/${b}`, operation, fraction2: `${c}/${d}` },
      { result: `${simplifiedNum}/${simplifiedDen}`, decimal },
      `${a}/${b} ${opSymbol} ${c}/${d} = ${simplifiedNum}/${simplifiedDen}`,
    );
  }, [num1, den1, num2, den2, operation, saveToHistory]);

  return (
    <CalculatorShell
      title="Fraction Calculator"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Fraction 1 */}
      <View className="rounded-card border border-border bg-surface p-4">
        <Text className="mb-3 text-sm font-semibold text-text-secondary">
          Fraction 1
        </Text>
        <View className="flex-row gap-3">
          <CalculatorInput
            label="Numerator"
            value={num1}
            onChangeText={setNum1}
            placeholder="0"
            keyboardType="number-pad"
            className="flex-1"
          />
          <CalculatorInput
            label="Denominator"
            value={den1}
            onChangeText={setDen1}
            placeholder="1"
            keyboardType="number-pad"
            className="flex-1"
          />
        </View>
      </View>

      {/* Operation */}
      <CalculatorDropdown
        label="Operation"
        value={operation}
        onValueChange={setOperation}
        options={OPERATIONS}
      />

      {/* Fraction 2 */}
      <View className="rounded-card border border-border bg-surface p-4">
        <Text className="mb-3 text-sm font-semibold text-text-secondary">
          Fraction 2
        </Text>
        <View className="flex-row gap-3">
          <CalculatorInput
            label="Numerator"
            value={num2}
            onChangeText={setNum2}
            placeholder="0"
            keyboardType="number-pad"
            className="flex-1"
          />
          <CalculatorInput
            label="Denominator"
            value={den2}
            onChangeText={setDen2}
            placeholder="1"
            keyboardType="number-pad"
            className="flex-1"
          />
        </View>
      </View>

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
            title="Simplified Fraction"
            value={
              result.simplifiedDen === 1
                ? String(result.simplifiedNum)
                : `${result.simplifiedNum} / ${result.simplifiedDen}`
            }
            subtitle={`Decimal: ${result.decimal}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title="Details"
            items={[
              {
                label: 'Unsimplified',
                value: `${result.numerator} / ${result.denominator}`,
              },
              {
                label: 'Simplified',
                value:
                  result.simplifiedDen === 1
                    ? String(result.simplifiedNum)
                    : `${result.simplifiedNum} / ${result.simplifiedDen}`,
                highlight: true,
              },
              {
                label: 'Decimal Value',
                value: String(result.decimal),
              },
              {
                label: 'GCD Used',
                value: String(
                  gcd(Math.abs(result.numerator), Math.abs(result.denominator)),
                ),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default FractionCalculator;
