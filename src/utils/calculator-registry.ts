import React from 'react';

type LazyComponent = React.LazyExoticComponent<React.ComponentType<any>>;

const registry: Record<string, LazyComponent> = {
  // Finance Calculators
  'sip-calculator': React.lazy(
    () => import('../screens/calculators/SIPCalculator')
  ),
  'lumpsum-calculator': React.lazy(
    () => import('../screens/calculators/LumpSumCalculator')
  ),
  'emi-calculator': React.lazy(
    () => import('../screens/calculators/EMICalculator')
  ),
  'simple-interest': React.lazy(
    () => import('../screens/calculators/SimpleInterestCalculator')
  ),
  'compound-interest': React.lazy(
    () => import('../screens/calculators/CompoundInterestCalculator')
  ),
  'fd-rd-calculator': React.lazy(
    () => import('../screens/calculators/FDRDCalculator')
  ),
  'ppf-calculator': React.lazy(
    () => import('../screens/calculators/PPFCalculator')
  ),
  'currency-converter': React.lazy(
    () => import('../screens/calculators/CurrencyConverter')
  ),
  'gst-calculator': React.lazy(
    () => import('../screens/calculators/GSTCalculator')
  ),
  'profit-loss': React.lazy(
    () => import('../screens/calculators/ProfitLossCalculator')
  ),
  'discount-calculator': React.lazy(
    () => import('../screens/calculators/DiscountCalculator')
  ),
  'salary-calculator': React.lazy(
    () => import('../screens/calculators/SalaryCalculator')
  ),
  'income-tax': React.lazy(
    () => import('../screens/calculators/IncomeTaxCalculator')
  ),
  'mortgage-calculator': React.lazy(
    () => import('../screens/calculators/MortgageCalculator')
  ),
  'retirement-calculator': React.lazy(
    () => import('../screens/calculators/RetirementCalculator')
  ),
  'roi-calculator': React.lazy(
    () => import('../screens/calculators/ROICalculator')
  ),
  'nps-calculator': React.lazy(
    () => import('../screens/calculators/NPSCalculator')
  ),
  'cagr-calculator': React.lazy(
    () => import('../screens/calculators/CAGRCalculator')
  ),
  'hra-calculator': React.lazy(
    () => import('../screens/calculators/HRACalculator')
  ),
  'gratuity-calculator': React.lazy(
    () => import('../screens/calculators/GratuityCalculator')
  ),
  'epf-calculator': React.lazy(
    () => import('../screens/calculators/EPFCalculator')
  ),
  'home-loan-vs-rent': React.lazy(
    () => import('../screens/calculators/HomeLoanVsRent')
  ),
  'net-worth': React.lazy(
    () => import('../screens/calculators/NetWorthCalculator')
  ),
  'break-even': React.lazy(
    () => import('../screens/calculators/BreakEvenCalculator')
  ),

  // Math Calculators
  'basic-calculator': React.lazy(
    () => import('../screens/calculators/BasicCalculator')
  ),
  'scientific-calculator': React.lazy(
    () => import('../screens/calculators/ScientificCalculator')
  ),
  'percentage-calculator': React.lazy(
    () => import('../screens/calculators/PercentageCalculator')
  ),
  'fraction-calculator': React.lazy(
    () => import('../screens/calculators/FractionCalculator')
  ),
  'number-system': React.lazy(
    () => import('../screens/calculators/NumberSystemConverter')
  ),
  'prime-checker': React.lazy(
    () => import('../screens/calculators/PrimeChecker')
  ),
  'gcd-lcm': React.lazy(
    () => import('../screens/calculators/GCDLCMCalculator')
  ),
  'statistics-calculator': React.lazy(
    () => import('../screens/calculators/StatisticsCalculator')
  ),
  'matrix-calculator': React.lazy(
    () => import('../screens/calculators/MatrixCalculator')
  ),
  'quadratic-solver': React.lazy(
    () => import('../screens/calculators/QuadraticSolver')
  ),
  'logarithm-calculator': React.lazy(
    () => import('../screens/calculators/LogarithmCalculator')
  ),
  'permutation-combination': React.lazy(
    () => import('../screens/calculators/PermutationCombination')
  ),
};

export function getCalculatorComponent(slug: string): LazyComponent | null {
  return registry[slug] || null;
}
