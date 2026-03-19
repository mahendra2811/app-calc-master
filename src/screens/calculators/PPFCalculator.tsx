import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface PPFResult {
  totalInvested: number;
  totalInterest: number;
  maturityAmount: number;
}

const PPF_TENURE = 15;
const PPF_MAX_INVESTMENT = 150000;
const PPF_DEFAULT_RATE = '7.1';

const PPFCalculator = React.memo(function PPFCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('ppf-calculator', t('calculators.ppf.title'));

  const [yearlyInvestment, setYearlyInvestment] = useState('');
  const [ppfRate, setPpfRate] = useState(PPF_DEFAULT_RATE);
  const [result, setResult] = useState<PPFResult | null>(null);

  const investmentError =
    yearlyInvestment && parseFloat(yearlyInvestment) > PPF_MAX_INVESTMENT
      ? t('calculators.ppf.maxInvestmentError')
      : undefined;

  const calculate = useCallback(() => {
    const yearly = parseFloat(yearlyInvestment);
    const ratePercent = parseFloat(ppfRate);

    if (!yearly || !ratePercent || yearly <= 0 || ratePercent <= 0) {
      return;
    }

    // Cap at maximum allowed
    const investment = Math.min(yearly, PPF_MAX_INVESTMENT);
    const rate = ratePercent / 100;

    // Year-by-year compounding:
    // balance at end of each year = (prev_balance + yearly_investment) × (1 + rate)
    let balance = 0;
    for (let year = 1; year <= PPF_TENURE; year++) {
      balance = (balance + investment) * (1 + rate);
    }

    const totalInvested = investment * PPF_TENURE;
    const totalInterest = balance - totalInvested;
    const maturityAmount = balance;

    const res: PPFResult = {
      totalInvested,
      totalInterest,
      maturityAmount,
    };

    setResult(res);

    saveToHistory(
      { yearlyInvestment: investment, ppfRate: ratePercent, tenure: PPF_TENURE },
      { totalInvested, totalInterest, maturityAmount },
      `PPF ${formatCurrency(investment)}/yr → ${formatCurrency(maturityAmount)}`,
    );
  }, [yearlyInvestment, ppfRate, saveToHistory]);

  const reset = useCallback(() => {
    setYearlyInvestment('');
    setPpfRate(PPF_DEFAULT_RATE);
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.ppf.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.ppf.yearlyInvestment')}
        value={yearlyInvestment}
        onChangeText={setYearlyInvestment}
        placeholder="150000"
        suffix="₹"
        keyboardType="numeric"
        error={investmentError}
      />

      <CalculatorInput
        label={t('calculators.ppf.ppfRate')}
        value={ppfRate}
        onChangeText={setPpfRate}
        placeholder="7.1"
        suffix="%"
        keyboardType="numeric"
      />

      {/* Tenure is fixed at 15 years - shown as read-only info */}
      <CalculatorInput
        label={t('calculators.ppf.tenure')}
        value={String(PPF_TENURE)}
        onChangeText={() => {}}
        suffix={t('calculators.ppf.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.ppf.maturityAmount')}
            value={formatCurrency(result.maturityAmount)}
            subtitle={`${t('calculators.ppf.after')} ${PPF_TENURE} ${t('calculators.ppf.years')}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.ppf.breakdown')}
            items={[
              {
                label: t('calculators.ppf.totalInvested'),
                value: formatCurrency(result.totalInvested),
              },
              {
                label: t('calculators.ppf.totalInterest'),
                value: formatCurrency(result.totalInterest),
              },
              {
                label: t('calculators.ppf.maturityAmount'),
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

export default PPFCalculator;
