import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface SIResult {
  simpleInterest: number;
  totalAmount: number;
}

const SimpleInterestCalculator = React.memo(function SimpleInterestCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'simple-interest-calculator',
    t('calculators.simpleInterest.title'),
  );

  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<SIResult | null>(null);

  const calculate = useCallback(() => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseFloat(time);

    if (!P || !R || !T || P <= 0 || R <= 0 || T <= 0) {
      return;
    }

    // SI = P × R × T / 100
    const simpleInterest = (P * R * T) / 100;
    const totalAmount = P + simpleInterest;

    const res: SIResult = {
      simpleInterest,
      totalAmount,
    };

    setResult(res);

    saveToHistory(
      { principal: P, rate: R, time: T },
      { simpleInterest, totalAmount },
      `SI on ${formatCurrency(P)} = ${formatCurrency(simpleInterest)}`,
    );
  }, [principal, rate, time, saveToHistory]);

  const reset = useCallback(() => {
    setPrincipal('');
    setRate('');
    setTime('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.simpleInterest.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.simpleInterest.principal')}
        value={principal}
        onChangeText={setPrincipal}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.simpleInterest.rate')}
        value={rate}
        onChangeText={setRate}
        placeholder="8"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.simpleInterest.time')}
        value={time}
        onChangeText={setTime}
        placeholder="5"
        suffix={t('calculators.simpleInterest.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.simpleInterest.totalAmount')}
            value={formatCurrency(result.totalAmount)}
            subtitle={`${t('calculators.simpleInterest.interestEarned')}: ${formatCurrency(result.simpleInterest)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.simpleInterest.breakdown')}
            items={[
              {
                label: t('calculators.simpleInterest.principal'),
                value: formatCurrency(parseFloat(principal)),
              },
              {
                label: t('calculators.simpleInterest.simpleInterest'),
                value: formatCurrency(result.simpleInterest),
              },
              {
                label: t('calculators.simpleInterest.totalAmount'),
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

export default SimpleInterestCalculator;
