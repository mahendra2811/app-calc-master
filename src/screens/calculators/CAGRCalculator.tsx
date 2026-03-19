import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface CAGRResult {
  cagr: number;
  absoluteReturn: number;
  totalGain: number;
}

const CAGRCalculator = React.memo(function CAGRCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'cagr-calculator',
    t('calculators.cagr.title'),
  );

  const [initialInvestment, setInitialInvestment] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [result, setResult] = useState<CAGRResult | null>(null);

  const calculate = useCallback(() => {
    const initial = parseFloat(initialInvestment);
    const final_ = parseFloat(finalValue);
    const years = parseFloat(timePeriod);

    if (
      !initial || !final_ || !years ||
      initial <= 0 || final_ <= 0 || years <= 0
    ) {
      return;
    }

    // CAGR = ((finalValue / initialValue)^(1/years) - 1) × 100
    const cagr = (Math.pow(final_ / initial, 1 / years) - 1) * 100;

    // Absolute Return = ((finalValue - initialValue) / initialValue) × 100
    const absoluteReturn = ((final_ - initial) / initial) * 100;

    const totalGain = final_ - initial;

    const res: CAGRResult = {
      cagr,
      absoluteReturn,
      totalGain,
    };

    setResult(res);

    saveToHistory(
      {
        initialInvestment: initial,
        finalValue: final_,
        timePeriod: years,
      },
      { cagr, absoluteReturn, totalGain },
      `${formatCurrency(initial)} → ${formatCurrency(final_)} | CAGR ${formatPercentage(cagr)}`,
    );
  }, [initialInvestment, finalValue, timePeriod, saveToHistory]);

  const reset = useCallback(() => {
    setInitialInvestment('');
    setFinalValue('');
    setTimePeriod('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.cagr.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.cagr.initialInvestment')}
        value={initialInvestment}
        onChangeText={setInitialInvestment}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.cagr.finalValue')}
        value={finalValue}
        onChangeText={setFinalValue}
        placeholder="200000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.cagr.timePeriod')}
        value={timePeriod}
        onChangeText={setTimePeriod}
        placeholder="5"
        suffix={t('calculators.cagr.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.cagr.cagrPercent')}
            value={formatPercentage(result.cagr)}
            subtitle={`${t('calculators.cagr.absoluteReturn')}: ${formatPercentage(result.absoluteReturn)}`}
            type={result.totalGain >= 0 ? 'success' : 'error'}
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.cagr.breakdown')}
            items={[
              {
                label: t('calculators.cagr.initialInvestment'),
                value: formatCurrency(parseFloat(initialInvestment)),
              },
              {
                label: t('calculators.cagr.finalValue'),
                value: formatCurrency(parseFloat(finalValue)),
              },
              {
                label: t('calculators.cagr.totalGain'),
                value: formatCurrency(result.totalGain),
              },
              {
                label: t('calculators.cagr.cagrPercent'),
                value: formatPercentage(result.cagr),
                highlight: true,
              },
              {
                label: t('calculators.cagr.absoluteReturn'),
                value: formatPercentage(result.absoluteReturn),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default CAGRCalculator;
