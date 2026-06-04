import { CalculatorMeta, Category } from "../types/calculator";
import { COLORS } from "./colors";

export const CALCULATORS: CalculatorMeta[] = [
  // ── Finance Calculators (24) ──────────────────────────────────────────
  {
    id: "sip-calculator",
    name: "calculators.sip.name",
    shortDesc: "calculators.sip.shortDesc",
    category: "finance",
    icon: "trending-up",
    color: COLORS.category.finance,
  },
  {
    id: "lumpsum-calculator",
    name: "calculators.lumpsum.name",
    shortDesc: "calculators.lumpsum.shortDesc",
    category: "finance",
    icon: "wallet-outline",
    color: COLORS.category.finance,
  },
  {
    id: "emi-calculator",
    name: "calculators.emi.name",
    shortDesc: "calculators.emi.shortDesc",
    category: "finance",
    icon: "card-outline",
    color: COLORS.category.finance,
  },
  {
    id: "simple-interest",
    name: "calculators.simpleInterest.name",
    shortDesc: "calculators.simpleInterest.shortDesc",
    category: "finance",
    icon: "cash-outline",
    color: COLORS.category.finance,
  },
  {
    id: "compound-interest",
    name: "calculators.compoundInterest.name",
    shortDesc: "calculators.compoundInterest.shortDesc",
    category: "finance",
    icon: "layers-outline",
    color: COLORS.category.finance,
  },
  {
    id: "fd-rd-calculator",
    name: "calculators.fdrd.name",
    shortDesc: "calculators.fdrd.shortDesc",
    category: "finance",
    icon: "lock-closed-outline",
    color: COLORS.category.finance,
  },
  {
    id: "ppf-calculator",
    name: "calculators.ppf.name",
    shortDesc: "calculators.ppf.shortDesc",
    category: "finance",
    icon: "shield-checkmark-outline",
    color: COLORS.category.finance,
  },
  {
    id: "currency-converter",
    name: "calculators.currency.name",
    shortDesc: "calculators.currency.shortDesc",
    category: "finance",
    icon: "swap-horizontal-outline",
    color: COLORS.category.finance,
  },
  {
    id: "gst-calculator",
    name: "calculators.gst.name",
    shortDesc: "calculators.gst.shortDesc",
    category: "finance",
    icon: "receipt-outline",
    color: COLORS.category.finance,
  },
  {
    id: "profit-loss",
    name: "calculators.profitLoss.name",
    shortDesc: "calculators.profitLoss.shortDesc",
    category: "finance",
    icon: "bar-chart-outline",
    color: COLORS.category.finance,
  },
  {
    id: "discount-calculator",
    name: "calculators.discount.name",
    shortDesc: "calculators.discount.shortDesc",
    category: "finance",
    icon: "pricetag-outline",
    color: COLORS.category.finance,
  },
  {
    id: "salary-calculator",
    name: "calculators.salary.name",
    shortDesc: "calculators.salary.shortDesc",
    category: "finance",
    icon: "briefcase-outline",
    color: COLORS.category.finance,
  },
  {
    id: "income-tax",
    name: "calculators.incomeTax.name",
    shortDesc: "calculators.incomeTax.shortDesc",
    category: "finance",
    icon: "document-text-outline",
    color: COLORS.category.finance,
  },
  {
    id: "mortgage-calculator",
    name: "calculators.mortgage.name",
    shortDesc: "calculators.mortgage.shortDesc",
    category: "finance",
    icon: "home-outline",
    color: COLORS.category.finance,
  },
  {
    id: "retirement-calculator",
    name: "calculators.retirement.name",
    shortDesc: "calculators.retirement.shortDesc",
    category: "finance",
    icon: "sunny-outline",
    color: COLORS.category.finance,
  },
  {
    id: "roi-calculator",
    name: "calculators.roi.name",
    shortDesc: "calculators.roi.shortDesc",
    category: "finance",
    icon: "analytics-outline",
    color: COLORS.category.finance,
  },
  {
    id: "nps-calculator",
    name: "calculators.nps.name",
    shortDesc: "calculators.nps.shortDesc",
    category: "finance",
    icon: "umbrella-outline",
    color: COLORS.category.finance,
  },
  {
    id: "cagr-calculator",
    name: "calculators.cagr.name",
    shortDesc: "calculators.cagr.shortDesc",
    category: "finance",
    icon: "stats-chart-outline",
    color: COLORS.category.finance,
  },
  {
    id: "hra-calculator",
    name: "calculators.hra.name",
    shortDesc: "calculators.hra.shortDesc",
    category: "finance",
    icon: "business-outline",
    color: COLORS.category.finance,
  },
  {
    id: "gratuity-calculator",
    name: "calculators.gratuity.name",
    shortDesc: "calculators.gratuity.shortDesc",
    category: "finance",
    icon: "gift-outline",
    color: COLORS.category.finance,
  },
  {
    id: "epf-calculator",
    name: "calculators.epf.name",
    shortDesc: "calculators.epf.shortDesc",
    category: "finance",
    icon: "people-outline",
    color: COLORS.category.finance,
  },
  {
    id: "home-loan-vs-rent",
    name: "calculators.homeLoanVsRent.name",
    shortDesc: "calculators.homeLoanVsRent.shortDesc",
    category: "finance",
    icon: "git-compare-outline",
    color: COLORS.category.finance,
  },
  {
    id: "net-worth",
    name: "calculators.netWorth.name",
    shortDesc: "calculators.netWorth.shortDesc",
    category: "finance",
    icon: "pie-chart-outline",
    color: COLORS.category.finance,
  },
  {
    id: "break-even",
    name: "calculators.breakEven.name",
    shortDesc: "calculators.breakEven.shortDesc",
    category: "finance",
    icon: "flag-outline",
    color: COLORS.category.finance,
  },

  // ── Math Calculators (12) ─────────────────────────────────────────────
  {
    id: "basic-calculator",
    name: "calculators.basic.name",
    shortDesc: "calculators.basic.shortDesc",
    category: "math",
    icon: "calculator-outline",
    color: COLORS.category.math,
  },
  {
    id: "scientific-calculator",
    name: "calculators.scientific.name",
    shortDesc: "calculators.scientific.shortDesc",
    category: "math",
    icon: "flask-outline",
    color: COLORS.category.math,
  },
  {
    id: "percentage-calculator",
    name: "calculators.percentage.name",
    shortDesc: "calculators.percentage.shortDesc",
    category: "math",
    icon: "cellular-outline",
    color: COLORS.category.math,
  },
  {
    id: "fraction-calculator",
    name: "calculators.fraction.name",
    shortDesc: "calculators.fraction.shortDesc",
    category: "math",
    icon: "cut-outline",
    color: COLORS.category.math,
  },
  {
    id: "number-system",
    name: "calculators.numberSystem.name",
    shortDesc: "calculators.numberSystem.shortDesc",
    category: "math",
    icon: "code-outline",
    color: COLORS.category.math,
  },
  {
    id: "prime-checker",
    name: "calculators.prime.name",
    shortDesc: "calculators.prime.shortDesc",
    category: "math",
    icon: "search-outline",
    color: COLORS.category.math,
  },
  {
    id: "gcd-lcm",
    name: "calculators.gcdLcm.name",
    shortDesc: "calculators.gcdLcm.shortDesc",
    category: "math",
    icon: "git-merge-outline",
    color: COLORS.category.math,
  },
  {
    id: "statistics-calculator",
    name: "calculators.statistics.name",
    shortDesc: "calculators.statistics.shortDesc",
    category: "math",
    icon: "podium-outline",
    color: COLORS.category.math,
  },
  {
    id: "matrix-calculator",
    name: "calculators.matrix.name",
    shortDesc: "calculators.matrix.shortDesc",
    category: "math",
    icon: "grid-outline",
    color: COLORS.category.math,
  },
  {
    id: "quadratic-solver",
    name: "calculators.quadratic.name",
    shortDesc: "calculators.quadratic.shortDesc",
    category: "math",
    icon: "pulse-outline",
    color: COLORS.category.math,
  },
  {
    id: "logarithm-calculator",
    name: "calculators.logarithm.name",
    shortDesc: "calculators.logarithm.shortDesc",
    category: "math",
    icon: "infinite-outline",
    color: COLORS.category.math,
  },
  {
    id: "permutation-combination",
    name: "calculators.permComb.name",
    shortDesc: "calculators.permComb.shortDesc",
    category: "math",
    icon: "shuffle-outline",
    color: COLORS.category.math,
  },
];

const categoryIndex = new Map<Category, CalculatorMeta[]>();
const slugIndex = new Map<string, CalculatorMeta>();

for (const calc of CALCULATORS) {
  slugIndex.set(calc.id, calc);
  const list = categoryIndex.get(calc.category) ?? [];
  list.push(calc);
  categoryIndex.set(calc.category, list);
}

export function getCalculatorsByCategory(category: Category): CalculatorMeta[] {
  return categoryIndex.get(category) ?? [];
}

export function getCalculatorBySlug(slug: string): CalculatorMeta | undefined {
  return slugIndex.get(slug);
}

export function getAllCalculators(): CalculatorMeta[] {
  return CALCULATORS;
}
