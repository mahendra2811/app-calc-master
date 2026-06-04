import React, { useState, useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { CalculatorDropdown } from '@/components/CalculatorDropdown';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';

const BASE_OPTIONS = [
  { label: 'Binary (Base 2)', value: '2' },
  { label: 'Octal (Base 8)', value: '8' },
  { label: 'Decimal (Base 10)', value: '10' },
  { label: 'Hexadecimal (Base 16)', value: '16' },
];

const BASE_LABELS: Record<string, string> = {
  '2': 'Binary',
  '8': 'Octal',
  '10': 'Decimal',
  '16': 'Hexadecimal',
};

const VALID_CHARS: Record<string, RegExp> = {
  '2': /^[01]+$/,
  '8': /^[0-7]+$/,
  '10': /^[0-9]+$/,
  '16': /^[0-9a-fA-F]+$/,
};

interface ConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
  decimalValue: number;
}

const NumberSystemConverter = React.memo(function NumberSystemConverter() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator(
    'number-system-converter',
    'Number System Converter',
  );

  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState('10');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState('');

  // Validate input in real time based on selected base
  const validationError = useMemo(() => {
    if (!input) return '';
    const pattern = VALID_CHARS[fromBase];
    if (!pattern.test(input)) {
      const baseLabel = BASE_LABELS[fromBase];
      switch (fromBase) {
        case '2':
          return `${baseLabel} allows only digits 0 and 1`;
        case '8':
          return `${baseLabel} allows only digits 0-7`;
        case '10':
          return `${baseLabel} allows only digits 0-9`;
        case '16':
          return `${baseLabel} allows only digits 0-9 and letters A-F`;
        default:
          return 'Invalid input for selected base';
      }
    }
    return '';
  }, [input, fromBase]);

  const reset = useCallback(() => {
    setInput('');
    setFromBase('10');
    setResult(null);
    setError('');
  }, []);

  const handleBaseChange = useCallback((newBase: string) => {
    setFromBase(newBase);
    setInput('');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');

    if (!input.trim()) {
      setError('Please enter a number');
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Convert to decimal first
      const base = parseInt(fromBase, 10);
      const decimalValue = parseInt(input, base);

      if (!Number.isFinite(decimalValue) || decimalValue < 0) {
        setError('Invalid number. Please enter a valid non-negative integer.');
        return;
      }

      // Check for numbers that are too large
      if (decimalValue > Number.MAX_SAFE_INTEGER) {
        setError('Number is too large. Please enter a smaller value.');
        return;
      }

      // Convert decimal to all bases
      const binary = decimalValue.toString(2);
      const octal = decimalValue.toString(8);
      const decimal = decimalValue.toString(10);
      const hexadecimal = decimalValue.toString(16).toUpperCase();

      const res: ConversionResult = {
        binary,
        octal,
        decimal,
        hexadecimal,
        decimalValue,
      };

      setResult(res);

      saveToHistory(
        { input, fromBase: BASE_LABELS[fromBase] },
        { binary, octal, decimal, hexadecimal },
        `${input} (${BASE_LABELS[fromBase]}) = ${decimal} (Decimal)`,
      );
    } catch {
      setError('Conversion failed. Please check your input.');
    }
  }, [input, fromBase, validationError, saveToHistory]);

  // Format binary with spaces every 4 digits for readability
  const formatBinary = (bin: string): string => {
    const padded = bin.padStart(Math.ceil(bin.length / 4) * 4, '0');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <CalculatorShell
      title="Number System Converter"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* From Base */}
      <CalculatorDropdown
        label="From Base"
        value={fromBase}
        onValueChange={handleBaseChange}
        options={BASE_OPTIONS}
      />

      {/* Input */}
      <CalculatorInput
        label={`Enter ${BASE_LABELS[fromBase]} Number`}
        value={input}
        onChangeText={(text) => {
          setInput(text.trim());
          setResult(null);
        }}
        placeholder={
          fromBase === '2'
            ? '1010'
            : fromBase === '8'
              ? '12'
              : fromBase === '10'
                ? '10'
                : 'A'
        }
        keyboardType={fromBase === '16' ? 'default' : 'number-pad'}
        error={validationError}
      />

      {/* Error */}
      {error ? (
        <View className="rounded-lg bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {/* Results */}
      {result && !error && (
        <View className="mt-4 gap-4">
          {/* All 4 base results as cards */}
          <ResultCard
            title="Decimal (Base 10)"
            value={result.decimal}
            visible={!!result}
            type="primary"
          />

          <View className="rounded-card border border-border bg-surface p-4">
            <View className="gap-4">
              {/* Binary */}
              <View>
                <Text className="text-xs font-medium text-text-secondary">
                  Binary (Base 2)
                </Text>
                <Text
                  className="mt-1 text-base font-bold text-text"
                  selectable
                >
                  {formatBinary(result.binary)}
                </Text>
              </View>

              {/* Octal */}
              <View>
                <Text className="text-xs font-medium text-text-secondary">
                  Octal (Base 8)
                </Text>
                <Text
                  className="mt-1 text-base font-bold text-text"
                  selectable
                >
                  {result.octal}
                </Text>
              </View>

              {/* Decimal */}
              <View>
                <Text className="text-xs font-medium text-text-secondary">
                  Decimal (Base 10)
                </Text>
                <Text
                  className="mt-1 text-base font-bold text-text"
                  selectable
                >
                  {result.decimal}
                </Text>
              </View>

              {/* Hexadecimal */}
              <View>
                <Text className="text-xs font-medium text-text-secondary">
                  Hexadecimal (Base 16)
                </Text>
                <Text
                  className="mt-1 text-base font-bold text-text"
                  selectable
                >
                  {result.hexadecimal}
                </Text>
              </View>
            </View>
          </View>

          <ResultBreakdown
            title="Conversion Details"
            items={[
              {
                label: 'Input',
                value: `${input} (${BASE_LABELS[fromBase]})`,
              },
              { label: 'Binary', value: result.binary },
              { label: 'Octal', value: result.octal },
              { label: 'Decimal', value: result.decimal, highlight: true },
              { label: 'Hex', value: result.hexadecimal },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default NumberSystemConverter;
