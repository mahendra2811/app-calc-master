/**
 * Formats a number using the Indian numbering system.
 * Example: 1234567 -> "12,34,567"
 */
export function formatIndianNumber(num: number): string {
  const isNegative = num < 0;
  const absolute = Math.abs(num);
  const str = absolute.toString();
  const parts = str.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  if (integerPart.length <= 3) {
    const formatted = isNegative ? `-${integerPart}` : integerPart;
    return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted;
  }

  const lastThree = integerPart.slice(-3);
  const remaining = integerPart.slice(0, -3);

  let result = '';
  for (let i = remaining.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 2 === 0) {
      result = ',' + result;
    }
    result = remaining[i] + result;
  }

  result = `${result},${lastThree}`;

  if (isNegative) {
    result = `-${result}`;
  }

  return decimalPart !== undefined ? `${result}.${decimalPart}` : result;
}

/**
 * Formats a number as Indian currency with the rupee symbol.
 * Example: 1234567 -> "₹12,34,567"
 */
export function formatCurrency(num: number): string {
  const rounded = Math.round(num * 100) / 100;
  const parts = rounded.toString().split('.');
  const intFormatted = formatIndianNumber(
    rounded < 0 ? -Math.abs(parseInt(parts[0], 10)) : parseInt(parts[0], 10)
  );

  // Always show 2 decimal places for currency
  const decimalPart = parts[1] !== undefined ? parts[1].padEnd(2, '0').slice(0, 2) : '00';

  if (rounded < 0) {
    const withoutMinus = intFormatted.slice(1);
    return `-\u20B9${withoutMinus}.${decimalPart}`;
  }

  return `\u20B9${intFormatted}.${decimalPart}`;
}

/**
 * Formats a number as a percentage string.
 * Example: 12.345 with decimals=2 -> "12.35%"
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  return `${num.toFixed(decimals)}%`;
}

/**
 * Formats a number in compact Indian notation.
 * Examples: 1500 -> "1.5K", 150000 -> "1.5L", 15000000 -> "1.5Cr"
 */
export function formatCompact(num: number): string {
  const isNegative = num < 0;
  const absolute = Math.abs(num);
  let result: string;

  if (absolute >= 1e7) {
    const crores = absolute / 1e7;
    result = stripTrailingZeros(crores.toFixed(2)) + 'Cr';
  } else if (absolute >= 1e5) {
    const lakhs = absolute / 1e5;
    result = stripTrailingZeros(lakhs.toFixed(2)) + 'L';
  } else if (absolute >= 1e3) {
    const thousands = absolute / 1e3;
    result = stripTrailingZeros(thousands.toFixed(2)) + 'K';
  } else {
    result = stripTrailingZeros(absolute.toFixed(2));
  }

  return isNegative ? `-${result}` : result;
}

function stripTrailingZeros(str: string): string {
  if (!str.includes('.')) return str;
  return str.replace(/\.?0+$/, '');
}
