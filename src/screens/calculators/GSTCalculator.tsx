import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorDropdown } from '@/components/CalculatorDropdown';
import { CalculatorToggle } from '@/components/CalculatorToggle';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface GSTResult {
  basePrice: number;
  gstAmount: number;
  totalPrice: number;
  cgst: number;
  sgst: number;
}

const GSTCalculator = React.memo(function GSTCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('gst-calculator', t('calculators.gst.title'));

  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [isRemoveGST, setIsRemoveGST] = useState(false); // false = Add GST, true = Remove GST

  const [result, setResult] = useState<GSTResult | null>(null);

  const gstRateOptions = useMemo(
    () => [
      { label: '5%', value: '5' },
      { label: '12%', value: '12' },
      { label: '18%', value: '18' },
      { label: '28%', value: '28' },
    ],
    [],
  );

  const calculate = useCallback(() => {
    const amt = parseFloat(amount);
    const rateVal = parseFloat(gstRate);

    if (!amt || amt <= 0) {
      return;
    }

    let basePrice: number;
    let gstAmount: number;
    let totalPrice: number;

    if (!isRemoveGST) {
      // Add GST: GST = Amount × Rate/100, Total = Amount + GST
      basePrice = amt;
      gstAmount = amt * (rateVal / 100);
      totalPrice = amt + gstAmount;
    } else {
      // Remove GST: Base = Amount × 100/(100+Rate), GST = Amount - Base
      basePrice = (amt * 100) / (100 + rateVal);
      gstAmount = amt - basePrice;
      totalPrice = amt;
    }

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    const res: GSTResult = {
      basePrice,
      gstAmount,
      totalPrice,
      cgst,
      sgst,
    };

    setResult(res);

    const mode = isRemoveGST ? 'Exclusive' : 'Inclusive';
    saveToHistory(
      { amount: amt, gstRate: rateVal, mode },
      { basePrice, gstAmount, totalPrice, cgst, sgst },
      `GST ${rateVal}% ${isRemoveGST ? 'excl' : 'incl'}: ${formatCurrency(amt)} → ${formatCurrency(totalPrice)}`,
    );
  }, [amount, gstRate, isRemoveGST, saveToHistory]);

  const reset = useCallback(() => {
    setAmount('');
    setGstRate('18');
    setIsRemoveGST(false);
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.gst.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.gst.amount')}
        value={amount}
        onChangeText={setAmount}
        placeholder="10000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorDropdown
        label={t('calculators.gst.gstRate')}
        value={gstRate}
        onValueChange={setGstRate}
        options={gstRateOptions}
      />

      <CalculatorToggle
        label={t('calculators.gst.calculationType')}
        value={isRemoveGST}
        onValueChange={setIsRemoveGST}
        leftLabel={t('calculators.gst.addGST')}
        rightLabel={t('calculators.gst.removeGST')}
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.gst.totalPrice')}
            value={formatCurrency(result.totalPrice)}
            subtitle={`${t('calculators.gst.gstAmount')}: ${formatCurrency(result.gstAmount)}`}
            type="primary"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.gst.breakdown')}
            items={[
              {
                label: t('calculators.gst.basePrice'),
                value: formatCurrency(result.basePrice),
              },
              {
                label: `CGST (${parseFloat(gstRate) / 2}%)`,
                value: formatCurrency(result.cgst),
              },
              {
                label: `SGST (${parseFloat(gstRate) / 2}%)`,
                value: formatCurrency(result.sgst),
              },
              {
                label: t('calculators.gst.totalGST'),
                value: formatCurrency(result.gstAmount),
              },
              {
                label: t('calculators.gst.totalPrice'),
                value: formatCurrency(result.totalPrice),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default GSTCalculator;
