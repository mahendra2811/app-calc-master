import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorToggle } from '@/components/CalculatorToggle';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
}

const EMICalculator = React.memo(function EMICalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('emi-calculator', t('calculators.emi.title'));

  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [isMonths, setIsMonths] = useState(false); // false = Years, true = Months
  const [result, setResult] = useState<EMIResult | null>(null);

  const calculate = useCallback(() => {
    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const tenureVal = parseFloat(tenure);

    if (!P || !annualRate || !tenureVal || P <= 0 || annualRate <= 0 || tenureVal <= 0) {
      return;
    }

    const r = annualRate / 12 / 100;
    const n = isMonths ? tenureVal : tenureVal * 12;

    // EMI = P × r × (1+r)^n / [(1+r)^n - 1]
    const compoundFactor = Math.pow(1 + r, n);
    const monthlyEMI = (P * r * compoundFactor) / (compoundFactor - 1);
    const totalAmount = monthlyEMI * n;
    const totalInterest = totalAmount - P;

    const res: EMIResult = {
      monthlyEMI,
      totalInterest,
      totalAmount,
    };

    setResult(res);

    saveToHistory(
      {
        loanAmount: P,
        interestRate: annualRate,
        tenure: tenureVal,
        tenureUnit: isMonths ? 'months' : 'years',
      },
      { monthlyEMI, totalInterest, totalAmount },
      `${formatCurrency(P)} @ ${formatPercentage(annualRate)} → EMI ${formatCurrency(monthlyEMI)}`,
    );
  }, [loanAmount, interestRate, tenure, isMonths, saveToHistory]);

  const reset = useCallback(() => {
    setLoanAmount('');
    setInterestRate('');
    setTenure('');
    setIsMonths(false);
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.emi.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.emi.loanAmount')}
        value={loanAmount}
        onChangeText={setLoanAmount}
        placeholder="1000000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.emi.interestRate')}
        value={interestRate}
        onChangeText={setInterestRate}
        placeholder="8.5"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorToggle
        label={t('calculators.emi.tenureType')}
        value={isMonths}
        onValueChange={setIsMonths}
        leftLabel={t('calculators.emi.years')}
        rightLabel={t('calculators.emi.months')}
      />

      <CalculatorInput
        label={t('calculators.emi.loanTenure')}
        value={tenure}
        onChangeText={setTenure}
        placeholder={isMonths ? '240' : '20'}
        suffix={isMonths ? t('calculators.emi.months') : t('calculators.emi.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.emi.monthlyEMI')}
            value={formatCurrency(result.monthlyEMI)}
            subtitle={`${t('calculators.emi.totalInterest')}: ${formatCurrency(result.totalInterest)}`}
            type="primary"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.emi.breakdown')}
            items={[
              {
                label: t('calculators.emi.loanAmount'),
                value: formatCurrency(parseFloat(loanAmount)),
              },
              {
                label: t('calculators.emi.totalInterest'),
                value: formatCurrency(result.totalInterest),
              },
              {
                label: t('calculators.emi.totalAmount'),
                value: formatCurrency(result.totalAmount),
                highlight: true,
              },
              {
                label: t('calculators.emi.interestToLoanRatio'),
                value: formatPercentage(
                  (result.totalInterest / parseFloat(loanAmount)) * 100,
                ),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default EMICalculator;
