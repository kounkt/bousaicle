import { z } from 'zod';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Household, SheetInfo, StockItem } from '../types';

// 共有URL・インポートJSON・localStorage復元の検証スキーマ。
// 外部から入るデータは必ずここを通す(docs/07_tech.md)。
// 改行はICSインジェクション等の温床になるため、単一行フィールドでは禁止(監査指摘)。
const line = (max: number) => z.string().max(max).regex(/^[^\r\n]*$/);

const householdSchema = z.object({
  version: z.literal(1),
  prefecture: line(10),
  dwelling: z.enum(['house', 'apt_low', 'apt_high']),
  adults: z.number().int().min(0).max(20),
  seniors: z.number().int().min(0).max(20),
  kidsInfant: z.number().int().min(0).max(20),
  kidsChild: z.number().int().min(0).max(20),
  pets: z.array(z.enum(['dog', 'cat', 'other'])).max(3),
  flags: z.object({ allergy: z.boolean(), medication: z.boolean() }),
  targetDays: z.union([z.literal(3), z.literal(7)]),
});

const itemSchema = z.object({
  id: z.string().max(40).regex(/^[A-Za-z0-9_-]+$/),
  name: line(80),
  emoji: line(8),
  category: z.enum(['water', 'staple', 'main', 'side', 'toilet', 'heat', 'power', 'baby', 'senior', 'pet', 'common']),
  priority: z.enum(['S', 'A', 'B']),
  requiredQty: z.number().min(0).max(10000),
  unit: line(10),
  note: line(200).optional(),
  expirable: z.boolean(),
  status: z.enum(['have', 'need', 'this_week']),
  expiry: z.object({ year: z.number().int().min(2020).max(2100), month: z.number().int().min(1).max(12) }).nullable().optional(),
  plan: line(200).optional(),
});

const sheetSchema = z.object({
  meetingPoint: line(100),
  evacSite: line(100),
  memo: line(300),
});

export const snapshotSchema = z.object({
  household: householdSchema.nullable(),
  items: z.array(itemSchema).max(100),
  sheet: sheetSchema,
});

export type Snapshot = {
  household: Household | null;
  items: StockItem[];
  sheet: SheetInfo;
};

const EMPTY_SHEET: SheetInfo = { meetingPoint: '', evacSite: '', memo: '' };

// 解凍前後のサイズ上限(zip bomb的な巨大データ対策)
const MAX_ENCODED = 100_000;
const MAX_JSON = 500_000;

export function encodeShare(s: Snapshot): string {
  // 共有リンクには集合場所・避難先・家族メモ(最も機微な情報)を含めない。
  // 備蓄リストの共有が目的であり、シートは各家庭で印刷して使う(監査指摘)。
  const safe: Snapshot = { household: s.household, items: s.items, sheet: EMPTY_SHEET };
  return compressToEncodedURIComponent(JSON.stringify(safe));
}

export function decodeShare(encoded: string): Snapshot | null {
  try {
    if (encoded.length > MAX_ENCODED) return null;
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json || json.length > MAX_JSON) return null;
    const parsed = snapshotSchema.safeParse(JSON.parse(json));
    return parsed.success ? (parsed.data as Snapshot) : null;
  } catch {
    return null;
  }
}

export function parseImportJSON(text: string): Snapshot | null {
  try {
    if (text.length > 1_000_000) return null;
    const parsed = snapshotSchema.safeParse(JSON.parse(text));
    return parsed.success ? (parsed.data as Snapshot) : null;
  } catch {
    return null;
  }
}
