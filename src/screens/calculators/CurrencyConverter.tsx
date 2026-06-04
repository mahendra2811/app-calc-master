import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorDropdown } from '@/components/CalculatorDropdown';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversionResult {
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
}

const CurrencyConverter = React.memo(function CurrencyConverter() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'currency-converter',
    t('calculators.currency.title'),
  );

  const currencyOptions = useMemo(
    () => [
      { label: 'INR - Indian Rupee', value: 'INR' },
      { label: 'USD - US Dollar', value: 'USD' },
      { label: 'EUR - Euro', value: 'EUR' },
      { label: 'GBP - British Pound', value: 'GBP' },
      { label: 'JPY - Japanese Yen', value: 'JPY' },
      { label: 'AUD - Australian Dollar', value: 'AUD' },
      { label: 'CAD - Canadian Dollar', value: 'CAD' },
      { label: 'SGD - Singapore Dollar', value: 'SGD' },
      { label: 'AED - UAE Dirham', value: 'AED' },
      { label: 'SAR - Saudi Riyal', value: 'SAR' },
    ],
    [],
  );

  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);

  const calculate = useCallback(() => {
    const amt = parseFloat(amount);
    const rate = parseFloat(exchangeRate);

    if (!amt || !rate || amt <= 0 || rate <= 0) {
      return;
    }

    const convertedAmount = amt * rate;

    const res: ConversionResult = {
      convertedAmount,
      fromCurrency,
      toCurrency,
      exchangeRate: rate,
    };

    setResult(res);

    saveToHistory(
      { amount: amt, fromCurrency, toCurrency, exchangeRate: rate },
      { convertedAmount },
      `${amt} ${fromCurrency} → ${convertedAmount.toFixed(2)} ${toCurrency}`,
    );
  }, [amount, fromCurrency, toCurrency, exchangeRate, saveToHistory]);

  const reset = useCallback(() => {
    setAmount('');
    setFromCurrency('INR');
    setToCurrency('USD');
    setExchangeRate('');
    setResult(null);
  }, []);

  const formatConvertedAmount = (value: number, currency: string): string => {
    return `${currency} ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CalculatorShell
      title={t('calculators.currency.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.currency.amount')}
        value={amount}
        onChangeText={setAmount}
        placeholder="1000"
        keyboardType="numeric"
      />

      <CalculatorDropdown
        label={t('calculators.currency.fromCurrency')}
        value={fromCurrency}
        onValueChange={setFromCurrency}
        options={currencyOptions}
      />

      <CalculatorDropdown
        label={t('calculators.currency.toCurrency')}
        value={toCurrency}
        onValueChange={setToCurrency}
        options={currencyOptions}
      />

      <CalculatorInput
        label={t('calculators.currency.exchangeRate')}
        value={exchangeRate}
        onChangeText={setExchangeRate}
        placeholder={`1 ${fromCurrency} = ? ${toCurrency}`}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.currency.convertedAmount')}
            value={formatConvertedAmount(result.convertedAmount, result.toCurrency)}
            subtitle={`1 ${result.fromCurrency} = ${result.exchangeRate} ${result.toCurrency}`}
            type="primary"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.currency.breakdown')}
            items={[
              {
                label: t('calculators.currency.originalAmount'),
                value: `${result.fromCurrency} ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
              {
                label: t('calculators.currency.exchangeRate'),
                value: `${result.exchangeRate}`,
              },
              {
                label: t('calculators.currency.convertedAmount'),
                value: formatConvertedAmount(result.convertedAmount, result.toCurrency),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default CurrencyConverter;
