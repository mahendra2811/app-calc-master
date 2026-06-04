import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface SIPResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

const SIPCalculator = React.memo(function SIPCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('sip-calculator', t('calculators.sip.title'));

  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [result, setResult] = useState<SIPResult | null>(null);

  const calculate = useCallback(() => {
    const P = parseFloat(monthlyInvestment);
    const annualRate = parseFloat(expectedReturn);
    const years = parseFloat(timePeriod);

    if (!P || !annualRate || !years || P <= 0 || annualRate <= 0 || years <= 0) {
      return;
    }

    const r = annualRate / 12 / 100;
    const n = years * 12;
    const investedAmount = P * n;

    // FV = P × [(1+r)^n - 1] / r × (1+r)
    const compoundFactor = Math.pow(1 + r, n);
    const totalValue = P * ((compoundFactor - 1) / r) * (1 + r);
    const estimatedReturns = totalValue - investedAmount;

    const res: SIPResult = {
      investedAmount,
      estimatedReturns,
      totalValue,
    };

    setResult(res);

    saveToHistory(
      { monthlyInvestment: P, expectedReturn: annualRate, timePeriod: years },
      { investedAmount, estimatedReturns, totalValue },
      `${formatCurrency(P)}/mo → ${formatCurrency(totalValue)}`,
    );
  }, [monthlyInvestment, expectedReturn, timePeriod, saveToHistory]);

  const reset = useCallback(() => {
    setMonthlyInvestment('');
    setExpectedReturn('');
    setTimePeriod('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.sip.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.sip.monthlyInvestment')}
        value={monthlyInvestment}
        onChangeText={setMonthlyInvestment}
        placeholder="5000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.sip.expectedReturn')}
        value={expectedReturn}
        onChangeText={setExpectedReturn}
        placeholder="12"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.sip.timePeriod')}
        value={timePeriod}
        onChangeText={setTimePeriod}
        placeholder="10"
        suffix={t('calculators.sip.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.sip.totalValue')}
            value={formatCurrency(result.totalValue)}
            subtitle={`${t('calculators.sip.returns')}: ${formatCurrency(result.estimatedReturns)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.sip.breakdown')}
            items={[
              {
                label: t('calculators.sip.investedAmount'),
                value: formatCurrency(result.investedAmount),
              },
              {
                label: t('calculators.sip.estimatedReturns'),
                value: formatCurrency(result.estimatedReturns),
              },
              {
                label: t('calculators.sip.totalValue'),
                value: formatCurrency(result.totalValue),
                highlight: true,
              },
              {
                label: t('calculators.sip.wealthGained'),
                value: formatPercentage(
                  (result.estimatedReturns / result.investedAmount) * 100,
                ),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default SIPCalculator;
