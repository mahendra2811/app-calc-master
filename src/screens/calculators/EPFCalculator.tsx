import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface EPFResult {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  totalInterest: number;
  maturityAmount: number;
}

const EPF_INTEREST_RATE = 8.15; // FY 2024-25

const EPFCalculator = React.memo(function EPFCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'epf-calculator',
    t('calculators.epf.title'),
  );

  const [basicDA, setBasicDA] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('58');
  const [currentBalance, setCurrentBalance] = useState('');
  const [result, setResult] = useState<EPFResult | null>(null);

  const calculate = useCallback(() => {
    const basic = parseFloat(basicDA);
    const age = parseFloat(currentAge);
    const retAge = parseFloat(retirementAge);
    const balance = parseFloat(currentBalance) || 0;

    if (
      !basic || !age || !retAge ||
      basic <= 0 || age <= 0 || retAge <= age
    ) {
      return;
    }

    const yearsToRetire = retAge - age;
    const totalMonths = yearsToRetire * 12;

    // Employee contribution = 12% of Basic + DA
    const employeeMonthly = basic * 0.12;

    // Employer contribution to EPF = 3.67% of Basic + DA
    // (remaining 8.33% goes to EPS)
    const employerMonthly = basic * 0.0367;

    // Total monthly contribution to EPF
    const totalMonthly = employeeMonthly + employerMonthly;

    // Monthly interest rate
    const monthlyRate = EPF_INTEREST_RATE / 12 / 100;

    // Month-by-month calculation
    let runningBalance = balance;
    let totalEmployeeContrib = 0;
    let totalEmployerContrib = 0;

    for (let month = 1; month <= totalMonths; month++) {
      // Add contributions at the start of each month
      runningBalance += totalMonthly;
      totalEmployeeContrib += employeeMonthly;
      totalEmployerContrib += employerMonthly;

      // Apply monthly interest
      runningBalance *= (1 + monthlyRate);
    }

    const totalContribution = totalEmployeeContrib + totalEmployerContrib + balance;
    const totalInterest = runningBalance - totalContribution;

    const res: EPFResult = {
      employeeContribution: totalEmployeeContrib,
      employerContribution: totalEmployerContrib,
      totalContribution,
      totalInterest,
      maturityAmount: runningBalance,
    };

    setResult(res);

    saveToHistory(
      {
        basicDA: basic,
        currentAge: age,
        retirementAge: retAge,
        currentBalance: balance,
      },
      {
        employeeContribution: totalEmployeeContrib,
        employerContribution: totalEmployerContrib,
        maturityAmount: runningBalance,
      },
      `EPF Basic ${formatCurrency(basic)} → Maturity ${formatCurrency(runningBalance)}`,
    );
  }, [basicDA, currentAge, retirementAge, currentBalance, saveToHistory]);

  const reset = useCallback(() => {
    setBasicDA('');
    setCurrentAge('');
    setRetirementAge('58');
    setCurrentBalance('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.epf.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.epf.basicDA')}
        value={basicDA}
        onChangeText={setBasicDA}
        placeholder="30000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.epf.currentAge')}
        value={currentAge}
        onChangeText={setCurrentAge}
        placeholder="25"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.epf.retirementAge')}
        value={retirementAge}
        onChangeText={setRetirementAge}
        placeholder="58"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.epf.currentBalance')}
        value={currentBalance}
        onChangeText={setCurrentBalance}
        placeholder="100000"
        suffix="₹"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.epf.maturityAmount')}
            value={formatCurrency(result.maturityAmount)}
            subtitle={`${t('calculators.epf.interestRate')}: ${EPF_INTEREST_RATE}%`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.epf.breakdown')}
            items={[
              {
                label: t('calculators.epf.employeeContribution'),
                value: formatCurrency(result.employeeContribution),
              },
              {
                label: t('calculators.epf.employerContribution'),
                value: formatCurrency(result.employerContribution),
              },
              {
                label: t('calculators.epf.totalContribution'),
                value: formatCurrency(result.totalContribution),
              },
              {
                label: t('calculators.epf.totalInterest'),
                value: formatCurrency(result.totalInterest),
              },
              {
                label: t('calculators.epf.maturityAmount'),
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

export default EPFCalculator;
