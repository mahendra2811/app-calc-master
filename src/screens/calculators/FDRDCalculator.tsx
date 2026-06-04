import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorToggle } from '@/components/CalculatorToggle';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface FDRDResult {
  maturityAmount: number;
  totalInterest: number;
  totalDeposited: number;
}

const FDRDCalculator = React.memo(function FDRDCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('fd-rd-calculator', t('calculators.fdrd.title'));

  const [isRD, setIsRD] = useState(false); // false = FD, true = RD
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [result, setResult] = useState<FDRDResult | null>(null);

  const calculate = useCallback(() => {
    const P = parseFloat(amount);
    const R = parseFloat(rate);
    const months = parseFloat(tenureMonths);

    if (!P || !R || !months || P <= 0 || R <= 0 || months <= 0) {
      return;
    }

    let maturityAmount: number;
    let totalDeposited: number;

    if (!isRD) {
      // FD: Quarterly compounding
      // Maturity = P × (1 + r/4)^(4×t)
      const t = months / 12;
      const r = R / 100;
      maturityAmount = P * Math.pow(1 + r / 4, 4 * t);
      totalDeposited = P;
    } else {
      // RD: Sum of compound interest on each monthly installment
      // Each monthly deposit earns compound interest for remaining months
      // Using quarterly compounding for each installment
      const r = R / 100;
      let total = 0;

      for (let i = 1; i <= months; i++) {
        const remainingMonths = months - i + 1;
        const remainingYears = remainingMonths / 12;
        // Each installment compounds quarterly for remaining period
        total += P * Math.pow(1 + r / 4, 4 * remainingYears);
      }

      maturityAmount = total;
      totalDeposited = P * months;
    }

    const totalInterest = maturityAmount - totalDeposited;

    const res: FDRDResult = {
      maturityAmount,
      totalInterest,
      totalDeposited,
    };

    setResult(res);

    const type = isRD ? 'RD' : 'FD';
    saveToHistory(
      { type, amount: P, rate: R, tenureMonths: months },
      { maturityAmount, totalInterest, totalDeposited },
      `${type}: ${formatCurrency(totalDeposited)} → ${formatCurrency(maturityAmount)}`,
    );
  }, [amount, rate, tenureMonths, isRD, saveToHistory]);

  const reset = useCallback(() => {
    setAmount('');
    setRate('');
    setTenureMonths('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.fdrd.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorToggle
        label={t('calculators.fdrd.depositType')}
        value={isRD}
        onValueChange={setIsRD}
        leftLabel={t('calculators.fdrd.fd')}
        rightLabel={t('calculators.fdrd.rd')}
      />

      <CalculatorInput
        label={
          isRD
            ? t('calculators.fdrd.monthlyDeposit')
            : t('calculators.fdrd.depositAmount')
        }
        value={amount}
        onChangeText={setAmount}
        placeholder={isRD ? '5000' : '100000'}
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.fdrd.interestRate')}
        value={rate}
        onChangeText={setRate}
        placeholder="7"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.fdrd.tenure')}
        value={tenureMonths}
        onChangeText={setTenureMonths}
        placeholder="12"
        suffix={t('calculators.fdrd.months')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.fdrd.maturityAmount')}
            value={formatCurrency(result.maturityAmount)}
            subtitle={`${t('calculators.fdrd.interestEarned')}: ${formatCurrency(result.totalInterest)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.fdrd.breakdown')}
            items={[
              {
                label: t('calculators.fdrd.totalDeposited'),
                value: formatCurrency(result.totalDeposited),
              },
              {
                label: t('calculators.fdrd.totalInterest'),
                value: formatCurrency(result.totalInterest),
              },
              {
                label: t('calculators.fdrd.maturityAmount'),
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

export default FDRDCalculator;
