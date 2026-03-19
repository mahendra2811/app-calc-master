import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface HomeLoanVsRentResult {
  monthlyEMI: number;
  totalEMIPaid: number;
  totalInterestPaid: number;
  totalHomeCost: number;
  propertyValueAtEnd: number;
  netBuyCost: number;
  totalRentPaid: number;
  recommendation: 'buy' | 'rent';
}

const HomeLoanVsRent = React.memo(function HomeLoanVsRent() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'home-loan-vs-rent',
    t('calculators.homeLoanVsRent.title'),
  );

  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [loanRate, setLoanRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [annualRentIncrease, setAnnualRentIncrease] = useState('');
  const [propertyAppreciation, setPropertyAppreciation] = useState('');
  const [result, setResult] = useState<HomeLoanVsRentResult | null>(null);

  const calculate = useCallback(() => {
    const price = parseFloat(homePrice);
    const down = parseFloat(downPayment);
    const rate = parseFloat(loanRate);
    const years = parseFloat(loanTenure);
    const rent = parseFloat(monthlyRent);
    const rentIncrease = parseFloat(annualRentIncrease);
    const appreciation = parseFloat(propertyAppreciation);

    if (
      !price || !down || !rate || !years || !rent || !rentIncrease || !appreciation ||
      price <= 0 || down < 0 || rate <= 0 || years <= 0 || rent <= 0 ||
      rentIncrease < 0 || appreciation < 0 || down >= price
    ) {
      return;
    }

    // Loan calculations
    const loanAmount = price - down;
    const r = rate / 12 / 100;
    const n = years * 12;

    // EMI = P × r × (1+r)^n / [(1+r)^n - 1]
    const compoundFactor = Math.pow(1 + r, n);
    const monthlyEMI = (loanAmount * r * compoundFactor) / (compoundFactor - 1);
    const totalEMIPaid = monthlyEMI * n;
    const totalInterestPaid = totalEMIPaid - loanAmount;

    // Total cost of buying = Down Payment + Total EMIs paid
    const totalHomeCost = down + totalEMIPaid;

    // Property value at the end
    const propertyValueAtEnd = price * Math.pow(1 + appreciation / 100, years);

    // Net buy cost = total paid - final property value
    const netBuyCost = totalHomeCost - propertyValueAtEnd;

    // Total rent over the same period with annual increase
    let totalRentPaid = 0;
    let currentRent = rent;
    for (let year = 0; year < years; year++) {
      totalRentPaid += currentRent * 12;
      currentRent *= (1 + rentIncrease / 100);
    }

    // Recommendation: buy if net buy cost < total rent (i.e., buying is cheaper long-term)
    const recommendation: 'buy' | 'rent' =
      netBuyCost < totalRentPaid ? 'buy' : 'rent';

    const res: HomeLoanVsRentResult = {
      monthlyEMI,
      totalEMIPaid,
      totalInterestPaid,
      totalHomeCost,
      propertyValueAtEnd,
      netBuyCost,
      totalRentPaid,
      recommendation,
    };

    setResult(res);

    saveToHistory(
      {
        homePrice: price,
        downPayment: down,
        loanRate: rate,
        loanTenure: years,
        monthlyRent: rent,
        annualRentIncrease: rentIncrease,
        propertyAppreciation: appreciation,
      },
      { monthlyEMI, totalRentPaid, netBuyCost, recommendation },
      `${recommendation === 'buy' ? 'Buy' : 'Rent'} is better | Net Buy: ${formatCurrency(netBuyCost)} vs Rent: ${formatCurrency(totalRentPaid)}`,
    );
  }, [homePrice, downPayment, loanRate, loanTenure, monthlyRent, annualRentIncrease, propertyAppreciation, saveToHistory]);

  const reset = useCallback(() => {
    setHomePrice('');
    setDownPayment('');
    setLoanRate('');
    setLoanTenure('');
    setMonthlyRent('');
    setAnnualRentIncrease('');
    setPropertyAppreciation('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.homeLoanVsRent.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.homeLoanVsRent.homePrice')}
        value={homePrice}
        onChangeText={setHomePrice}
        placeholder="5000000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.homeLoanVsRent.downPayment')}
        value={downPayment}
        onChangeText={setDownPayment}
        placeholder="1000000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.homeLoanVsRent.loanRate')}
        value={loanRate}
        onChangeText={setLoanRate}
        placeholder="8.5"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.homeLoanVsRent.loanTenure')}
        value={loanTenure}
        onChangeText={setLoanTenure}
        placeholder="20"
        suffix={t('calculators.homeLoanVsRent.years')}
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.homeLoanVsRent.monthlyRent')}
        value={monthlyRent}
        onChangeText={setMonthlyRent}
        placeholder="20000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.homeLoanVsRent.annualRentIncrease')}
        value={annualRentIncrease}
        onChangeText={setAnnualRentIncrease}
        placeholder="5"
        suffix="%"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.homeLoanVsRent.propertyAppreciation')}
        value={propertyAppreciation}
        onChangeText={setPropertyAppreciation}
        placeholder="6"
        suffix="%"
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.homeLoanVsRent.recommendation')}
            value={
              result.recommendation === 'buy'
                ? t('calculators.homeLoanVsRent.buyIsBetter')
                : t('calculators.homeLoanVsRent.rentIsBetter')
            }
            subtitle={`EMI: ${formatCurrency(result.monthlyEMI)}`}
            type={result.recommendation === 'buy' ? 'success' : 'primary'}
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.homeLoanVsRent.buyingBreakdown')}
            items={[
              {
                label: t('calculators.homeLoanVsRent.monthlyEMI'),
                value: formatCurrency(result.monthlyEMI),
              },
              {
                label: t('calculators.homeLoanVsRent.totalEMIPaid'),
                value: formatCurrency(result.totalEMIPaid),
              },
              {
                label: t('calculators.homeLoanVsRent.totalInterest'),
                value: formatCurrency(result.totalInterestPaid),
              },
              {
                label: t('calculators.homeLoanVsRent.totalHomeCost'),
                value: formatCurrency(result.totalHomeCost),
              },
              {
                label: t('calculators.homeLoanVsRent.propertyValueAtEnd'),
                value: formatCurrency(result.propertyValueAtEnd),
              },
              {
                label: t('calculators.homeLoanVsRent.netBuyCost'),
                value: formatCurrency(result.netBuyCost),
                highlight: true,
              },
            ]}
          />

          <ResultBreakdown
            title={t('calculators.homeLoanVsRent.rentingBreakdown')}
            items={[
              {
                label: t('calculators.homeLoanVsRent.totalRentPaid'),
                value: formatCurrency(result.totalRentPaid),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default HomeLoanVsRent;
