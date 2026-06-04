import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorDropdown } from '@/components/CalculatorDropdown';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface CIResult {
  compoundInterest: number;
  totalAmount: number;
}

const CompoundInterestCalculator = React.memo(function CompoundInterestCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'compound-interest-calculator',
    t('calculators.compoundInterest.title'),
  );

  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('12'); // n per year
  const [result, setResult] = useState<CIResult | null>(null);

  const frequencyOptions = useMemo(
    () => [
      { label: t('calculators.compoundInterest.monthly'), value: '12' },
      { label: t('calculators.compoundInterest.quarterly'), value: '4' },
      { label: t('calculators.compoundInterest.halfYearly'), value: '2' },
      { label: t('calculators.compoundInterest.yearly'), value: '1' },
    ],
    [t],
  );

  const calculate = useCallback(() => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseFloat(time);
    const n = parseInt(frequency, 10);

    if (!P || !R || !T || P <= 0 || R <= 0 || T <= 0) {
      return;
    }

    // A = P × (1 + r/n)^(n×t)
    const r = R / 100;
    const totalAmount = P * Math.pow(1 + r / n, n * T);
    const compoundInterest = totalAmount - P;

    const res: CIResult = {
      compoundInterest,
      totalAmount,
    };

    setResult(res);

    const freqLabel =
      frequencyOptions.find((opt) => opt.value === frequency)?.label ?? '';

    saveToHistory(
      { principal: P, rate: R, time: T, frequency: freqLabel },
      { compoundInterest, totalAmount },
      `CI on ${formatCurrency(P)} = ${formatCurrency(compoundInterest)}`,
    );
  }, [principal, rate, time, frequency, frequencyOptions, saveToHistory]);

  const reset = useCallback(() => {
    setPrincipal('');
    setRate('');
    setTime('');
    setFrequency('12');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.compoundInterest.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.compoundInterest.principal')}
        value={principal}
        onChangeText={setPrincipal}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.compoundInterest.rate')}
        value={rate}
        onChangeText={setRate}
        placeholder="8"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.compoundInterest.time')}
        value={time}
        onChangeText={setTime}
        placeholder="5"
        suffix={t('calculators.compoundInterest.years')}
        keyboardType="numeric"
      />

      <CalculatorDropdown
        label={t('calculators.compoundInterest.compoundingFrequency')}
        value={frequency}
        onValueChange={setFrequency}
        options={frequencyOptions}
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.compoundInterest.totalAmount')}
            value={formatCurrency(result.totalAmount)}
            subtitle={`${t('calculators.compoundInterest.interestEarned')}: ${formatCurrency(result.compoundInterest)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.compoundInterest.breakdown')}
            items={[
              {
                label: t('calculators.compoundInterest.principal'),
                value: formatCurrency(parseFloat(principal)),
              },
              {
                label: t('calculators.compoundInterest.compoundInterest'),
                value: formatCurrency(result.compoundInterest),
              },
              {
                label: t('calculators.compoundInterest.totalAmount'),
                value: formatCurrency(result.totalAmount),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default CompoundInterestCalculator;
