export type Category = 'finance' | 'math';

export interface CalculatorMeta {
  id: string;
  name: string;
  shortDesc: string;
  category: Category;
  icon: string;
  color: string;
}

export interface HistoryEntry {
  id: string;
  calcId: string;
  calcName: string;
  timestamp: number;
  inputs: Record<string, any>;
  result: Record<string, any>;
  isFavorite: boolean;
  label?: string;
}
