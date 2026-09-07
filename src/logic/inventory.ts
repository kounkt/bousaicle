import type { StockItem } from '../types';
import { expiryState } from './expiry';

export function ownedQuantity(item: StockItem): number {
  return Math.max(0, item.ownedQty ?? 0);
}
export function usableQuantity(item: StockItem, now = new Date()): number {
  return expiryState(item, now) === 'expired' ? 0 : ownedQuantity(item);
}
export function missingQuantity(item: StockItem, now = new Date()): number {
  return Math.max(0, item.requiredQty - usableQuantity(item, now));
}
export function coverage(item: StockItem, now = new Date()): number {
  return item.requiredQty > 0 ? Math.min(1, usableQuantity(item, now) / item.requiredQty) : 1;
}
/** Keep actual inventory when the household or target changes; old checkbox data has no known quantity. */
export function mergeInventory(next: StockItem[], previous: StockItem[]): StockItem[] {
  const byId = new Map(previous.map(item => [item.id, item]));
  return next.map(item => {
    const old = byId.get(item.id);
    if (!old) return item;
    return { ...item, ownedQty: old.ownedQty, status: old.status === 'this_week' ? 'this_week' : (old.ownedQty ?? 0) >= item.requiredQty ? 'have' : old.ownedQty === undefined && old.status === 'have' ? 'have' : 'need', expiry: old.expiry, plan: old.requiredQty === item.requiredQty ? old.plan : undefined };
  });
}
export function shoppingText(items: StockItem[]): string {
  return '【買い足す防災備蓄】\n' + items.filter(i => missingQuantity(i) > 0).map(i => `□ ${i.name} あと${missingQuantity(i)}${i.unit}${i.plan ? `（${i.plan}）` : ''}`).join('\n');
}
