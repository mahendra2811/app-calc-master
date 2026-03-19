import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { isPrime } from '@/utils/math-helpers';
import { formatIndianNumber } from '@/utils/format-number';

type Mode = 'check' | 'range';

/** Find all factors of n by iterating from 1 to sqrt(n). */
function findFactors(n: number): number[] {
  if (n <= 0) return [];
  const factors: number[] = [];
  const absN = Math.abs(n);
  for (let i = 1; i * i <= absN; i++) {
    if (absN % i === 0) {
      factors.push(i);
      if (i !== absN / i) {
        factors.push(absN / i);
      }
    }
  }
  factors.sort((a, b) => a - b);
  return factors;
}

/** Find all primes in range [start, end]. */
function findPrimesInRange(start: number, end: number): number[] {
  const primes: number[] = [];
  const lo = Math.max(2, Math.ceil(start));
  const hi = Math.floor(end);
  for (let i = lo; i <= hi; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

interface CheckResult {
  number: number;
  prime: boolean;
  factors: number[];
}

interface RangeResult {
  start: number;
  end: number;
  primes: number[];
  count: number;
}

const PrimeChecker = React.memo(function PrimeChecker() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('prime-checker', 'Prime Checker');

  const [mode, setMode] = useState<Mode>('check');
  const [singleInput, setSingleInput] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [rangeResult, setRangeResult] = useState<RangeResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setSingleInput('');
    setRangeStart('');
    setRangeEnd('');
    setCheckResult(null);
    setRangeResult(null);
    setError('');
  }, []);

  const switchMode = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      reset();
    },
    [reset],
  );

  const calculate = useCallback(() => {
    setError('');
    setCheckResult(null);
    setRangeResult(null);

    if (mode === 'check') {
      const n = parseInt(singleInput, 10);
      if (!Number.isFinite(n) || n < 1) {
        setError('Please enter a positive integer');
        return;
      }

      if (n > 1e9) {
        setError('Number too large. Maximum is 1,000,000,000');
        return;
      }

      const prime = isPrime(n);
      const factors = prime ? [1, n] : findFactors(n);

      const res: CheckResult = { number: n, prime, factors };
      setCheckResult(res);

      saveToHistory(
        { number: n },
        { isPrime: prime, factorCount: factors.length },
        `${formatIndianNumber(n)} is ${prime ? '' : 'not '}prime`,
      );
    } else {
      const start = parseInt(rangeStart, 10);
      const end = parseInt(rangeEnd, 10);

      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        setError('Please enter valid integers for both start and end');
        return;
      }

      if (start < 0 || end < 0) {
        setError('Range values must be non-negative');
        return;
      }

      if (start > end) {
        setError('Start must be less than or equal to end');
        return;
      }

      if (end - start > 10000) {
        setError('Range too large. Maximum range is 10,000 to prevent performance issues.');
        return;
      }

      if (end > 1e7) {
        setError('End value too large. Maximum is 10,000,000.');
        return;
      }

      const primes = findPrimesInRange(start, end);

      const res: RangeResult = {
        start,
        end,
        primes,
        count: primes.length,
      };
      setRangeResult(res);

      saveToHistory(
        { start, end },
        { primeCount: primes.length },
        `Found ${primes.length} primes between ${formatIndianNumber(start)} and ${formatIndianNumber(end)}`,
      );
    }
  }, [mode, singleInput, rangeStart, rangeEnd, saveToHistory]);

  return (
    <CalculatorShell
      title="Prime Checker"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Mode Tabs */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => switchMode('check')}
          className={`flex-1 items-center rounded-xl border py-3 ${
            mode === 'check'
              ? 'border-primary bg-primary/15'
              : 'border-border bg-surface'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              mode === 'check' ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            Check Number
          </Text>
        </Pressable>
        <Pressable
          onPress={() => switchMode('range')}
          className={`flex-1 items-center rounded-xl border py-3 ${
            mode === 'range'
              ? 'border-primary bg-primary/15'
              : 'border-border bg-surface'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              mode === 'range' ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            Primes in Range
          </Text>
        </Pressable>
      </View>

      {/* Inputs */}
      {mode === 'check' ? (
        <CalculatorInput
          label="Enter a Number"
          value={singleInput}
          onChangeText={setSingleInput}
          placeholder="Enter a positive integer"
          keyboardType="number-pad"
        />
      ) : (
        <View className="gap-4">
          <CalculatorInput
            label="Range Start"
            value={rangeStart}
            onChangeText={setRangeStart}
            placeholder="2"
            keyboardType="number-pad"
          />
          <CalculatorInput
            label="Range End"
            value={rangeEnd}
            onChangeText={setRangeEnd}
            placeholder="100"
            keyboardType="number-pad"
          />
        </View>
      )}

      {/* Error */}
      {error ? (
        <View className="rounded-lg bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {/* Check Result */}
      {checkResult && !error && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={`Is ${formatIndianNumber(checkResult.number)} Prime?`}
            value={checkResult.prime ? 'Yes, Prime!' : 'Not Prime'}
            subtitle={
              checkResult.prime
                ? `${formatIndianNumber(checkResult.number)} is only divisible by 1 and itself`
                : `${formatIndianNumber(checkResult.number)} has ${checkResult.factors.length} factors`
            }
            type={checkResult.prime ? 'success' : 'error'}
            visible={!!checkResult}
          />

          {!checkResult.prime && (
            <View className="rounded-card border border-border bg-surface p-4">
              <Text className="mb-3 text-sm font-semibold text-text-secondary">
                Factors of {formatIndianNumber(checkResult.number)}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {checkResult.factors.map((factor) => (
                  <View
                    key={factor}
                    className="rounded-lg bg-surface-elevated px-3 py-1.5"
                  >
                    <Text className="text-sm font-medium text-text">
                      {formatIndianNumber(factor)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <ResultBreakdown
            title="Details"
            items={[
              {
                label: 'Number',
                value: formatIndianNumber(checkResult.number),
              },
              {
                label: 'Is Prime',
                value: checkResult.prime ? 'Yes' : 'No',
                highlight: true,
              },
              {
                label: 'Number of Factors',
                value: String(checkResult.factors.length),
              },
              {
                label: 'Factors',
                value: checkResult.factors.slice(0, 10).join(', ') +
                  (checkResult.factors.length > 10 ? '...' : ''),
              },
            ]}
          />
        </View>
      )}

      {/* Range Result */}
      {rangeResult && !error && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={`Primes between ${formatIndianNumber(rangeResult.start)} and ${formatIndianNumber(rangeResult.end)}`}
            value={`${rangeResult.count} primes found`}
            type="success"
            visible={!!rangeResult}
          />

          {rangeResult.primes.length > 0 && (
            <View className="rounded-card border border-border bg-surface p-4">
              <Text className="mb-3 text-sm font-semibold text-text-secondary">
                Prime Numbers ({rangeResult.count})
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {rangeResult.primes.slice(0, 200).map((prime) => (
                  <View
                    key={prime}
                    className="rounded-lg bg-primary/10 px-3 py-1.5"
                  >
                    <Text className="text-xs font-medium text-primary">
                      {prime}
                    </Text>
                  </View>
                ))}
                {rangeResult.primes.length > 200 && (
                  <View className="rounded-lg bg-surface-elevated px-3 py-1.5">
                    <Text className="text-xs text-text-secondary">
                      +{rangeResult.primes.length - 200} more
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <ResultBreakdown
            title="Range Details"
            items={[
              { label: 'Range', value: `${formatIndianNumber(rangeResult.start)} - ${formatIndianNumber(rangeResult.end)}` },
              { label: 'Total Numbers', value: formatIndianNumber(rangeResult.end - rangeResult.start + 1) },
              { label: 'Primes Found', value: String(rangeResult.count), highlight: true },
              {
                label: 'Prime Density',
                value: `${(
                  (rangeResult.count / (rangeResult.end - rangeResult.start + 1)) *
                  100
                ).toFixed(1)}%`,
              },
              {
                label: 'Smallest Prime',
                value: rangeResult.primes.length > 0 ? String(rangeResult.primes[0]) : 'N/A',
              },
              {
                label: 'Largest Prime',
                value:
                  rangeResult.primes.length > 0
                    ? String(rangeResult.primes[rangeResult.primes.length - 1])
                    : 'N/A',
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default PrimeChecker;
