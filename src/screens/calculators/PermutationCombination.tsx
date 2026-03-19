import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { nPr, nCr, factorial } from '@/utils/math-helpers';
import { formatIndianNumber } from '@/utils/format-number';

interface PermCombResult {
  n: number;
  r: number;
  permutation: number;
  combination: number;
  nFactorial: number;
  rFactorial: number;
  nMinusRFactorial: number;
}

const PermutationCombination = React.memo(function PermutationCombination() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'permutation-combination',
    'Permutation & Combination',
  );

  const [inputN, setInputN] = useState('');
  const [inputR, setInputR] = useState('');
  const [result, setResult] = useState<PermCombResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setInputN('');
    setInputR('');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');
    setResult(null);

    const n = parseInt(inputN, 10);
    const r = parseInt(inputR, 10);

    if (!Number.isFinite(n) || !Number.isFinite(r)) {
      setError('Please enter valid integers for both n and r');
      return;
    }

    if (!Number.isInteger(n) || !Number.isInteger(r)) {
      setError('Both n and r must be integers');
      return;
    }

    if (n < 0 || r < 0) {
      setError('Both n and r must be non-negative');
      return;
    }

    if (r > n) {
      setError('r cannot be greater than n');
      return;
    }

    if (n > 170) {
      setError('n is too large (maximum 170 to avoid overflow)');
      return;
    }

    const permutation = nPr(n, r);
    const combination = nCr(n, r);
    const nFact = factorial(n);
    const rFact = factorial(r);
    const nMinusRFact = factorial(n - r);

    const res: PermCombResult = {
      n,
      r,
      permutation,
      combination,
      nFactorial: nFact,
      rFactorial: rFact,
      nMinusRFactorial: nMinusRFact,
    };

    setResult(res);

    saveToHistory(
      { n, r },
      { nPr: permutation, nCr: combination },
      `P(${n},${r}) = ${formatIndianNumber(permutation)}, C(${n},${r}) = ${formatIndianNumber(combination)}`,
    );
  }, [inputN, inputR, saveToHistory]);

  /** Format large numbers: use scientific notation if > 1e15. */
  const fmt = useCallback((num: number): string => {
    if (!Number.isFinite(num)) return 'Infinity';
    if (num > 1e15) return num.toExponential(4);
    return formatIndianNumber(num);
  }, []);

  return (
    <CalculatorShell
      title="Permutation & Combination"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Inputs */}
      <CalculatorInput
        label="n (Total Items)"
        value={inputN}
        onChangeText={setInputN}
        placeholder="Enter total items (n)"
        keyboardType="number-pad"
      />
      <CalculatorInput
        label="r (Items Chosen)"
        value={inputR}
        onChangeText={setInputR}
        placeholder="Enter items chosen (r)"
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
          {/* Permutation */}
          <ResultCard
            title={`Permutation P(${result.n}, ${result.r})`}
            value={fmt(result.permutation)}
            subtitle={`Number of ordered arrangements`}
            type="success"
            visible={!!result}
          />

          {/* Combination */}
          <ResultCard
            title={`Combination C(${result.n}, ${result.r})`}
            value={fmt(result.combination)}
            subtitle={`Number of unordered selections`}
            type="primary"
            visible={!!result}
          />

          {/* Formula Steps */}
          <View className="rounded-card border border-border bg-surface p-4">
            <Text className="mb-3 text-sm font-semibold text-text-secondary">
              Permutation Formula
            </Text>
            <Text className="text-sm text-text">
              nPr = n! / (n-r)!
            </Text>
            <Text className="mt-1 text-sm font-medium text-primary">
              {result.n}! / {result.n - result.r}! = {fmt(result.nFactorial)} / {fmt(result.nMinusRFactorial)} = {fmt(result.permutation)}
            </Text>
          </View>

          <View className="rounded-card border border-border bg-surface p-4">
            <Text className="mb-3 text-sm font-semibold text-text-secondary">
              Combination Formula
            </Text>
            <Text className="text-sm text-text">
              nCr = n! / (r! {'\u00d7'} (n-r)!)
            </Text>
            <Text className="mt-1 text-sm font-medium text-primary">
              {result.n}! / ({result.r}! {'\u00d7'} {result.n - result.r}!) = {fmt(result.nFactorial)} / ({fmt(result.rFactorial)} {'\u00d7'} {fmt(result.nMinusRFactorial)}) = {fmt(result.combination)}
            </Text>
          </View>

          <ResultBreakdown
            title="Details"
            items={[
              { label: 'n (Total)', value: String(result.n) },
              { label: 'r (Chosen)', value: String(result.r) },
              { label: `${result.n}!`, value: fmt(result.nFactorial) },
              { label: `${result.r}!`, value: fmt(result.rFactorial) },
              {
                label: `${result.n - result.r}! (n-r)!`,
                value: fmt(result.nMinusRFactorial),
              },
              {
                label: `P(${result.n}, ${result.r})`,
                value: fmt(result.permutation),
                highlight: true,
              },
              {
                label: `C(${result.n}, ${result.r})`,
                value: fmt(result.combination),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default PermutationCombination;
