import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface GratuityResult {
  gratuityAmount: number;
  lastSalary: number;
  yearsOfService: number;
}

const GratuityCalculator = React.memo(function GratuityCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'gratuity-calculator',
    t('calculators.gratuity.title'),
  );

  const [lastSalary, setLastSalary] = useState('');
  const [yearsOfService, setYearsOfService] = useState('');
  const [result, setResult] = useState<GratuityResult | null>(null);

  const calculate = useCallback(() => {
    const salary = parseFloat(lastSalary);
    const years = parseFloat(yearsOfService);

    if (!salary || !years || salary <= 0 || years <= 0) {
      return;
    }

    // Gratuity = (Last Drawn Salary × 15 × Years of Service) / 26
    // As per Payment of Gratuity Act (15/26 formula)
    const gratuityAmount = (salary * 15 * years) / 26;

    const res: GratuityResult = {
      gratuityAmount,
      lastSalary: salary,
      yearsOfService: years,
    };

    setResult(res);

    saveToHistory(
      { lastSalary: salary, yearsOfService: years },
      { gratuityAmount },
      `Salary ${formatCurrency(salary)} × ${years} yrs → Gratuity ${formatCurrency(gratuityAmount)}`,
    );
  }, [lastSalary, yearsOfService, saveToHistory]);

  const reset = useCallback(() => {
    setLastSalary('');
    setYearsOfService('');
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.gratuity.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.gratuity.lastSalary')}
        value={lastSalary}
        onChangeText={setLastSalary}
        placeholder="50000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.gratuity.yearsOfService')}
        value={yearsOfService}
        onChangeText={setYearsOfService}
        placeholder="10"
        suffix={t('calculators.gratuity.years')}
        keyboardType="numeric"
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.gratuity.gratuityAmount')}
            value={formatCurrency(result.gratuityAmount)}
            subtitle={t('calculators.gratuity.asPerAct')}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.gratuity.breakdown')}
            items={[
              {
                label: t('calculators.gratuity.lastSalary'),
                value: formatCurrency(result.lastSalary),
              },
              {
                label: t('calculators.gratuity.yearsOfService'),
                value: `${result.yearsOfService}`,
              },
              {
                label: t('calculators.gratuity.formula'),
                value: `(${formatCurrency(result.lastSalary)} × 15 × ${result.yearsOfService}) / 26`,
              },
              {
                label: t('calculators.gratuity.gratuityAmount'),
                value: formatCurrency(result.gratuityAmount),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default GratuityCalculator;
