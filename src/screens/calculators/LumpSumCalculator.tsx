import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface LumpSumResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
}

const LumpSumCalculator = React.memo(function LumpSumCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('lumpsum-calculator', t('calculators.lumpsum.title'));

  const [totalInvestment, setTotalInvestment] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [result, setResult] = useState<LumpSumResult | null>(null);

  const calculate = useCallback(() => {
    const PV = parseFloat(totalInvestment);
    const rate = parseFloat(expectedReturn);
    const years = parseFloat(timePeriod);

    if (!PV || !rate || !years || PV <= 0 || rate <= 0 || years <= 0) {
      return;
    }

    // FV = PV × (1 + r/100)^n
    const totalValue = PV * Math.pow(1 + rate / 100, years);
    const estimatedReturns = totalValue - PV;

    const res: LumpSumResult = {
      investedAmount: PV,
      estimatedReturns,
      totalValue,
    };

    setResult(res);

    saveToHistory(
      { totalInvestment: PV, expectedReturn: rate, timePeriod: years },
      { investedAmount: PV, estimatedReturns, totalValue },
      `${formatCurrency(PV)} → ${formatCurrency(totalValue)}`,
    );
  }, [totalInvestment, expectedReturn, timePeriod, saveToHistory]);

  const reset = useCallback(() => {
    setTotalInvestment('');
    setExpectedReturn('');
    setTimePeriod('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.lumpsum.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.lumpsum.totalInvestment')}
        value={totalInvestment}
        onChangeText={setTotalInvestment}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.lumpsum.expectedReturn')}
        value={expectedReturn}
        onChangeText={setExpectedReturn}
        placeholder="12"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.lumpsum.timePeriod')}
        value={timePeriod}
        onChangeText={setTimePeriod}
        placeholder="10"
        suffix={t('calculators.lumpsum.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.lumpsum.totalValue')}
            value={formatCurrency(result.totalValue)}
            subtitle={`${t('calculators.lumpsum.returns')}: ${formatCurrency(result.estimatedReturns)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.lumpsum.breakdown')}
            items={[
              {
                label: t('calculators.lumpsum.investedAmount'),
                value: formatCurrency(result.investedAmount),
              },
              {
                label: t('calculators.lumpsum.estimatedReturns'),
                value: formatCurrency(result.estimatedReturns),
              },
              {
                label: t('calculators.lumpsum.totalValue'),
                value: formatCurrency(result.totalValue),
                highlight: true,
              },
              {
                label: t('calculators.lumpsum.absoluteReturn'),
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

export default LumpSumCalculator;
