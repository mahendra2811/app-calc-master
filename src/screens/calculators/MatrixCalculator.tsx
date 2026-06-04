import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { CalculatorShell } from '@/components/CalculatorShell';
import { CalculatorDropdown } from '@/components/CalculatorDropdown';
import { ResultCard } from '@/components/ResultCard';
import { ResultBreakdown } from '@/components/ResultBreakdown';
import { useCalculator } from '@/hooks/useCalculator';
import { useLanguage } from '@/contexts/LanguageContext';
import { roundTo } from '@/utils/math-helpers';
import { formatIndianNumber } from '@/utils/format-number';

type MatrixSize = 2 | 3;
type Matrix2 = number[][];

const OPERATIONS = [
  { label: 'A + B (Addition)', value: 'add' },
  { label: 'A \u00d7 B (Multiply)', value: 'multiply' },
  { label: 'det(A) (Determinant)', value: 'determinant' },
  { label: 'A\u207b\u00b9 (Inverse)', value: 'inverse' },
  { label: 'A\u1d40 (Transpose)', value: 'transpose' },
];

/** Create a zero matrix of given size. */
function createZeroMatrix(size: number): string[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ''),
  );
}

/** Parse a string matrix into a number matrix. Returns null on invalid input. */
function parseMatrix(strMatrix: string[][], size: number): number[][] | null {
  const result: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      const val = Number(strMatrix[i][j]);
      if (!Number.isFinite(val)) return null;
      row.push(val);
    }
    result.push(row);
  }
  return result;
}

/** Matrix addition. */
function matAdd(a: Matrix2, b: Matrix2, size: number): Matrix2 {
  const result: Matrix2 = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(a[i][j] + b[i][j]);
    }
    result.push(row);
  }
  return result;
}

/** Matrix multiplication. */
function matMul(a: Matrix2, b: Matrix2, size: number): Matrix2 {
  const result: Matrix2 = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

/** Determinant of a 2x2 matrix. */
function det2(m: Matrix2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

/** Determinant of a 3x3 matrix using cofactor expansion along first row. */
function det3(m: Matrix2): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

/** Compute determinant for 2x2 or 3x3. */
function determinant(m: Matrix2, size: number): number {
  return size === 2 ? det2(m) : det3(m);
}

/** Transpose a matrix. */
function transpose(m: Matrix2, size: number): Matrix2 {
  const result: Matrix2 = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(m[j][i]);
    }
    result.push(row);
  }
  return result;
}

/** Inverse of a 2x2 matrix. Returns null if singular. */
function inverse2(m: Matrix2): Matrix2 | null {
  const d = det2(m);
  if (d === 0) return null;
  const invDet = 1 / d;
  return [
    [m[1][1] * invDet, -m[0][1] * invDet],
    [-m[1][0] * invDet, m[0][0] * invDet],
  ];
}

/** Inverse of a 3x3 matrix using adjugate method. Returns null if singular. */
function inverse3(m: Matrix2): Matrix2 | null {
  const d = det3(m);
  if (d === 0) return null;
  const invDet = 1 / d;

  // Cofactor matrix
  const cofactors: Matrix2 = [
    [
      m[1][1] * m[2][2] - m[1][2] * m[2][1],
      -(m[1][0] * m[2][2] - m[1][2] * m[2][0]),
      m[1][0] * m[2][1] - m[1][1] * m[2][0],
    ],
    [
      -(m[0][1] * m[2][2] - m[0][2] * m[2][1]),
      m[0][0] * m[2][2] - m[0][2] * m[2][0],
      -(m[0][0] * m[2][1] - m[0][1] * m[2][0]),
    ],
    [
      m[0][1] * m[1][2] - m[0][2] * m[1][1],
      -(m[0][0] * m[1][2] - m[0][2] * m[1][0]),
      m[0][0] * m[1][1] - m[0][1] * m[1][0],
    ],
  ];

  // Adjugate is the transpose of the cofactor matrix, then multiply by 1/det
  const result: Matrix2 = [];
  for (let i = 0; i < 3; i++) {
    const row: number[] = [];
    for (let j = 0; j < 3; j++) {
      row.push(cofactors[j][i] * invDet);
    }
    result.push(row);
  }
  return result;
}

