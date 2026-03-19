/**
 * Computes the factorial of a non-negative integer.
 * Returns 1 for n = 0. Throws for negative numbers.
 */
export function factorial(n: number): number {
  if (n < 0) {
    throw new RangeError('Factorial is not defined for negative numbers');
  }
  if (!Number.isInteger(n)) {
    throw new RangeError('Factorial is only defined for integers');
  }
  if (n > 170) {
    return Infinity;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Computes the greatest common divisor of two integers using the Euclidean algorithm.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Computes the GCD of an array of numbers.
 */
export function gcdMultiple(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new RangeError('At least one number is required');
  }
  return numbers.reduce((acc, val) => gcd(acc, val));
}

/**
 * Computes the least common multiple of two integers.
 */
export function lcm(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (a === 0 || b === 0) return 0;
  return (a / gcd(a, b)) * b;
}

/**
 * Computes the LCM of an array of numbers.
 */
export function lcmMultiple(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new RangeError('At least one number is required');
  }
  return numbers.reduce((acc, val) => lcm(acc, val));
}

/**
 * Checks whether a number is prime.
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Computes the number of permutations: P(n, r) = n! / (n - r)!
 */
export function nPr(n: number, r: number): number {
  if (r < 0 || r > n) {
    throw new RangeError('r must be between 0 and n inclusive');
  }
  let result = 1;
  for (let i = n; i > n - r; i--) {
    result *= i;
  }
  return result;
}

/**
 * Computes the number of combinations: C(n, r) = n! / (r! * (n - r)!)
 */
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) {
    throw new RangeError('r must be between 0 and n inclusive');
  }
  // Optimize by using the smaller of r and n-r
  r = Math.min(r, n - r);
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Rounds a number to the specified number of decimal places.
 */
export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
