import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { ResultCard } from '@/components/ResultCard';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { roundTo } from '@/utils/math-helpers';

// ── Token types for safe expression parsing ──────────────────────────
type TokenKind = 'number' | 'operator';
interface Token {
  kind: TokenKind;
  value: string;
}

/** Tokenise a display expression string into numbers and operators */
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if ('+-*/'.includes(ch)) {
      // Handle negative numbers at start or after another operator
      if (
        ch === '-' &&
        (tokens.length === 0 || tokens[tokens.length - 1].kind === 'operator')
      ) {
        let num = '-';
        i++;
        while (i < expr.length && (isDigitOrDot(expr[i]))) {
          num += expr[i];
          i++;
        }
        if (num !== '-') {
          tokens.push({ kind: 'number', value: num });
        }
      } else {
        tokens.push({ kind: 'operator', value: ch });
        i++;
      }
    } else if (isDigitOrDot(ch)) {
      let num = '';
      while (i < expr.length && isDigitOrDot(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ kind: 'number', value: num });
    } else {
      i++;
    }
  }
  return tokens;
}

function isDigitOrDot(ch: string): boolean {
  return (ch >= '0' && ch <= '9') || ch === '.';
}

/**
 * Safe expression evaluator using operator-precedence parsing.
 * Handles +, -, *, / with correct precedence (no eval()).
 */
function safeEvaluate(expression: string): number | null {
  try {
    // Replace display characters with standard operators
    const normalised = expression.replace(/\u00d7/g, '*').replace(/\u00f7/g, '/');
    const tokens = tokenize(normalised);
    if (tokens.length === 0) return null;

    // Parse into numbers and operators arrays
    const numbers: number[] = [];
    const operators: string[] = [];
    for (const token of tokens) {
      if (token.kind === 'number') {
        const n = parseFloat(token.value);
        if (!Number.isFinite(n)) return null;
        numbers.push(n);
      } else {
        operators.push(token.value);
      }
    }

    if (numbers.length === 0) return null;
    if (numbers.length !== operators.length + 1) return null;

    // First pass: handle * and /
    const nums2: number[] = [numbers[0]];
    const ops2: string[] = [];
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === '*' || operators[i] === '/') {
        const left = nums2.pop()!;
        const right = numbers[i + 1];
        if (operators[i] === '/' && right === 0) return null;
        nums2.push(operators[i] === '*' ? left * right : left / right);
      } else {
        ops2.push(operators[i]);
        nums2.push(numbers[i + 1]);
      }
    }

    // Second pass: handle + and -
    let result = nums2[0];
    for (let i = 0; i < ops2.length; i++) {
      if (ops2[i] === '+') {
        result += nums2[i + 1];
      } else {
        result -= nums2[i + 1];
      }
    }

    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

// ── Button definitions ───────────────────────────────────────────────
interface CalcButton {
  label: string;
  type: 'number' | 'operator' | 'equal' | 'clear' | 'action';
  action: string;
}

const BUTTONS: CalcButton[][] = [
  [
    { label: 'C', type: 'clear', action: 'clear' },
    { label: '\u232B', type: 'action', action: 'backspace' },
    { label: '%', type: 'operator', action: 'percent' },
    { label: '\u00f7', type: 'operator', action: '\u00f7' },
  ],
  [
    { label: '7', type: 'number', action: '7' },
    { label: '8', type: 'number', action: '8' },
    { label: '9', type: 'number', action: '9' },
    { label: '\u00d7', type: 'operator', action: '\u00d7' },
  ],
  [
    { label: '4', type: 'number', action: '4' },
    { label: '5', type: 'number', action: '5' },
    { label: '6', type: 'number', action: '6' },
    { label: '-', type: 'operator', action: '-' },
  ],
  [
    { label: '1', type: 'number', action: '1' },
    { label: '2', type: 'number', action: '2' },
    { label: '3', type: 'number', action: '3' },
    { label: '+', type: 'operator', action: '+' },
  ],
  [
    { label: '\u00b1', type: 'action', action: 'negate' },
    { label: '0', type: 'number', action: '0' },
    { label: '.', type: 'number', action: '.' },
    { label: '=', type: 'equal', action: 'equals' },
  ],
];

function getButtonClassName(type: CalcButton['type']): string {
  switch (type) {
    case 'number':
      return 'bg-surface-elevated border border-border';
    case 'operator':
      return 'bg-primary/20 border border-primary/30';
    case 'equal':
      return 'bg-primary';
    case 'clear':
      return 'bg-error/20 border border-error/30';
    case 'action':
      return 'bg-surface-elevated border border-border';
  }
}

