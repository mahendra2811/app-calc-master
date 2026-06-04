export const COLORS = {
  // Brand palette
  primary: {
    DEFAULT: '#0D9488',
    light: '#14B8A6',
    dark: '#0F766E',
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  secondary: {
    DEFAULT: '#6366F1',
    light: '#818CF8',
    dark: '#4F46E5',
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  accent: {
    DEFAULT: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Semantic colors
  success: {
    DEFAULT: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
  },

  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },

  warning: {
    DEFAULT: '#F97316',
    light: '#FB923C',
    dark: '#EA580C',
  },

  // Category colors
  category: {
    finance: '#0D9488',
    math: '#6366F1',
  },

  // Light theme
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceElevated: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    btnNumber: '#F3F4F6',
    btnOperator: '#0D9488',
    btnEqual: '#22C55E',
    btnClear: '#EF4444',
  },

  // Dark theme
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceElevated: '#374151',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#4B5563',
    btnNumber: '#374151',
    btnOperator: '#2DD4BF',
    btnEqual: '#4ADE80',
    btnClear: '#F87171',
  },

  // Common neutrals
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

export type ThemeColors = typeof COLORS.light | typeof COLORS.dark;
