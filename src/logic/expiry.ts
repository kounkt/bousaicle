import type { StockItem } from '../types';

/** 期限(年月)の状態。月末を期限日とみなす。 */
export type ExpiryState = 'expired' | 'soon' | 'ok';

export function expiryState(item: StockItem, now = new Date()): ExpiryState | null {
  if (!item.expiry) return null;
  const { year, month } = item.expiry;
  const end = new Date(year, month, 0, 23, 59, 59); // 月末
  if (end < now) return 'expired';
  const soonLine = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  if (end <= soonLine) return 'soon';
  return 'ok';
}

export function fmtExpiry(e: { year: number; month: number }): string {
  return `${e.year}年${e.month}月`;
}
