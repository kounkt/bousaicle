import { z } from 'zod';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Household, SheetInfo, StockItem } from '../types';

// 共有URL・インポートJSONの検証スキーマ。
// 他人のリンク/ファイルから読むデータは必ずここを通す(docs/07_tech.md)。
const householdSchema = z.object({
  version: z.literal(1),
  prefecture: z.string().max(10),
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
  id: z.string().max(40),
  name: z.string().max(80),
  emoji: z.string().max(8),
  category: z.enum(['water', 'staple', 'main', 'side', 'toilet', 'heat', 'power', 'baby', 'senior', 'pet', 'common']),
  priority: z.enum(['S', 'A', 'B']),
  requiredQty: z.number().min(0).max(10000),
  unit: z.string().max(10),
  note: z.string().max(200).optional(),
  expirable: z.boolean(),
  status: z.enum(['have', 'need', 'this_week']),
  expiry: z.object({ year: z.number().int().min(2020).max(2100), month: z.number().int().min(1).max(12) }).nullable().optional(),
  plan: z.string().max(200).optional(),
});

const sheetSchema = z.object({
  meetingPoint: z.string().max(100),
  evacSite: z.string().max(100),
  memo: z.string().max(300),
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

export function encodeShare(s: Snapshot): string {
  return compressToEncodedURIComponent(JSON.stringify(s));
}

export function decodeShare(encoded: string): Snapshot | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = snapshotSchema.safeParse(JSON.parse(json));
    return parsed.success ? (parsed.data as Snapshot) : null;
  } catch {
    return null;
  }
}

export function parseImportJSON(text: string): Snapshot | null {
  try {
    const parsed = snapshotSchema.safeParse(JSON.parse(text));
    return parsed.success ? (parsed.data as Snapshot) : null;
  } catch {
    return null;
  }
}
