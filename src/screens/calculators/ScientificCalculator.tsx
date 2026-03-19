import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { ResultCard } from '@/components/ResultCard';
import { CalculatorToggle } from '@/components/CalculatorToggle';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { factorial, roundTo } from '@/utils/math-helpers';

// ── Safe Scientific Expression Evaluator ─────────────────────────────

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Recursive-descent parser for scientific expressions.
 * Supports: +, -, *, /, ^, !, sin, cos, tan, asin, acos, atan,
 *           log, ln, sqrt (√), abs, π, e, parentheses.
 */
class ExprParser {
  private pos = 0;
  private expr: string;
  private useDeg: boolean;

  constructor(expression: string, useDeg: boolean) {
    // Normalise display symbols to parseable tokens
    this.expr = expression
      .replace(/\u00d7/g, '*')
      .replace(/\u00f7/g, '/')
      .replace(/\u221a/g, 'sqrt')
      .replace(/\u03c0/g, 'PI')
      .replace(/x\u00b2/g, '^2')
      .replace(/x\u00b3/g, '^3')
      .replace(/\s+/g, '');
    this.useDeg = useDeg;
  }

  parse(): number {
    const result = this.parseAddSub();
    if (this.pos < this.expr.length) {
      throw new Error('Unexpected character: ' + this.expr[this.pos]);
    }
    return result;
  }

  private peek(): string {
    return this.expr[this.pos] ?? '';
  }

  private consume(ch: string): void {
    if (this.expr[this.pos] === ch) {
      this.pos++;
    } else {
      throw new Error(`Expected '${ch}' at position ${this.pos}`);
    }
  }

