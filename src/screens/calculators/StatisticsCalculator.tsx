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

interface StatsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: string;
  range: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
}

/** Calculate the median of a sorted array. */
function computeMedian(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/** Calculate the mode(s) of an array. Returns a readable string. */
function computeMode(numbers: number[]): string {
  const frequency: Record<number, number> = {};
  let maxFreq = 0;

  for (const num of numbers) {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
    }
  }

  // If every element appears the same number of times, there is no unique mode
  if (maxFreq === 1) {
    return 'No mode (all values unique)';
  }

  const modes = Object.keys(frequency)
    .filter((key) => frequency[Number(key)] === maxFreq)
    .map(Number);

  // If every value has the same frequency and that frequency > 1, no unique mode
  if (modes.length === Object.keys(frequency).length) {
    return 'No mode (all values equally frequent)';
  }

  return modes.map((m) => String(roundTo(m, 6))).join(', ');
}

const StatisticsCalculator = React.memo(function StatisticsCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('statistics-calculator', 'Statistics Calculator');

  const [input, setInput] = useState('');
  const [result, setResult] = useState<StatsResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setInput('');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');
    setResult(null);

    const trimmed = input.trim();
    if (trimmed === '') {
      setError('Please enter comma-separated numbers');
      return;
    }

    const parts = trimmed.split(',').map((s) => s.trim()).filter((s) => s !== '');
    const numbers: number[] = [];

    for (const part of parts) {
      const num = Number(part);
      if (!Number.isFinite(num)) {
        setError(`Invalid number: "${part}"`);
        return;
      }
      numbers.push(num);
    }

    if (numbers.length === 0) {
      setError('Please enter at least one number');
      return;
    }

    const count = numbers.length;
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    const mean = sum / count;

    const sorted = [...numbers].sort((a, b) => a - b);
    const median = computeMedian(sorted);
    const mode = computeMode(numbers);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    // Population variance
    const variance = numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    const res: StatsResult = {
      count,
      sum: roundTo(sum, 6),
      mean: roundTo(mean, 6),
      median: roundTo(median, 6),
      mode,
      range: roundTo(range, 6),
      variance: roundTo(variance, 6),
      stdDev: roundTo(stdDev, 6),
      min: roundTo(min, 6),
      max: roundTo(max, 6),
    };

    setResult(res);

    saveToHistory(
      { numbers: trimmed },
      { mean: res.mean, median: res.median, stdDev: res.stdDev },
      `Stats for ${count} numbers: Mean = ${res.mean}, Median = ${res.median}`,
    );
  }, [input, saveToHistory]);

  return (
    <CalculatorShell
      title="Statistics Calculator"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Input */}
      <CalculatorInput
        label="Enter Numbers (comma-separated)"
        value={input}
        onChangeText={setInput}
        placeholder="e.g. 10, 20, 30, 40, 50"
        keyboardType="default"
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
            title="Mean (Average)"
            value={String(result.mean)}
            subtitle={`Sum = ${formatIndianNumber(result.sum)} | Count = ${result.count}`}
            type="primary"
            visible={!!result}
          />

          <ResultCard
            title="Standard Deviation"
            value={String(result.stdDev)}
            subtitle={`Variance = ${result.variance}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title="All Statistics"
            items={[
              { label: 'Count', value: String(result.count) },
              { label: 'Sum', value: String(result.sum) },
              { label: 'Mean', value: String(result.mean), highlight: true },
              { label: 'Median', value: String(result.median), highlight: true },
              { label: 'Mode', value: result.mode },
              { label: 'Range', value: String(result.range) },
              { label: 'Min', value: String(result.min) },
              { label: 'Max', value: String(result.max) },
              { label: 'Variance', value: String(result.variance) },
              {
                label: 'Standard Deviation',
                value: String(result.stdDev),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default StatisticsCalculator;
