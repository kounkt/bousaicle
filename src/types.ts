export type Dwelling = 'house' | 'apt_low' | 'apt_high';
export type Status = 'have' | 'need' | 'this_week';
export type Priority = 'S' | 'A' | 'B';
export type Category =
  | 'water' | 'staple' | 'main' | 'side' | 'toilet' | 'heat'
  | 'power' | 'baby' | 'senior' | 'pet' | 'common';

export interface Household {
  version: 1;
  prefecture: string;
  dwelling: Dwelling;
  adults: number;      // 18〜64歳
  seniors: number;     // 65歳以上
  kidsInfant: number;  // 0〜2歳
  kidsChild: number;   // 3歳以上の子ども
  pets: ('dog' | 'cat' | 'other')[];
  flags: { allergy: boolean; medication: boolean };
  targetDays: 3 | 7;
}

export interface StockItem {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  priority: Priority;
  requiredQty: number;
  unit: string;
  note?: string;
  expirable: boolean;      // 賞味・使用期限を管理する品目か
  status: Status;
  expiry?: { year: number; month: number } | null;
  plan?: string;           // if-then プラン文
}

export interface SheetInfo {
  meetingPoint: string;
  evacSite: string;
  memo: string;
}
