import { Easing } from 'react-native-reanimated';

export const STARTUP_COLORS = {
  cosmos: '#05060F',
  cosmosDeep: '#0A0B1A',
  logoIndigo: '#3A2BD9',
  logoBlue: '#1E5FFF',
  appTealLight: '#0D9488',
  appTealDark: '#2DD4BF',
  appTealGlow: '#5EEAD4',
  appIndigo: '#6366F1',
  appIndigoLight: '#818CF8',
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  white: '#FFFFFF',
  microtext: 'rgba(243, 244, 246, 0.55)',
  particleIndigo: 'rgba(129, 140, 248, 0.85)',
  particleTeal: 'rgba(94, 234, 212, 0.85)',
  particleAmber: 'rgba(251, 191, 36, 0.9)',
} as const;

export const STARTUP_TIMINGS = {
  actI: { start: 0, end: 1000 },
  actII: { start: 1000, end: 2400 },
  actIII: { start: 2400, end: 3600 },
  actIV: { start: 3600, end: 4200 },
  totalMs: 4200,
} as const;

export const STARTUP_EASING = {
  outExpo: Easing.bezier(0.22, 1, 0.36, 1),
  inOutExpo: Easing.bezier(0.87, 0, 0.13, 1),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  smooth: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const PARTICLE_COUNT = 28;
export const LIGHT_STREAK_COUNT = 6;
export const ENERGY_RING_COUNT = 3;
