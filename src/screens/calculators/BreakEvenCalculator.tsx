import React, { useState, useCallback, memo } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatIndianNumber } from '@/utils/format-number';

const BreakEvenCalculator = memo(function BreakEvenCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('break-even', t('calculators.breakEven.name'));

  const [fixedCost, setFixedCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [variableCost, setVariableCost] = useState('');

  const [result, setResult] = useState<{
    breakEvenUnits: number;
    breakEvenRevenue: number;
    contributionMargin: number;
  } | null>(null);

  const handleCalculate = useCallback(() => {
    const fc = parseFloat(fixedCost);
    const sp = parseFloat(sellingPrice);
    const vc = parseFloat(variableCost);

    if (!fc || !sp || isNaN(vc) || sp <= vc) {
      return;
    }

    const contributionMargin = sp - vc;
    const breakEvenUnits = Math.ceil(fc / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * sp;

    const res = { breakEvenUnits, breakEvenRevenue, contributionMargin };
    setResult(res);

    saveToHistory(
      { fixedCost: fc, sellingPrice: sp, variableCost: vc },
      res
    );
  }, [fixedCost, sellingPrice, variableCost, saveToHistory]);

  const handleReset = useCallback(() => {
    setFixedCost('');
    setSellingPrice('');
    setVariableCost('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.breakEven.name')}
      onCalculate={handleCalculate}
      onReset={handleReset}
    >
      <CalculatorInput
        label={t('calculators.breakEven.fixedCost')}
        value={fixedCost}
        onChangeText={setFixedCost}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.breakEven.sellingPrice')}
        value={sellingPrice}
        onChangeText={setSellingPrice}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.breakEven.variableCost')}
        value={variableCost}
        onChangeText={setVariableCost}
        placeholder="0"
        suffix="₹"
      />

      {result && (
        <View className="mt-4">
          <ResultCard
            title={t('calculators.breakEven.breakEvenUnits')}
            value={formatIndianNumber(result.breakEvenUnits)}
            subtitle={`${t('calculators.breakEven.breakEvenUnits')}`}
            type="primary"
            visible={true}
          />
          <ResultBreakdown
            title={t('calc.details')}
            items={[
              { label: t('calculators.breakEven.breakEvenUnits'), value: formatIndianNumber(result.breakEvenUnits), highlight: true },
              { label: t('calculators.breakEven.breakEvenRevenue'), value: formatCurrency(result.breakEvenRevenue), highlight: true },
              { label: t('calculators.breakEven.contributionMargin'), value: formatCurrency(result.contributionMargin) },
              { label: t('calculators.breakEven.fixedCost'), value: formatCurrency(parseFloat(fixedCost)) },
              { label: t('calculators.breakEven.sellingPrice'), value: formatCurrency(parseFloat(sellingPrice)) },
              { label: t('calculators.breakEven.variableCost'), value: formatCurrency(parseFloat(variableCost)) },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default BreakEvenCalculator;
