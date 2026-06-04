import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface NPSResult {
  totalInvested: number;
  interestEarned: number;
  maturityAmount: number;
}

const RETIREMENT_AGE = 60;

const NPSCalculator = React.memo(function NPSCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'nps-calculator',
    t('calculators.nps.title'),
  );

  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [result, setResult] = useState<NPSResult | null>(null);

  const calculate = useCallback(() => {
    const contribution = parseFloat(monthlyContribution);
    const age = parseFloat(currentAge);
    const returnRate = parseFloat(expectedReturn);

    if (
      !contribution || !age || !returnRate ||
      contribution <= 0 || age <= 0 || age >= RETIREMENT_AGE || returnRate <= 0
    ) {
      return;
    }

    const yearsToRetire = RETIREMENT_AGE - age;
    const totalMonths = yearsToRetire * 12;
    const monthlyRate = returnRate / 12 / 100;

    const totalInvested = contribution * totalMonths;

    // FV of annuity due: FV = P × [(1+r)^n - 1] / r × (1+r)
    const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
    const maturityAmount =
      contribution * ((compoundFactor - 1) / monthlyRate) * (1 + monthlyRate);

    const interestEarned = maturityAmount - totalInvested;

    const res: NPSResult = {
      totalInvested,
      interestEarned,
      maturityAmount,
    };

    setResult(res);

    saveToHistory(
      {
        monthlyContribution: contribution,
        currentAge: age,
        expectedReturn: returnRate,
      },
      { totalInvested, interestEarned, maturityAmount },
      `NPS ${formatCurrency(contribution)}/mo → ${formatCurrency(maturityAmount)} at 60`,
    );
  }, [monthlyContribution, currentAge, expectedReturn, saveToHistory]);

  const reset = useCallback(() => {
    setMonthlyContribution('');
    setCurrentAge('');
    setExpectedReturn('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.nps.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.nps.monthlyContribution')}
        value={monthlyContribution}
        onChangeText={setMonthlyContribution}
        placeholder="5000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.nps.currentAge')}
        value={currentAge}
        onChangeText={setCurrentAge}
        placeholder="30"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.nps.expectedReturn')}
        value={expectedReturn}
        onChangeText={setExpectedReturn}
        placeholder="10"
        suffix="%"
        keyboardType="numeric"
      />

      {/* Retirement age is fixed at 60 - shown as read-only info */}
      <CalculatorInput
        label={t('calculators.nps.retirementAge')}
        value={String(RETIREMENT_AGE)}
        onChangeText={() => {}}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.nps.maturityAmount')}
            value={formatCurrency(result.maturityAmount)}
            subtitle={`${t('calculators.nps.atAge')} ${RETIREMENT_AGE}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.nps.breakdown')}
            items={[
              {
                label: t('calculators.nps.totalInvested'),
                value: formatCurrency(result.totalInvested),
              },
              {
                label: t('calculators.nps.interestEarned'),
                value: formatCurrency(result.interestEarned),
              },
              {
                label: t('calculators.nps.maturityAmount'),
                value: formatCurrency(result.maturityAmount),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default NPSCalculator;
