import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface PLResult {
  profitLossAmount: number;
  profitLossPercent: number;
  isProfit: boolean;
}

const ProfitLossCalculator = React.memo(function ProfitLossCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'profit-loss-calculator',
    t('calculators.profitLoss.title'),
  );

  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [result, setResult] = useState<PLResult | null>(null);

  const calculate = useCallback(() => {
    const CP = parseFloat(costPrice);
    const SP = parseFloat(sellingPrice);

    if (!CP || !SP || CP <= 0 || SP <= 0) {
      return;
    }

    // PL = SP - CP, PL% = (PL/CP) × 100
    const profitLossAmount = SP - CP;
    const profitLossPercent = (profitLossAmount / CP) * 100;
    const isProfit = profitLossAmount >= 0;

    const res: PLResult = {
      profitLossAmount,
      profitLossPercent,
      isProfit,
    };

    setResult(res);

    const label = isProfit ? 'Profit' : 'Loss';
    saveToHistory(
      { costPrice: CP, sellingPrice: SP },
      { profitLossAmount, profitLossPercent, isProfit },
      `${label}: ${formatCurrency(Math.abs(profitLossAmount))} (${formatPercentage(Math.abs(profitLossPercent))})`,
    );
  }, [costPrice, sellingPrice, saveToHistory]);

  const reset = useCallback(() => {
    setCostPrice('');
    setSellingPrice('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.profitLoss.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.profitLoss.costPrice')}
        value={costPrice}
        onChangeText={setCostPrice}
        placeholder="1000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.profitLoss.sellingPrice')}
        value={sellingPrice}
        onChangeText={setSellingPrice}
        placeholder="1200"
        suffix="₹"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={
              result.isProfit
                ? t('calculators.profitLoss.profit')
                : t('calculators.profitLoss.loss')
            }
            value={formatCurrency(Math.abs(result.profitLossAmount))}
            subtitle={`${result.isProfit ? t('calculators.profitLoss.profit') : t('calculators.profitLoss.loss')}: ${formatPercentage(Math.abs(result.profitLossPercent))}`}
            type={result.isProfit ? 'success' : 'error'}
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.profitLoss.breakdown')}
            items={[
              {
                label: t('calculators.profitLoss.costPrice'),
                value: formatCurrency(parseFloat(costPrice)),
              },
              {
                label: t('calculators.profitLoss.sellingPrice'),
                value: formatCurrency(parseFloat(sellingPrice)),
              },
              {
                label: result.isProfit
                  ? t('calculators.profitLoss.profitAmount')
                  : t('calculators.profitLoss.lossAmount'),
                value: formatCurrency(Math.abs(result.profitLossAmount)),
                highlight: true,
              },
              {
                label: result.isProfit
                  ? t('calculators.profitLoss.profitPercent')
                  : t('calculators.profitLoss.lossPercent'),
                value: formatPercentage(Math.abs(result.profitLossPercent)),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default ProfitLossCalculator;
