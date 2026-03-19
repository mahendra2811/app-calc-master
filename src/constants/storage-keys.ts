export const STORAGE_KEYS = {
  THEME: '@calcmaster/theme',
  LANGUAGE: '@calcmaster/language',
  FAVORITES: '@calcmaster/favorites',
  RECENT: '@calcmaster/recent',
  GLOBAL_HISTORY: '@calcmaster/global_history',
  CALC_HISTORY: (id: string) => `@calcmaster/history/${id}`,
  SETTINGS: '@calcmaster/settings',
  SCHEMA_VERSION: '@calcmaster/schema_version',
  FIRST_LAUNCH: '@calcmaster/first_launch',
  AD_FREE_UNTIL: '@calcmaster/ad_free_until',
} as const;
