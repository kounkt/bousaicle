import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildItems } from '../src/data/stockMaster';
import { coverage, mergeInventory, missingQuantity, shoppingText } from '../src/logic/inventory';
import { calcScore } from '../src/logic/score';
import { buildICS } from '../src/logic/ics';
import { expiryState } from '../src/logic/expiry';
import { encodeShare, decodeShare, parseImportJSON } from '../src/logic/share';
import type { Household, StockItem } from '../src/types';
const family: Household = { version: 1, prefecture: '', dwelling: 'house', adults: 2, seniors: 0, kidsInfant: 0, kidsChild: 0, pets: [], flags: { allergy: false, medication: false }, targetDays: 7 };
const water = () => buildItems(family).find(i => i.id === 'water')!;
const snapshot = (items = buildItems(family)) => ({ household: family, items, sheet: { meetingPoint: '公園', evacSite: '小学校', memo: '家族のメモ' } });
afterEach(() => vi.useRealTimers());
describe('stock calculation and actual inventory', () => {
  it('uses the MAFF gas baseline per person, not per pair', () => {
    expect(buildItems(family).find(i => i.id === 'bombe')!.requiredQty).toBe(12);
    expect(buildItems({ ...family, adults: 1, targetDays: 3 }).find(i => i.id === 'bombe')!.requiredQty).toBe(3);
  });
  it('accounts for repeated pet species', () => {
    const items = buildItems({ ...family, pets: ['dog', 'dog', 'cat'] });
    expect(items.find(i => i.id === 'petfood')!.requiredQty).toBe(21);
  });
  it('counts a partial quantity and copies only what is missing', () => {
    const item = { ...water(), ownedQty: 6, status: 'this_week' as const };
    expect(missingQuantity(item)).toBe(15);
    expect(coverage(item)).toBeCloseTo(6 / 21);
    expect(shoppingText([item])).toContain('あと15本');
  });
  it('never treats an old have checkbox as a verified quantity', () => {
    const legacy = { ...water(), ownedQty: undefined, status: 'have' as const };
    expect(calcScore([legacy])).toBe(0);
    const merged = mergeInventory(buildItems(family), [legacy]);
    expect(merged.find(i => i.id === 'water')!.ownedQty).toBeUndefined();
    expect(merged.find(i => i.id === 'water')!.status).toBe('have');
  });
  it('retains actual quantity when changing from 3 days to 7 days', () => {
    const old = buildItems({ ...family, targetDays: 3 }).map(i => ({ ...i, ownedQty: i.requiredQty, status: 'have' as const, plan: '古い数量の予定' }));
    const merged = mergeInventory(buildItems(family), old);
    const item = merged.find(i => i.id === 'water')!;
    expect(item.requiredQty).toBe(21); expect(item.ownedQty).toBe(9);
    expect(item.status).toBe('need'); expect(item.plan).toBeUndefined();
    expect(missingQuantity(item)).toBe(12);
  });
  it('preserves shopping plans when quantities have not changed', () => {
    const items = buildItems(family).map(i => ({ ...i, plan: '次の買い物', status: 'this_week' as const }));
    expect(mergeInventory(buildItems(family), items)[0].plan).toBe('次の買い物');
  });
  it('does not round incomplete inventory up to 100%', () => {
    expect(calcScore([{ ...water(), requiredQty: 10000, ownedQty: 9999 }])).toBe(99);
  });
  it('does not create zero-quantity food rows for an infant-only household', () => {
    expect(buildItems({ ...family, adults: 0, kidsInfant: 1 }).every(i => i.requiredQty > 0)).toBe(true);
  });
});
describe('expiry and reminders', () => {
  it('excludes expired stock from coverage and requests replacement', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 7, 12));
    const item: StockItem = { ...water(), ownedQty: 21, status: 'have', expiry: { year: 2026, month: 9, day: 6 } };
    expect(calcScore([item])).toBe(0); expect(missingQuantity(item)).toBe(21);
  });
  it('keeps an item through the actual expiry day, then marks it expired', () => {
    const item = { ...water(), expiry: { year: 2026, month: 9, day: 7 } };
    expect(expiryState(item, new Date(2026, 8, 7, 23, 59, 59, 999))).toBe('soon');
    expect(expiryState(item, new Date(2026, 8, 8))).toBe('expired');
  });
  it('uses the registered day for the 30-day calendar reminder', () => {
    const ics = buildICS([{ ...water(), expiry: { year: 2026, month: 10, day: 15 } }])!;
    expect(ics).toContain('DTSTART;VALUE=DATE:20260915');
    expect(ics).toContain('DTEND;VALUE=DATE:20260916');
    expect(ics).toContain('DTSTAMP:'); expect(ics).not.toContain('食べごろ');
  });
});
describe('backups and private sharing', () => {
  it('round-trips quantities, exact dates, repeated pets and family sheet in a backup', () => {
    const s = snapshot([{ ...water(), ownedQty: 5, expiry: { year: 2028, month: 2, day: 29 } }]);
    s.household = { ...family, pets: ['dog', 'dog'] };
    const parsed = parseImportJSON(JSON.stringify(s))!;
    expect(parsed.items[0].ownedQty).toBe(5); expect(parsed.items[0].expiry!.day).toBe(29);
    expect(parsed.household!.pets).toEqual(['dog', 'dog']); expect(parsed.sheet.memo).toBe('家族のメモ');
  });
  it('accepts old backups without quantities and exact dates', () => {
    expect(parseImportJSON(JSON.stringify(snapshot([{ ...water(), ownedQty: undefined, expiry: { year: 2027, month: 2 } }])))).not.toBeNull();
  });
  it('strips family notes and free-text shopping plans from shared links', () => {
    const shared = decodeShare(encodeShare(snapshot([{ ...water(), plan: '自宅住所などの私的なメモ', ownedQty: 3 }])))!;
    expect(shared.sheet.memo).toBe(''); expect(shared.items[0].plan).toBeUndefined(); expect(shared.items[0].ownedQty).toBe(3);
  });
  it.each([-1, Infinity, 10001, 1.5])('rejects invalid quantity %s', ownedQty => {
    expect(parseImportJSON(JSON.stringify(snapshot([{ ...water(), ownedQty }])))).toBeNull();
  });
  it('rejects impossible dates', () => {
    expect(parseImportJSON(JSON.stringify(snapshot([{ ...water(), expiry: { year: 2027, month: 2, day: 29 } }])))).toBeNull();
  });
  it('rejects duplicates, empty households and oversized backups', () => {
    expect(parseImportJSON(JSON.stringify(snapshot([water(), water()])))).toBeNull();
    expect(parseImportJSON(JSON.stringify({ ...snapshot(), household: { ...family, adults: 0 } }))).toBeNull();
    expect(parseImportJSON(' '.repeat(1_000_001))).toBeNull();
  });
});
