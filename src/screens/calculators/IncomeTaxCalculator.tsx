import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface IncomeTaxResult {
  oldRegimeTax: number;
  newRegimeTax: number;
  oldTaxableIncome: number;
  newTaxableIncome: number;
  savings: number;
  betterRegime: 'old' | 'new';
}

/**
 * Old Regime slabs (FY 2024-25):
 * 0 - 2.5L: 0%
 * 2.5L - 5L: 5%
 * 5L - 10L: 20%
 * 10L+: 30%
 * + 4% Health & Education Cess
 * Standard Deduction: ₹50,000
 */
function calculateOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 250000) return 0;

  let tax = 0;
  const slabs: [number, number, number][] = [
    [250000, 500000, 0.05],
    [500000, 1000000, 0.20],
    [1000000, Infinity, 0.30],
  ];

  for (const [lower, upper, rate] of slabs) {
    if (taxableIncome <= lower) break;
    const taxableInSlab = Math.min(taxableIncome, upper) - lower;
    if (taxableInSlab > 0) {
      tax += taxableInSlab * rate;
    }
  }

  // 4% Health and Education Cess
  tax = tax * 1.04;
  return tax;
}

/**
 * New Regime slabs (FY 2024-25):
 * 0 - 3L: 0%
 * 3L - 7L: 5%
 * 7L - 10L: 10%
 * 10L - 12L: 15%
 * 12L - 15L: 20%
 * 15L+: 30%
 * + 4% Health & Education Cess
 * Standard Deduction: ₹75,000
 */
function calculateNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 300000) return 0;

  let tax = 0;
  const slabs: [number, number, number][] = [
    [300000, 700000, 0.05],
    [700000, 1000000, 0.10],
    [1000000, 1200000, 0.15],
    [1200000, 1500000, 0.20],
    [1500000, Infinity, 0.30],
  ];

  for (const [lower, upper, rate] of slabs) {
    if (taxableIncome <= lower) break;
    const taxableInSlab = Math.min(taxableIncome, upper) - lower;
    if (taxableInSlab > 0) {
      tax += taxableInSlab * rate;
    }
  }

  // 4% Health and Education Cess
  tax = tax * 1.04;
  return tax;
}

const IncomeTaxCalculator = React.memo(function IncomeTaxCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'income-tax-calculator',
    t('calculators.incomeTax.title'),
  );

  const [grossIncome, setGrossIncome] = useState('');
  const [deduction80C, setDeduction80C] = useState('');
  const [deduction80D, setDeduction80D] = useState('');
  const [hraExemption, setHraExemption] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [result, setResult] = useState<IncomeTaxResult | null>(null);

  const calculate = useCallback(() => {
    const gross = parseFloat(grossIncome);
    if (!gross || gross <= 0) return;

    const ded80C = parseFloat(deduction80C) || 0;
    const ded80D = parseFloat(deduction80D) || 0;
    const hra = parseFloat(hraExemption) || 0;
    const other = parseFloat(otherDeductions) || 0;

    // Old Regime: standard deduction ₹50,000 + all deductions
    const oldTaxableIncome = Math.max(
      gross - 50000 - ded80C - ded80D - hra - other,
      0,
    );
    const oldRegimeTax = calculateOldRegimeTax(oldTaxableIncome);

    // New Regime: standard deduction ₹75,000, no other deductions
    const newTaxableIncome = Math.max(gross - 75000, 0);
    const newRegimeTax = calculateNewRegimeTax(newTaxableIncome);

    const betterRegime: 'old' | 'new' =
      oldRegimeTax <= newRegimeTax ? 'old' : 'new';
    const savings = Math.abs(oldRegimeTax - newRegimeTax);

    const res: IncomeTaxResult = {
      oldRegimeTax,
      newRegimeTax,
      oldTaxableIncome,
      newTaxableIncome,
      savings,
      betterRegime,
    };

    setResult(res);

    saveToHistory(
      {
        grossIncome: gross,
        deduction80C: ded80C,
        deduction80D: ded80D,
        hraExemption: hra,
        otherDeductions: other,
      },
      { oldRegimeTax, newRegimeTax, savings, betterRegime },
      `Income ${formatCurrency(gross)} → ${betterRegime === 'old' ? 'Old' : 'New'} Regime saves ${formatCurrency(savings)}`,
    );
  }, [grossIncome, deduction80C, deduction80D, hraExemption, otherDeductions, saveToHistory]);

  const reset = useCallback(() => {
    setGrossIncome('');
    setDeduction80C('');
    setDeduction80D('');
    setHraExemption('');
    setOtherDeductions('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.incomeTax.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.incomeTax.grossIncome')}
        value={grossIncome}
        onChangeText={setGrossIncome}
        placeholder="1200000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.incomeTax.deduction80C')}
        value={deduction80C}
        onChangeText={setDeduction80C}
        placeholder="150000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.incomeTax.deduction80D')}
        value={deduction80D}
        onChangeText={setDeduction80D}
        placeholder="25000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.incomeTax.hraExemption')}
        value={hraExemption}
        onChangeText={setHraExemption}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.incomeTax.otherDeductions')}
        value={otherDeductions}
        onChangeText={setOtherDeductions}
        placeholder="50000"
        suffix="₹"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.incomeTax.recommendation')}
            value={
              result.betterRegime === 'old'
                ? t('calculators.incomeTax.oldRegime')
                : t('calculators.incomeTax.newRegime')
            }
            subtitle={`${t('calculators.incomeTax.youSave')}: ${formatCurrency(result.savings)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.incomeTax.oldRegimeBreakdown')}
            items={[
              {
                label: t('calculators.incomeTax.taxableIncome'),
                value: formatCurrency(result.oldTaxableIncome),
              },
              {
                label: t('calculators.incomeTax.taxPayable'),
                value: formatCurrency(result.oldRegimeTax),
                highlight: true,
              },
            ]}
          />

          <ResultBreakdown
            title={t('calculators.incomeTax.newRegimeBreakdown')}
            items={[
              {
                label: t('calculators.incomeTax.taxableIncome'),
                value: formatCurrency(result.newTaxableIncome),
              },
              {
                label: t('calculators.incomeTax.taxPayable'),
                value: formatCurrency(result.newRegimeTax),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default IncomeTaxCalculator;
