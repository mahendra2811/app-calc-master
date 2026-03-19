import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorInput } from '@/components/CalculatorInput';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { roundTo } from '@/utils/math-helpers';
import { formatIndianNumber } from '@/utils/format-number';

interface QuadraticResult {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  nature: string;
  root1: string;
  root2: string;
  equation: string;
}

/** Format the equation ax^2 + bx + c = 0 for display. */
function formatEquation(a: number, b: number, c: number): string {
  let eq = '';

  // ax^2 term
  if (a === 1) eq += 'x\u00b2';
  else if (a === -1) eq += '-x\u00b2';
  else eq += `${a}x\u00b2`;

  // bx term
  if (b !== 0) {
    if (b > 0) eq += ' + ';
    else eq += ' - ';
    const absB = Math.abs(b);
    if (absB === 1) eq += 'x';
    else eq += `${absB}x`;
  }

  // c term
  if (c !== 0) {
    if (c > 0) eq += ` + ${c}`;
    else eq += ` - ${Math.abs(c)}`;
  }

  eq += ' = 0';
  return eq;
}

const QuadraticSolver = React.memo(function QuadraticSolver() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('quadratic-solver', 'Quadratic Solver');

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [inputC, setInputC] = useState('');
  const [result, setResult] = useState<QuadraticResult | null>(null);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setInputA('');
    setInputB('');
    setInputC('');
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback(() => {
    setError('');
    setResult(null);

    const a = Number(inputA);
    const b = Number(inputB);
    const c = Number(inputC);

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) {
      setError('Please enter valid numbers for all coefficients');
      return;
    }

    if (a === 0) {
      setError('Coefficient "a" cannot be zero (equation would not be quadratic)');
      return;
    }

    const discriminant = b * b - 4 * a * c;
    const equation = formatEquation(a, b, c);

    let nature: string;
    let root1: string;
    let root2: string;

    if (discriminant > 0) {
      // Two distinct real roots
      nature = 'Two distinct real roots';
      const sqrtD = Math.sqrt(discriminant);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);
      root1 = String(roundTo(r1, 6));
      root2 = String(roundTo(r2, 6));
    } else if (discriminant === 0) {
      // One repeated real root
      nature = 'One repeated real root';
      const r = -b / (2 * a);
      root1 = String(roundTo(r, 6));
      root2 = root1;
    } else {
      // Complex roots: (-b +/- i*sqrt(|D|)) / (2a)
      nature = 'Two complex conjugate roots';
      const realPart = roundTo(-b / (2 * a), 6);
      const imagPart = roundTo(Math.sqrt(Math.abs(discriminant)) / (2 * a), 6);
      const absImag = Math.abs(imagPart);

      if (realPart === 0) {
        root1 = `${absImag}i`;
        root2 = `-${absImag}i`;
      } else {
        root1 = `${realPart} + ${absImag}i`;
        root2 = `${realPart} - ${absImag}i`;
      }
    }

    const res: QuadraticResult = {
      a,
      b,
      c,
      discriminant: roundTo(discriminant, 6),
      nature,
      root1,
      root2,
      equation,
    };

    setResult(res);

    saveToHistory(
      { a, b, c },
      { discriminant: res.discriminant, root1, root2, nature },
      `${equation} => ${root1}${root1 !== root2 ? `, ${root2}` : ''}`,
    );
  }, [inputA, inputB, inputC, saveToHistory]);

  return (
    <CalculatorShell
      title="Quadratic Solver"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Info */}
      <View className="rounded-card border border-border bg-surface p-4">
        <Text className="text-center text-base font-semibold text-text">
          ax{'\u00b2'} + bx + c = 0
        </Text>
      </View>

      {/* Inputs */}
      <CalculatorInput
        label="Coefficient a"
        value={inputA}
        onChangeText={setInputA}
        placeholder="Enter value of a"
        keyboardType="numeric"
      />
      <CalculatorInput
        label="Coefficient b"
        value={inputB}
        onChangeText={setInputB}
        placeholder="Enter value of b"
        keyboardType="numeric"
      />
      <CalculatorInput
        label="Coefficient c"
        value={inputC}
        onChangeText={setInputC}
        placeholder="Enter value of c"
        keyboardType="numeric"
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
          {/* Equation display */}
          <View className="rounded-card border border-border bg-surface-elevated p-4">
            <Text className="text-center text-lg font-bold text-primary">
              {result.equation}
            </Text>
          </View>

          <ResultCard
            title="Root 1"
            value={result.root1}
            subtitle={result.nature}
            type={result.discriminant >= 0 ? 'success' : 'primary'}
            visible={!!result}
          />

          {result.root1 !== result.root2 && (
            <ResultCard
              title="Root 2"
              value={result.root2}
              type={result.discriminant >= 0 ? 'success' : 'primary'}
              visible={!!result}
            />
          )}

          <ResultBreakdown
            title="Details"
            items={[
              { label: 'Equation', value: result.equation },
              { label: 'Coefficient a', value: String(result.a) },
              { label: 'Coefficient b', value: String(result.b) },
              { label: 'Coefficient c', value: String(result.c) },
              {
                label: 'Discriminant (b\u00b2 - 4ac)',
                value: String(result.discriminant),
                highlight: true,
              },
              {
                label: 'Nature of Roots',
                value: result.nature,
                highlight: true,
              },
              { label: 'Root 1', value: result.root1 },
              { label: 'Root 2', value: result.root2 },
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default QuadraticSolver;
