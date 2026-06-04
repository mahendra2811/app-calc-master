export type RootStackParamList = {
  '(tabs)': undefined;
  'calculator/[slug]': { slug: string };
  'history/index': undefined;
  'history/[calcId]': { calcId: string };
  'settings/index': undefined;
  'settings/language': undefined;
  'settings/theme': undefined;
  'settings/about': undefined;
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
  history: undefined;
  settings: undefined;
};

export type CalculatorScreenParams = {
  slug: string;
};

export type HistoryScreenParams = {
  calcId?: string;
};
