import React, { useState, useCallback, memo } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

const NetWorthCalculator = memo(function NetWorthCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('net-worth', t('calculators.netWorth.name'));

  // Assets
  const [cash, setCash] = useState('');
  const [investments, setInvestments] = useState('');
  const [property, setProperty] = useState('');
  const [otherAssets, setOtherAssets] = useState('');

  // Liabilities
  const [homeLoan, setHomeLoan] = useState('');
  const [carLoan, setCarLoan] = useState('');
  const [personalLoan, setPersonalLoan] = useState('');
  const [creditCard, setCreditCard] = useState('');
  const [otherLiabilities, setOtherLiabilities] = useState('');

  const [result, setResult] = useState<{
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  } | null>(null);

  const handleCalculate = useCallback(() => {
    const cashVal = parseFloat(cash) || 0;
    const investVal = parseFloat(investments) || 0;
    const propVal = parseFloat(property) || 0;
    const otherAVal = parseFloat(otherAssets) || 0;

    const homeVal = parseFloat(homeLoan) || 0;
    const carVal = parseFloat(carLoan) || 0;
    const persVal = parseFloat(personalLoan) || 0;
    const ccVal = parseFloat(creditCard) || 0;
    const otherLVal = parseFloat(otherLiabilities) || 0;

    const totalAssets = cashVal + investVal + propVal + otherAVal;
    const totalLiabilities = homeVal + carVal + persVal + ccVal + otherLVal;
    const netWorth = totalAssets - totalLiabilities;

    const res = { totalAssets, totalLiabilities, netWorth };
    setResult(res);

    saveToHistory(
      { cash: cashVal, investments: investVal, property: propVal, otherAssets: otherAVal, homeLoan: homeVal, carLoan: carVal, personalLoan: persVal, creditCard: ccVal, otherLiabilities: otherLVal },
      res
    );
  }, [cash, investments, property, otherAssets, homeLoan, carLoan, personalLoan, creditCard, otherLiabilities, saveToHistory]);

  const handleReset = useCallback(() => {
    setCash('');
    setInvestments('');
    setProperty('');
    setOtherAssets('');
    setHomeLoan('');
    setCarLoan('');
    setPersonalLoan('');
    setCreditCard('');
    setOtherLiabilities('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.netWorth.name')}
      onCalculate={handleCalculate}
      onReset={handleReset}
    >
      <Text className="text-lg font-semibold text-text mb-2">
        {t('calculators.netWorth.assetsBreakdown')}
      </Text>

      <CalculatorInput
        label={t('calculators.netWorth.cash')}
        value={cash}
        onChangeText={setCash}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.investments')}
        value={investments}
        onChangeText={setInvestments}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.property')}
        value={property}
        onChangeText={setProperty}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.otherAssets')}
        value={otherAssets}
        onChangeText={setOtherAssets}
        placeholder="0"
        suffix="₹"
      />

      <Text className="text-lg font-semibold text-text mb-2 mt-4">
        {t('calculators.netWorth.liabilitiesBreakdown')}
      </Text>

      <CalculatorInput
        label={t('calculators.netWorth.homeLoan')}
        value={homeLoan}
        onChangeText={setHomeLoan}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.carLoan')}
        value={carLoan}
        onChangeText={setCarLoan}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.personalLoan')}
        value={personalLoan}
        onChangeText={setPersonalLoan}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.creditCard')}
        value={creditCard}
        onChangeText={setCreditCard}
        placeholder="0"
        suffix="₹"
      />
      <CalculatorInput
        label={t('calculators.netWorth.otherLiabilities')}
        value={otherLiabilities}
        onChangeText={setOtherLiabilities}
        placeholder="0"
        suffix="₹"
      />

      {result && (
        <View className="mt-4">
          <ResultCard
            title={t('calculators.netWorth.netWorth')}
            value={formatCurrency(result.netWorth)}
            type={result.netWorth >= 0 ? 'success' : 'error'}
            visible={true}
          />
          <ResultBreakdown
            title={t('calc.details')}
            items={[
              { label: t('calculators.netWorth.assets'), value: formatCurrency(result.totalAssets) },
              { label: `  ${t('calculators.netWorth.cash')}`, value: formatCurrency(parseFloat(cash) || 0) },
              { label: `  ${t('calculators.netWorth.investments')}`, value: formatCurrency(parseFloat(investments) || 0) },
              { label: `  ${t('calculators.netWorth.property')}`, value: formatCurrency(parseFloat(property) || 0) },
              { label: `  ${t('calculators.netWorth.otherAssets')}`, value: formatCurrency(parseFloat(otherAssets) || 0) },
              { label: t('calculators.netWorth.liabilities'), value: formatCurrency(result.totalLiabilities) },
              { label: `  ${t('calculators.netWorth.homeLoan')}`, value: formatCurrency(parseFloat(homeLoan) || 0) },
              { label: `  ${t('calculators.netWorth.carLoan')}`, value: formatCurrency(parseFloat(carLoan) || 0) },
              { label: `  ${t('calculators.netWorth.personalLoan')}`, value: formatCurrency(parseFloat(personalLoan) || 0) },
              { label: `  ${t('calculators.netWorth.creditCard')}`, value: formatCurrency(parseFloat(creditCard) || 0) },
              { label: t('calculators.netWorth.netWorth'), value: formatCurrency(result.netWorth), highlight: true },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default NetWorthCalculator;
