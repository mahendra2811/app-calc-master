import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface SalaryResult {
  basic: number;
  hra: number;
  epfEmployee: number;
  epfEmployer: number;
  professionalTax: number;
  specialAllowance: number;
  grossSalary: number;
  totalDeductions: number;
  incomeTax: number;
  yearlyInHand: number;
  monthlyInHand: number;
}

/**
 * Simplified Indian income tax calculation (New Regime FY 2024-25 slabs).
 * 0 - 3L: Nil
 * 3L - 7L: 5%
 * 7L - 10L: 10%
 * 10L - 12L: 15%
 * 12L - 15L: 20%
 * 15L+: 30%
 */
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 300000) return 0;

  let tax = 0;
  const slabs: [number, number, number][] = [
    [300000, 700000, 0.05],
    [700000, 1000000, 0.10],
    [1000000, 1200000, 0.15],
    [1200000, 1500000, 0.20],
    [1500000, Infinity, 0.30],
  ];

  let remaining = taxableIncome;
  let prevLimit = 300000;

  for (const [lower, upper, rate] of slabs) {
    if (remaining <= lower) break;
    const taxableInSlab = Math.min(remaining, upper) - prevLimit;
    if (taxableInSlab > 0) {
      tax += taxableInSlab * rate;
    }
    prevLimit = upper;
    if (remaining <= upper) break;
  }

  // Add 4% Health and Education Cess
  tax = tax * 1.04;

  return tax;
}

const SalaryCalculator = React.memo(function SalaryCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'salary-calculator',
    t('calculators.salary.title'),
  );

  const [annualCTC, setAnnualCTC] = useState('');
  const [basicPercent, setBasicPercent] = useState('40');
  const [result, setResult] = useState<SalaryResult | null>(null);

  const calculate = useCallback(() => {
    const ctc = parseFloat(annualCTC);
    const basicPct = parseFloat(basicPercent);

    if (!ctc || ctc <= 0 || !basicPct || basicPct <= 0 || basicPct > 100) {
      return;
    }

    // Basic Salary
    const basic = (ctc * basicPct) / 100;

    // HRA = Basic × 50% (metro assumption)
    const hra = basic * 0.5;

    // EPF: Employee contributes 12% of Basic
    const epfEmployee = basic * 0.12;

    // EPF: Employer also contributes 12% of Basic (part of CTC)
    const epfEmployer = basic * 0.12;

    // Professional Tax = ₹2,400/year
    const professionalTax = 2400;

    // Special Allowance = CTC - Basic - HRA - Employer EPF
    const specialAllowance = ctc - basic - hra - epfEmployer;

    // Gross Salary = Basic + HRA + Special Allowance
    const grossSalary = basic + hra + Math.max(specialAllowance, 0);

    // Taxable income (simplified: gross - standard deduction of ₹75,000)
    const standardDeduction = 75000;
    const taxableIncome = Math.max(grossSalary - standardDeduction, 0);

    // Income Tax
    const incomeTax = calculateIncomeTax(taxableIncome);

    // Total deductions from employee side
    const totalDeductions = epfEmployee + professionalTax + incomeTax;

    // Yearly In-Hand = Gross Salary - Total Deductions
    const yearlyInHand = grossSalary - totalDeductions;

    // Monthly In-Hand
    const monthlyInHand = yearlyInHand / 12;

    const res: SalaryResult = {
      basic,
      hra,
      epfEmployee,
      epfEmployer,
      professionalTax,
      specialAllowance: Math.max(specialAllowance, 0),
      grossSalary,
      totalDeductions,
      incomeTax,
      yearlyInHand,
      monthlyInHand,
    };

    setResult(res);

    saveToHistory(
      { annualCTC: ctc, basicPercent: basicPct },
      { monthlyInHand, yearlyInHand },
      `CTC ${formatCurrency(ctc)} → Monthly ${formatCurrency(monthlyInHand)}`,
    );
  }, [annualCTC, basicPercent, saveToHistory]);

  const reset = useCallback(() => {
    setAnnualCTC('');
    setBasicPercent('40');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.salary.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.salary.annualCTC')}
        value={annualCTC}
        onChangeText={setAnnualCTC}
        placeholder="1200000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.salary.basicPercent')}
        value={basicPercent}
        onChangeText={setBasicPercent}
        placeholder="40"
        suffix="%"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.salary.monthlyInHand')}
            value={formatCurrency(result.monthlyInHand)}
            subtitle={`${t('calculators.salary.yearlyInHand')}: ${formatCurrency(result.yearlyInHand)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.salary.earningsBreakdown')}
            items={[
              {
                label: t('calculators.salary.basicSalary'),
                value: formatCurrency(result.basic),
              },
              {
                label: t('calculators.salary.hra'),
                value: formatCurrency(result.hra),
              },
              {
                label: t('calculators.salary.specialAllowance'),
                value: formatCurrency(result.specialAllowance),
              },
              {
                label: t('calculators.salary.grossSalary'),
                value: formatCurrency(result.grossSalary),
                highlight: true,
              },
            ]}
          />

          <ResultBreakdown
            title={t('calculators.salary.deductionsBreakdown')}
            items={[
              {
                label: t('calculators.salary.epfEmployee'),
                value: formatCurrency(result.epfEmployee),
              },
              {
                label: t('calculators.salary.professionalTax'),
                value: formatCurrency(result.professionalTax),
              },
              {
                label: t('calculators.salary.incomeTax'),
                value: formatCurrency(result.incomeTax),
              },
              {
                label: t('calculators.salary.totalDeductions'),
                value: formatCurrency(result.totalDeductions),
                highlight: true,
              },
            ]}
          />

          <ResultBreakdown
            title={t('calculators.salary.employerContribution')}
            items={[
              {
                label: t('calculators.salary.epfEmployer'),
                value: formatCurrency(result.epfEmployer),
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default SalaryCalculator;
