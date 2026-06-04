import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatPercentage } from '@/utils/format-number';

interface MortgageResult {
  loanAmount: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
}

const MortgageCalculator = React.memo(function MortgageCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'mortgage-calculator',
    t('calculators.mortgage.title'),
  );

  const [homeValue, setHomeValue] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [result, setResult] = useState<MortgageResult | null>(null);

  const calculate = useCallback(() => {
    const home = parseFloat(homeValue);
    const down = parseFloat(downPayment);
    const rate = parseFloat(interestRate);
    const years = parseFloat(loanTenure);

    if (
      !home || !down || !rate || !years ||
      home <= 0 || down < 0 || rate <= 0 || years <= 0 ||
      down >= home
    ) {
      return;
    }

    const loanAmount = home - down;
    const r = rate / 12 / 100;
    const n = years * 12;

    // EMI = P x r x (1+r)^n / [(1+r)^n - 1]
    const compoundFactor = Math.pow(1 + r, n);
    const monthlyEMI = (loanAmount * r * compoundFactor) / (compoundFactor - 1);
    const totalPayment = monthlyEMI * n;
    const totalInterest = totalPayment - loanAmount;

    const res: MortgageResult = {
      loanAmount,
      monthlyEMI,
      totalInterest,
      totalPayment,
    };

    setResult(res);

    saveToHistory(
      {
        homeValue: home,
        downPayment: down,
        interestRate: rate,
        loanTenure: years,
      },
      { loanAmount, monthlyEMI, totalInterest, totalPayment },
      `Home ${formatCurrency(home)} → EMI ${formatCurrency(monthlyEMI)}`,
    );
  }, [homeValue, downPayment, interestRate, loanTenure, saveToHistory]);

  const reset = useCallback(() => {
    setHomeValue('');
    setDownPayment('');
    setInterestRate('');
    setLoanTenure('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.mortgage.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.mortgage.homeValue')}
        value={homeValue}
        onChangeText={setHomeValue}
        placeholder="5000000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.mortgage.downPayment')}
        value={downPayment}
        onChangeText={setDownPayment}
        placeholder="1000000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.mortgage.interestRate')}
        value={interestRate}
        onChangeText={setInterestRate}
        placeholder="8.5"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.mortgage.loanTenure')}
        value={loanTenure}
        onChangeText={setLoanTenure}
        placeholder="20"
        suffix={t('calculators.mortgage.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.mortgage.monthlyEMI')}
            value={formatCurrency(result.monthlyEMI)}
            subtitle={`${t('calculators.mortgage.loanAmount')}: ${formatCurrency(result.loanAmount)}`}
            type="primary"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.mortgage.breakdown')}
            items={[
              {
                label: t('calculators.mortgage.loanAmount'),
                value: formatCurrency(result.loanAmount),
              },
              {
                label: t('calculators.mortgage.totalInterest'),
                value: formatCurrency(result.totalInterest),
              },
              {
                label: t('calculators.mortgage.totalPayment'),
                value: formatCurrency(result.totalPayment),
                highlight: true,
              },
              {
                label: t('calculators.mortgage.interestToLoanRatio'),
                value: formatPercentage(
                  (result.totalInterest / result.loanAmount) * 100,
                ),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default MortgageCalculator;