function getButtonTextClassName(type: CalcButton['type']): string {
  switch (type) {
    case 'number':
      return 'text-text';
    case 'operator':
      return 'text-primary';
    case 'equal':
      return 'text-white';
    case 'clear':
      return 'text-error';
    case 'action':
      return 'text-text-secondary';
  }
}

// ── Component ────────────────────────────────────────────────────────
const BasicCalculator = React.memo(function BasicCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('basic-calculator', 'Basic Calculator');

  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Live preview: evaluate current expression as user types
  const preview = useMemo(() => {
    if (!expression) return '';
    const result = safeEvaluate(expression);
    if (result === null) return '';
    return String(roundTo(result, 10));
  }, [expression]);

  const handlePress = useCallback(
    (btn: CalcButton) => {
      switch (btn.action) {
        case 'clear':
          setExpression('');
          setLastResult(null);
          setHasCalculated(false);
          break;

        case 'backspace':
          setExpression((prev) => prev.slice(0, -1));
          setHasCalculated(false);
          break;

        case 'negate': {
          // Toggle sign of the current number being entered
          setExpression((prev) => {
            if (!prev) return '-';
            // Find the last number segment
            const match = prev.match(/(-?\d*\.?\d*)$/);
            if (match && match[0]) {
              const lastNum = match[0];
              const prefix = prev.slice(0, prev.length - lastNum.length);
              if (lastNum.startsWith('-')) {
                return prefix + lastNum.slice(1);
              }
              return prefix + '-' + lastNum;
            }
            return prev;
          });
          break;
        }

        case 'percent': {
          const result = safeEvaluate(expression);
          if (result !== null) {
            const percentVal = roundTo(result / 100, 10);
            setExpression(String(percentVal));
            setHasCalculated(true);
          }
          break;
        }

        case 'equals': {
          const result = safeEvaluate(expression);
          if (result !== null) {
            const rounded = roundTo(result, 10);
            const resultStr = String(rounded);
            setLastResult(resultStr);

            saveToHistory(
              { expression },
              { result: rounded },
              `${expression} = ${resultStr}`,
            );

            setExpression(resultStr);
            setHasCalculated(true);
          }
          break;
        }

        default: {
          // Number or operator input
          const isOperator = ['+', '-', '\u00d7', '\u00f7'].includes(btn.action);

          if (hasCalculated && !isOperator) {
            // If user presses a number after =, start fresh
            setExpression(btn.action);
            setHasCalculated(false);
          } else {
            // Prevent double operators
            if (isOperator && expression) {
              const lastChar = expression[expression.length - 1];
              if (['+', '-', '\u00d7', '\u00f7'].includes(lastChar)) {
                setExpression((prev) => prev.slice(0, -1) + btn.action);
                return;
              }
            }
            // Prevent multiple dots in the same number
            if (btn.action === '.') {
              const parts = expression.split(/[+\-\u00d7\u00f7]/);
              const currentNumber = parts[parts.length - 1];
              if (currentNumber.includes('.')) return;
            }

            setExpression((prev) => prev + btn.action);
            setHasCalculated(false);
          }
          break;
        }
      }
    },
    [expression, hasCalculated, saveToHistory],
  );

  return (
    <CalculatorShell title="Basic Calculator">
      {/* Display */}
      <View className="rounded-card border border-border bg-surface-elevated p-5">
        {/* Expression */}
        <Text
          className="text-right text-lg text-text-secondary"
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {expression || '0'}
        </Text>

        {/* Live Preview / Result */}
        <Text
          className="mt-2 text-right text-4xl font-bold text-text"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {hasCalculated && lastResult ? lastResult : preview || '0'}
        </Text>
      </View>

      {/* Button Grid */}
      <View className="mt-4 gap-2">
        {BUTTONS.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-2">
            {row.map((btn) => (
              <Pressable
                key={btn.label}
                onPress={() => handlePress(btn)}
                className={`flex-1 items-center justify-center rounded-xl py-4 ${getButtonClassName(btn.type)}`}
              >
                <Text className={`text-xl font-semibold ${getButtonTextClassName(btn.type)}`}>
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* Last result card */}
      <ResultCard
        title="Result"
        value={lastResult ?? '0'}
        visible={!!lastResult}
        type="success"
      />
    </CalculatorShell>
  );
});

export default BasicCalculator;
