import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface ROIResult {
  totalProfit: number;
  roiPercent: number;
  annualizedROI: number;
}

const ROICalculator = React.memo(function ROICalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'roi-calculator',
    t('calculators.roi.title'),
  );

  const [amountInvested, setAmountInvested] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [result, setResult] = useState<ROIResult | null>(null);

  const calculate = useCallback(() => {
    const invested = parseFloat(amountInvested);
    const received = parseFloat(amountReceived);
    const years = parseFloat(timePeriod);

    if (
      !invested || !received || !years ||
      invested <= 0 || received <= 0 || years <= 0
    ) {
      return;
    }

    // Total Profit
    const totalProfit = received - invested;

    // ROI = (received - invested) / invested × 100
    const roiPercent = (totalProfit / invested) * 100;

    // Annualized ROI = ((received / invested)^(1/years) - 1) × 100
    const annualizedROI =
      (Math.pow(received / invested, 1 / years) - 1) * 100;

    const res: ROIResult = {
      totalProfit,
      roiPercent,
      annualizedROI,
    };

    setResult(res);

    saveToHistory(
      { amountInvested: invested, amountReceived: received, timePeriod: years },
      { totalProfit, roiPercent, annualizedROI },
      `Invested ${formatCurrency(invested)} → ROI ${formatPercentage(roiPercent)}`,
    );
  }, [amountInvested, amountReceived, timePeriod, saveToHistory]);

  const reset = useCallback(() => {
    setAmountInvested('');
    setAmountReceived('');
    setTimePeriod('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.roi.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.roi.amountInvested')}
        value={amountInvested}
        onChangeText={setAmountInvested}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.roi.amountReceived')}
        value={amountReceived}
        onChangeText={setAmountReceived}
        placeholder="150000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.roi.timePeriod')}
        value={timePeriod}
        onChangeText={setTimePeriod}
        placeholder="3"
        suffix={t('calculators.roi.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.roi.roiPercent')}
            value={formatPercentage(result.roiPercent)}
            subtitle={`${t('calculators.roi.annualizedROI')}: ${formatPercentage(result.annualizedROI)}`}
            type={result.totalProfit >= 0 ? 'success' : 'error'}
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.roi.breakdown')}
            items={[
              {
                label: t('calculators.roi.amountInvested'),
                value: formatCurrency(parseFloat(amountInvested)),
              },
              {
                label: t('calculators.roi.amountReceived'),
                value: formatCurrency(parseFloat(amountReceived)),
              },
              {
                label: t('calculators.roi.totalProfit'),
                value: formatCurrency(result.totalProfit),
                highlight: true,
              },
              {
                label: t('calculators.roi.roiPercent'),
                value: formatPercentage(result.roiPercent),
              },
              {
                label: t('calculators.roi.annualizedROI'),
                value: formatPercentage(result.annualizedROI),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default ROICalculator;
