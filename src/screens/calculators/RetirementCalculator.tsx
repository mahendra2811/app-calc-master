import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface RetirementResult {
  yearsToRetire: number;
  futureMonthlyExpense: number;
  corpusNeeded: number;
  futureValueOfSavings: number;
  additionalSavingsNeeded: number;
  monthlySavingRequired: number;
}

const RetirementCalculator = React.memo(function RetirementCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'retirement-calculator',
    t('calculators.retirement.title'),
  );

  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [currentExpense, setCurrentExpense] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [inflationRate, setInflationRate] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [result, setResult] = useState<RetirementResult | null>(null);

  const calculate = useCallback(() => {
    const age = parseFloat(currentAge);
    const retAge = parseFloat(retirementAge);
    const expense = parseFloat(currentExpense);
    const returnRate = parseFloat(expectedReturn);
    const inflation = parseFloat(inflationRate);
    const savings = parseFloat(currentSavings) || 0;

    if (
      !age || !retAge || !expense || !returnRate || !inflation ||
      age <= 0 || retAge <= age || expense <= 0 || returnRate <= 0 || inflation <= 0
    ) {
      return;
    }

    const yearsToRetire = retAge - age;

    // Future monthly expense adjusted for inflation
    const futureMonthlyExpense =
      expense * Math.pow(1 + inflation / 100, yearsToRetire);

    // Corpus needed using 25x annual rule (can sustain ~4% withdrawal rate)
    const corpusNeeded = futureMonthlyExpense * 12 * 25;

    // Future value of current savings
    const futureValueOfSavings =
      savings * Math.pow(1 + returnRate / 100, yearsToRetire);

    // Additional savings needed
    const additionalSavingsNeeded = Math.max(
      corpusNeeded - futureValueOfSavings,
      0,
    );

    // Monthly saving required using future value of annuity formula
    // FV = PMT × [(1+r)^n - 1] / r × (1+r)
    // PMT = FV × r / [(1+r)^n - 1] / (1+r)
    let monthlySavingRequired = 0;
    if (additionalSavingsNeeded > 0) {
      const monthlyRate = returnRate / 12 / 100;
      const totalMonths = yearsToRetire * 12;
      const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
      monthlySavingRequired =
        (additionalSavingsNeeded * monthlyRate) /
        ((compoundFactor - 1) * (1 + monthlyRate));
    }

    const res: RetirementResult = {
      yearsToRetire,
      futureMonthlyExpense,
      corpusNeeded,
      futureValueOfSavings,
      additionalSavingsNeeded,
      monthlySavingRequired,
    };

    setResult(res);

    saveToHistory(
      {
        currentAge: age,
        retirementAge: retAge,
        currentExpense: expense,
        expectedReturn: returnRate,
        inflationRate: inflation,
        currentSavings: savings,
      },
      { corpusNeeded, monthlySavingRequired },
      `Retire at ${retAge} → Need ${formatCurrency(corpusNeeded)}, Save ${formatCurrency(monthlySavingRequired)}/mo`,
    );
  }, [currentAge, retirementAge, currentExpense, expectedReturn, inflationRate, currentSavings, saveToHistory]);

  const reset = useCallback(() => {
    setCurrentAge('');
    setRetirementAge('');
    setCurrentExpense('');
    setExpectedReturn('');
    setInflationRate('');
    setCurrentSavings('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.retirement.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.retirement.currentAge')}
        value={currentAge}
        onChangeText={setCurrentAge}
        placeholder="30"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.retirement.retirementAge')}
        value={retirementAge}
        onChangeText={setRetirementAge}
        placeholder="60"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.retirement.currentExpense')}
        value={currentExpense}
        onChangeText={setCurrentExpense}
        placeholder="50000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.retirement.expectedReturn')}
        value={expectedReturn}
        onChangeText={setExpectedReturn}
        placeholder="12"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.retirement.inflationRate')}
        value={inflationRate}
        onChangeText={setInflationRate}
        placeholder="6"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.retirement.currentSavings')}
        value={currentSavings}
        onChangeText={setCurrentSavings}
        placeholder="500000"
        suffix="₹"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.retirement.corpusNeeded')}
            value={formatCurrency(result.corpusNeeded)}
            subtitle={`${t('calculators.retirement.in')} ${result.yearsToRetire} ${t('calculators.retirement.years')}`}
            type="primary"
            visible={!!result}
          />

          <ResultCard
            title={t('calculators.retirement.monthlySaving')}
            value={formatCurrency(result.monthlySavingRequired)}
            subtitle={t('calculators.retirement.toReachGoal')}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.retirement.breakdown')}
            items={[
              {
                label: t('calculators.retirement.futureMonthlyExpense'),
                value: formatCurrency(result.futureMonthlyExpense),
              },
              {
                label: t('calculators.retirement.corpusNeeded'),
                value: formatCurrency(result.corpusNeeded),
                highlight: true,
              },
              {
                label: t('calculators.retirement.futureValueSavings'),
                value: formatCurrency(result.futureValueOfSavings),
              },
              {
                label: t('calculators.retirement.additionalNeeded'),
                value: formatCurrency(result.additionalSavingsNeeded),
              },
              {
                label: t('calculators.retirement.monthlySaving'),
                value: formatCurrency(result.monthlySavingRequired),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default RetirementCalculator;