  // Addition / Subtraction
  private parseAddSub(): number {
    let left = this.parseMulDiv();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.expr[this.pos++];
      const right = this.parseMulDiv();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  // Multiplication / Division
  private parseMulDiv(): number {
    let left = this.parsePower();
    while (this.peek() === '*' || this.peek() === '/') {
      const op = this.expr[this.pos++];
      const right = this.parsePower();
      if (op === '/' && right === 0) throw new Error('Division by zero');
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  // Exponentiation (right-associative)
  private parsePower(): number {
    let base = this.parseUnaryPostfix();
    if (this.peek() === '^') {
      this.pos++;
      const exp = this.parsePower(); // right-associative
      base = Math.pow(base, exp);
    }
    return base;
  }

  // Postfix: factorial (!)
  private parseUnaryPostfix(): number {
    let val = this.parseUnaryPrefix();
    while (this.peek() === '!') {
      this.pos++;
      val = factorial(Math.round(val));
    }
    return val;
  }

  // Prefix: unary minus
  private parseUnaryPrefix(): number {
    if (this.peek() === '-') {
      this.pos++;
      return -this.parseUnaryPrefix();
    }
    if (this.peek() === '+') {
      this.pos++;
      return this.parseUnaryPrefix();
    }
    return this.parseAtom();
  }

  // Atoms: numbers, constants, functions, parentheses
  private parseAtom(): number {
    // Named functions
    const funcs = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'log', 'ln', 'sqrt', 'abs',
    ];
    for (const fn of funcs) {
      if (this.expr.substring(this.pos, this.pos + fn.length) === fn) {
        this.pos += fn.length;
        // Expect '(' after function name
        if (this.peek() === '(') {
          this.consume('(');
          const arg = this.parseAddSub();
          this.consume(')');
          return this.evalFunction(fn, arg);
        }
        // Allow function without parens: applies to next atom
        const arg = this.parseAtom();
        return this.evalFunction(fn, arg);
      }
    }

    // Constants
    if (this.expr.substring(this.pos, this.pos + 2) === 'PI') {
      this.pos += 2;
      return Math.PI;
    }
    if (this.peek() === 'e' && !this.isPartOfWord(this.pos)) {
      this.pos++;
      return Math.E;
    }

    // Parentheses
    if (this.peek() === '(') {
      this.consume('(');
      const val = this.parseAddSub();
      this.consume(')');
      return val;
    }

    // Number literal
    return this.parseNumber();
  }

  private isPartOfWord(pos: number): boolean {
    const next = this.expr[pos + 1];
    return next !== undefined && /[a-zA-Z]/.test(next);
  }

  private parseNumber(): number {
    const start = this.pos;
    while (this.pos < this.expr.length && (isDigitOrDot(this.expr[this.pos]))) {
      this.pos++;
    }
    if (this.pos === start) {
      throw new Error('Expected number at position ' + this.pos);
    }
    return parseFloat(this.expr.substring(start, this.pos));
  }

  private evalFunction(name: string, arg: number): number {
    switch (name) {
      case 'sin':
        return Math.sin(this.useDeg ? toRadians(arg) : arg);
      case 'cos':
        return Math.cos(this.useDeg ? toRadians(arg) : arg);
      case 'tan':
        return Math.tan(this.useDeg ? toRadians(arg) : arg);
      case 'asin':
        return this.useDeg ? toDegrees(Math.asin(arg)) : Math.asin(arg);
      case 'acos':
        return this.useDeg ? toDegrees(Math.acos(arg)) : Math.acos(arg);
      case 'atan':
        return this.useDeg ? toDegrees(Math.atan(arg)) : Math.atan(arg);
      case 'log':
        return Math.log10(arg);
      case 'ln':
        return Math.log(arg);
      case 'sqrt':
        return Math.sqrt(arg);
      case 'abs':
        return Math.abs(arg);
      default:
        throw new Error('Unknown function: ' + name);
    }
  }
}

function isDigitOrDot(ch: string): boolean {
  return (ch >= '0' && ch <= '9') || ch === '.';
}

function safeEvaluateScientific(expr: string, useDeg: boolean): number | null {
  try {
    if (!expr.trim()) return null;
    const parser = new ExprParser(expr, useDeg);
    const result = parser.parse();
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

// ── Button definitions ───────────────────────────────────────────────
interface CalcButton {
  label: string;
  type: 'number' | 'operator' | 'equal' | 'clear' | 'action' | 'function';
  action: string;
}

const SCIENTIFIC_ROW_1: CalcButton[] = [
  { label: 'sin', type: 'function', action: 'sin(' },
  { label: 'cos', type: 'function', action: 'cos(' },
  { label: 'tan', type: 'function', action: 'tan(' },
  { label: 'log', type: 'function', action: 'log(' },
  { label: 'ln', type: 'function', action: 'ln(' },
];

const SCIENTIFIC_ROW_2: CalcButton[] = [
  { label: '\u221a', type: 'function', action: 'sqrt(' },
  { label: 'x\u00b2', type: 'function', action: '^2' },
  { label: 'x\u00b3', type: 'function', action: '^3' },
  { label: 'x\u02b8', type: 'function', action: '^' },
  { label: '!', type: 'function', action: '!' },
];

const SCIENTIFIC_ROW_3: CalcButton[] = [
  { label: '\u03c0', type: 'function', action: '\u03c0' },
  { label: 'e', type: 'function', action: 'e' },
  { label: '(', type: 'function', action: '(' },
  { label: ')', type: 'function', action: ')' },
  { label: '1/x', type: 'action', action: 'reciprocal' },
];

const BASIC_BUTTONS: CalcButton[][] = [
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
    { label: 'abs', type: 'function', action: 'abs(' },
    { label: '0', type: 'number', action: '0' },
    { label: '.', type: 'number', action: '.' },
    { label: '=', type: 'equal', action: 'equals' },
  ],
];

function getBtnClass(type: CalcButton['type']): string {
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
    case 'function':
      return 'bg-secondary/15 border border-secondary/25';
  }
}

function getBtnTextClass(type: CalcButton['type']): string {
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
    case 'function':
      return 'text-secondary';
  }
}

// ── Component ────────────────────────────────────────────────────────
const ScientificCalculator = React.memo(function ScientificCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('scientific-calculator', 'Scientific Calculator');

  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [useDeg, setUseDeg] = useState(true);

  const preview = useMemo(() => {
    if (!expression) return '';
    const result = safeEvaluateScientific(expression, useDeg);
    if (result === null) return '';
    return String(roundTo(result, 10));
  }, [expression, useDeg]);

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

        case 'percent': {
          const result = safeEvaluateScientific(expression, useDeg);
          if (result !== null) {
            const pct = roundTo(result / 100, 10);
            setExpression(String(pct));
            setHasCalculated(true);
          }
          break;
        }

        case 'reciprocal': {
          const result = safeEvaluateScientific(expression, useDeg);
          if (result !== null && result !== 0) {
            const reciprocal = roundTo(1 / result, 10);
            setExpression(String(reciprocal));
            setHasCalculated(true);
          }
          break;
        }

        case 'equals': {
          const result = safeEvaluateScientific(expression, useDeg);
          if (result !== null) {
            const rounded = roundTo(result, 10);
            const resultStr = String(rounded);
            setLastResult(resultStr);

            saveToHistory(
              { expression, mode: useDeg ? 'DEG' : 'RAD' },
              { result: rounded },
              `${expression} = ${resultStr}`,
            );

            setExpression(resultStr);
            setHasCalculated(true);
          }
          break;
        }

        default: {
          const isOperatorChar = ['+', '-', '\u00d7', '\u00f7', '^'].includes(btn.action);
          const isPostfix = btn.action === '!' || btn.action === '^2' || btn.action === '^3';

          if (hasCalculated && !isOperatorChar && !isPostfix) {
            setExpression(btn.action);
            setHasCalculated(false);
          } else {
            setExpression((prev) => prev + btn.action);
            if (!isPostfix) setHasCalculated(false);
          }
          break;
        }
      }
    },
    [expression, hasCalculated, useDeg, saveToHistory],
  );

  const renderRow = useCallback(
    (row: CalcButton[], rowIndex: number, isScientific = false) => (
      <View key={`row-${rowIndex}`} className="flex-row gap-1.5">
        {row.map((btn) => (
          <Pressable
            key={btn.label + btn.action}
            onPress={() => handlePress(btn)}
            className={`flex-1 items-center justify-center rounded-xl ${
              isScientific ? 'py-2.5' : 'py-3.5'
            } ${getBtnClass(btn.type)}`}
          >
            <Text
              className={`${isScientific ? 'text-xs' : 'text-lg'} font-semibold ${getBtnTextClass(btn.type)}`}
            >
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>
    ),
    [handlePress],
  );

  return (
    <CalculatorShell title="Scientific Calculator">
      {/* DEG / RAD Toggle */}
      <CalculatorToggle
        label="Angle Unit"
        value={useDeg}
        onValueChange={setUseDeg}
        leftLabel="RAD"
        rightLabel="DEG"
      />

      {/* Display */}
      <View className="rounded-card border border-border bg-surface-elevated p-5">
        <Text
          className="text-right text-base text-text-secondary"
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {expression || '0'}
        </Text>
        <Text
          className="mt-2 text-right text-3xl font-bold text-text"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {hasCalculated && lastResult ? lastResult : preview || '0'}
        </Text>
      </View>

      {/* Scientific function rows */}
      <View className="mt-3 gap-1.5">
        {renderRow(SCIENTIFIC_ROW_1, 100, true)}
        {renderRow(SCIENTIFIC_ROW_2, 101, true)}
        {renderRow(SCIENTIFIC_ROW_3, 102, true)}
      </View>

      {/* Basic button grid */}
      <View className="mt-2 gap-1.5">
        {BASIC_BUTTONS.map((row, i) => renderRow(row, i))}
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

export default ScientificCalculator;
