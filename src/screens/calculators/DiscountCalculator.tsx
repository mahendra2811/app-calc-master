import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface DiscountResult {
  discountAmount: number;
  finalPrice: number;
}

const DiscountCalculator = React.memo(function DiscountCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'discount-calculator',
    t('calculators.discount.title'),
  );

  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [result, setResult] = useState<DiscountResult | null>(null);

  const calculate = useCallback(() => {
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);

    if (!price || price <= 0 || discount === undefined || discount < 0 || discount > 100) {
      return;
    }

    // Discount Amount = Price × Discount/100
    const discountAmount = (price * discount) / 100;
    // Final = Price - Discount Amount
    const finalPrice = price - discountAmount;

    const res: DiscountResult = {
      discountAmount,
      finalPrice,
    };

    setResult(res);

    saveToHistory(
      { originalPrice: price, discountPercent: discount },
      { discountAmount, finalPrice },
      `${formatPercentage(discount)} off ${formatCurrency(price)} = ${formatCurrency(finalPrice)}`,
    );
  }, [originalPrice, discountPercent, saveToHistory]);

  const reset = useCallback(() => {
    setOriginalPrice('');
    setDiscountPercent('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.discount.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.discount.originalPrice')}
        value={originalPrice}
        onChangeText={setOriginalPrice}
        placeholder="2000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.discount.discountPercent')}
        value={discountPercent}
        onChangeText={setDiscountPercent}
        placeholder="20"
        suffix="%"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.discount.finalPrice')}
            value={formatCurrency(result.finalPrice)}
            subtitle={`${t('calculators.discount.youSave')}: ${formatCurrency(result.discountAmount)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.discount.breakdown')}
            items={[
              {
                label: t('calculators.discount.originalPrice'),
                value: formatCurrency(parseFloat(originalPrice)),
              },
              {
                label: t('calculators.discount.discountAmount'),
                value: formatCurrency(result.discountAmount),
              },
              {
                label: t('calculators.discount.finalPrice'),
                value: formatCurrency(result.finalPrice),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default DiscountCalculator;