/** Inverse for 2x2 or 3x3. */
function matInverse(m: Matrix2, size: number): Matrix2 | null {
  return size === 2 ? inverse2(m) : inverse3(m);
}

/** Format a number for matrix display. */
function fmtNum(n: number): string {
  const rounded = roundTo(n, 4);
  return String(rounded);
}

const MatrixCalculator = React.memo(function MatrixCalculator() {
  const { t } = useLanguage();
  const { saveToHistory } = useCalculator('matrix-calculator', 'Matrix Calculator');

  const [size, setSize] = useState<MatrixSize>(2);
  const [matA, setMatA] = useState<string[][]>(createZeroMatrix(2));
  const [matB, setMatB] = useState<string[][]>(createZeroMatrix(2));
  const [operation, setOperation] = useState('add');
  const [resultMatrix, setResultMatrix] = useState<Matrix2 | null>(null);
  const [scalarResult, setScalarResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  const switchSize = useCallback((newSize: MatrixSize) => {
    setSize(newSize);
    setMatA(createZeroMatrix(newSize));
    setMatB(createZeroMatrix(newSize));
    setResultMatrix(null);
    setScalarResult(null);
    setError('');
  }, []);

  const updateMatA = useCallback(
    (row: number, col: number, value: string) => {
      setMatA((prev) => {
        const copy = prev.map((r) => [...r]);
        copy[row][col] = value;
        return copy;
      });
    },
    [],
  );

  const updateMatB = useCallback(
    (row: number, col: number, value: string) => {
      setMatB((prev) => {
        const copy = prev.map((r) => [...r]);
        copy[row][col] = value;
        return copy;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setMatA(createZeroMatrix(size));
    setMatB(createZeroMatrix(size));
    setOperation('add');
    setResultMatrix(null);
    setScalarResult(null);
    setError('');
  }, [size]);

  const needsMatrixB = operation === 'add' || operation === 'multiply';

  const calculate = useCallback(() => {
    setError('');
    setResultMatrix(null);
    setScalarResult(null);

    const a = parseMatrix(matA, size);
    if (!a) {
      setError('Matrix A contains invalid entries. Please fill all cells with valid numbers.');
      return;
    }

    if (needsMatrixB) {
      const b = parseMatrix(matB, size);
      if (!b) {
        setError('Matrix B contains invalid entries. Please fill all cells with valid numbers.');
        return;
      }

      if (operation === 'add') {
        const res = matAdd(a, b, size);
        setResultMatrix(res);
        saveToHistory(
          { operation: 'A+B', size: `${size}x${size}` },
          { result: 'Matrix sum computed' },
          `${size}x${size} Matrix A + B`,
        );
      } else {
        const res = matMul(a, b, size);
        setResultMatrix(res);
        saveToHistory(
          { operation: 'AxB', size: `${size}x${size}` },
          { result: 'Matrix product computed' },
          `${size}x${size} Matrix A x B`,
        );
      }
    } else if (operation === 'determinant') {
      const det = determinant(a, size);
      setScalarResult(roundTo(det, 6));
      saveToHistory(
        { operation: 'det(A)', size: `${size}x${size}` },
        { determinant: roundTo(det, 6) },
        `det(${size}x${size} A) = ${roundTo(det, 6)}`,
      );
    } else if (operation === 'inverse') {
      const inv = matInverse(a, size);
      if (!inv) {
        setError('Matrix A is singular (determinant = 0). Inverse does not exist.');
        return;
      }
      setResultMatrix(inv);
      saveToHistory(
        { operation: 'A^-1', size: `${size}x${size}` },
        { result: 'Inverse computed' },
        `Inverse of ${size}x${size} Matrix A`,
      );
    } else if (operation === 'transpose') {
      const trans = transpose(a, size);
      setResultMatrix(trans);
      saveToHistory(
        { operation: 'A^T', size: `${size}x${size}` },
        { result: 'Transpose computed' },
        `Transpose of ${size}x${size} Matrix A`,
      );
    }
  }, [matA, matB, size, operation, needsMatrixB, saveToHistory]);

  /** Renders a grid of TextInputs for a matrix. */
  const renderMatrixInputs = useCallback(
    (
      label: string,
      matrix: string[][],
      onUpdate: (row: number, col: number, value: string) => void,
    ) => (
      <View className="rounded-card border border-border bg-surface p-4">
        <Text className="mb-3 text-sm font-semibold text-text-secondary">
          {label}
        </Text>
        {Array.from({ length: size }).map((_, row) => (
          <View key={`row-${row}`} className="mb-2 flex-row gap-2">
            {Array.from({ length: size }).map((_, col) => (
              <View key={`cell-${row}-${col}`} className="flex-1">
                <TextInput
                  className="rounded-input border border-border bg-surface-elevated px-3 py-2 text-center text-base text-text"
                  value={matrix[row]?.[col] ?? ''}
                  onChangeText={(val) => onUpdate(row, col, val)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  selectionColor="#0D9488"
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    ),
    [size],
  );

  /** Renders a result matrix as a grid of styled numbers. */
  const renderResultMatrix = useCallback(
    (matrix: Matrix2) => (
      <View className="rounded-card border border-primary bg-primary/5 p-4">
        <Text className="mb-3 text-sm font-semibold text-text-secondary">
          Result Matrix
        </Text>
        {matrix.map((row, i) => (
          <View key={`res-row-${i}`} className="mb-1 flex-row">
            {row.map((val, j) => (
              <View
                key={`res-cell-${i}-${j}`}
                className="flex-1 items-center rounded-lg bg-primary/10 px-2 py-2 mx-1"
              >
                <Text className="text-sm font-bold text-primary">
                  {fmtNum(val)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    ),
    [],
  );

  return (
    <CalculatorShell
      title="Matrix Calculator"
      onCalculate={calculate}
      onReset={reset}
    >
      {/* Size Toggle */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => switchSize(2)}
          className={`flex-1 items-center rounded-xl border py-3 ${
            size === 2
              ? 'border-primary bg-primary/15'
              : 'border-border bg-surface'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              size === 2 ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            2 x 2
          </Text>
        </Pressable>
        <Pressable
          onPress={() => switchSize(3)}
          className={`flex-1 items-center rounded-xl border py-3 ${
            size === 3
              ? 'border-primary bg-primary/15'
              : 'border-border bg-surface'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              size === 3 ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            3 x 3
          </Text>
        </Pressable>
      </View>

      {/* Operation */}
      <CalculatorDropdown
        label="Operation"
        value={operation}
        onValueChange={setOperation}
        options={OPERATIONS}
      />

      {/* Matrix A */}
      {renderMatrixInputs('Matrix A', matA, updateMatA)}

      {/* Matrix B (only for add/multiply) */}
      {needsMatrixB && renderMatrixInputs('Matrix B', matB, updateMatB)}

      {/* Error */}
      {error ? (
        <View className="rounded-lg bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {/* Scalar Result (Determinant) */}
      {scalarResult !== null && !error && (
        <View className="mt-4 gap-4">
          <ResultCard
            title="Determinant of A"
            value={String(scalarResult)}
            subtitle={`det(A) for ${size}x${size} matrix`}
            type="success"
            visible={scalarResult !== null}
          />
        </View>
      )}

      {/* Matrix Result */}
      {resultMatrix && !error && (
        <View className="mt-4 gap-4">
          {renderResultMatrix(resultMatrix)}

          <ResultBreakdown
            title="Details"
            items={[
              { label: 'Matrix Size', value: `${size} x ${size}` },
              {
                label: 'Operation',
                value:
                  OPERATIONS.find((o) => o.value === operation)?.label ?? operation,
                highlight: true,
              },
              ...(operation === 'inverse'
                ? [
                    {
                      label: 'det(A)',
                      value: String(roundTo(determinant(parseMatrix(matA, size)!, size), 6)),
                    },
                  ]
                : []),
            ]}
          />
        </View>
      )}
    </CalculatorShell>
  );
});

export default MatrixCalculator;
