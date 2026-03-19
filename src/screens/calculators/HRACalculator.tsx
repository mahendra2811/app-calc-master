import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorToggle } from '@/components/CalculatorToggle';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/utils/format-number';

interface HRAResult {
  actualHRA: number;
  percentOfBasic: number;
  rentMinusBasic: number;
  exemptHRA: number;
  taxableHRA: number;
}

const HRACalculator = React.memo(function HRACalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'hra-calculator',
    t('calculators.hra.title'),
  );

  const [basicSalary, setBasicSalary] = useState('');
  const [hraReceived, setHraReceived] = useState('');
  const [rentPaid, setRentPaid] = useState('');
  const [isMetro, setIsMetro] = useState(false);
  const [result, setResult] = useState<HRAResult | null>(null);

  const calculate = useCallback(() => {
    const basic = parseFloat(basicSalary);
    const hra = parseFloat(hraReceived);
    const rent = parseFloat(rentPaid);

    if (
      !basic || !hra || !rent ||
      basic <= 0 || hra <= 0 || rent <= 0
    ) {
      return;
    }

    // Annual values for calculation
    const annualBasic = basic * 12;
    const annualHRA = hra * 12;
    const annualRent = rent * 12;

    // HRA exemption = MIN of:
    // 1. Actual HRA received
    const actualHRA = annualHRA;

    // 2. 50% of basic (metro) or 40% of basic (non-metro)
    const percentOfBasic = isMetro
      ? annualBasic * 0.5
      : annualBasic * 0.4;

    // 3. Rent paid - 10% of basic salary
    const rentMinusBasic = Math.max(annualRent - annualBasic * 0.1, 0);

    // Exempt HRA = minimum of the three
    const exemptHRA = Math.min(actualHRA, percentOfBasic, rentMinusBasic);

    // Taxable HRA = HRA received - exempt HRA
    const taxableHRA = annualHRA - exemptHRA;

    const res: HRAResult = {
      actualHRA,
      percentOfBasic,
      rentMinusBasic,
      exemptHRA,
      taxableHRA,
    };

    setResult(res);

    saveToHistory(
      {
        basicSalary: basic,
        hraReceived: hra,
        rentPaid: rent,
        isMetro,
      },
      { exemptHRA, taxableHRA },
      `HRA Exempt: ${formatCurrency(exemptHRA)}, Taxable: ${formatCurrency(taxableHRA)}`,
    );
  }, [basicSalary, hraReceived, rentPaid, isMetro, saveToHistory]);

  const reset = useCallback(() => {
    setBasicSalary('');
    setHraReceived('');
    setRentPaid('');
    setIsMetro(false);
    setResult(null);
  }, []);

  return (
    <CalculatorShell
      title={t('calculators.hra.title')}
      onCalculate={calculate}
      onReset={reset}
    >
      <CalculatorInput
        label={t('calculators.hra.basicSalary')}
        value={basicSalary}
        onChangeText={setBasicSalary}
        placeholder="40000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.hra.hraReceived')}
        value={hraReceived}
        onChangeText={setHraReceived}
        placeholder="20000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorInput
        label={t('calculators.hra.rentPaid')}
        value={rentPaid}
        onChangeText={setRentPaid}
        placeholder="15000"
        suffix="₹"
        keyboardType="numeric"
      />

      <CalculatorToggle
        label={t('calculators.hra.cityType')}
        value={isMetro}
        onValueChange={setIsMetro}
        leftLabel={t('calculators.hra.nonMetro')}
        rightLabel={t('calculators.hra.metro')}
      />

      {result && (
        <View className="mt-4 gap-4">
          <ResultCard
            title={t('calculators.hra.exemptHRA')}
            value={formatCurrency(result.exemptHRA)}
            subtitle={`${t('calculators.hra.taxableHRA')}: ${formatCurrency(result.taxableHRA)}`}
            type="success"
            visible={!!result}
          />

          <ResultBreakdown
            title={t('calculators.hra.calculationDetails')}
            items={[
              {
                label: t('calculators.hra.actualHRAReceived'),
                value: formatCurrency(result.actualHRA),
              },
              {
                label: isMetro
                  ? t('calculators.hra.fiftyPercentBasic')
                  : t('calculators.hra.fortyPercentBasic'),
                value: formatCurrency(result.percentOfBasic),
              },
              {
                label: t('calculators.hra.rentMinusTenPercent'),
                value: formatCurrency(result.rentMinusBasic),
              },
              {
                label: t('calculators.hra.exemptHRA'),
                value: formatCurrency(result.exemptHRA),
                highlight: true,
              },
              {
                label: t('calculators.hra.taxableHRA'),
                value: formatCurrency(result.taxableHRA),
                highlight: true,
              },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default HRACalculator;
