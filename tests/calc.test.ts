import { describe, it, expect } from 'vitest';
import { buildItems } from '../src/data/stockMaster';
import { calcScore } from '../src/logic/score';
import { buildICS } from '../src/logic/ics';
import { encodeShare, decodeShare } from '../src/logic/share';
import type { Household } from '../src/types';

const base: Household = {
  version: 1, prefecture: '東京都', dwelling: 'apt_high',
  adults: 2, seniors: 0, kidsInfant: 0, kidsChild: 0,
  pets: [], flags: { allergy: false, medication: false }, targetDays: 7,
};

describe('buildItems', () => {
  it('大人2人・7日分: 水 = 3L×2人×7日 ÷2L = 21本', () => {
    const water = buildItems(base).find((i) => i.id === 'water')!;
    expect(water.requiredQty).toBe(21);
  });

  it('大人2人・7日分: 主食 = 3食×2人×7日 = 42食', () => {
    expect(buildItems(base).find((i) => i.id === 'staple')!.requiredQty).toBe(42);
  });

  it('大人2人・7日分: トイレ = 5回×2人×7日 = 70回分', () => {
    expect(buildItems(base).find((i) => i.id === 'toilet')!.requiredQty).toBe(70);
  });

  it('3日分に切り替えると水 = ceil(3×2×3/2) = 9本', () => {
    const water = buildItems({ ...base, targetDays: 3 }).find((i) => i.id === 'water')!;
    expect(water.requiredQty).toBe(9);
  });

  it('乳幼児がいるとおむつ・ミルクが追加される(主食の人数には入らない)', () => {
    const items = buildItems({ ...base, kidsInfant: 1 });
    expect(items.find((i) => i.id === 'diaper')!.requiredQty).toBe(56); // 8枚×7日×1人
    expect(items.find((i) => i.id === 'milk')).toBeTruthy();
    expect(items.find((i) => i.id === 'staple')!.requiredQty).toBe(42); // 大人2人分のまま
    expect(items.find((i) => i.id === 'water')!.requiredQty).toBe(32); // 3人分: ceil(63/2)
  });

  it('65歳以上がいると薬・介護食が追加される', () => {
    const items = buildItems({ ...base, seniors: 1 });
    expect(items.find((i) => i.id === 'medicine')).toBeTruthy();
    expect(items.find((i) => i.id === 'carefood')).toBeTruthy();
  });

  it('服薬フラグだけでも薬が追加される', () => {
    const items = buildItems({ ...base, flags: { allergy: false, medication: true } });
    expect(items.find((i) => i.id === 'medicine')).toBeTruthy();
  });

  it('ペットがいるとペットフードが頭数×日数で追加される', () => {
    const items = buildItems({ ...base, pets: ['dog', 'cat'] });
    expect(items.find((i) => i.id === 'petfood')!.requiredQty).toBe(14);
  });

  it('アレルギーフラグで対応食が追加される', () => {
    const items = buildItems({ ...base, flags: { allergy: true, medication: false } });
    expect(items.find((i) => i.id === 'allergyfood')).toBeTruthy();
  });
});

describe('calcScore', () => {
  it('全部 need なら 0 点', () => {
    expect(calcScore(buildItems(base))).toBe(0);
  });

  it('全部 have なら 100 点', () => {
    const items = buildItems(base).map((i) => ({ ...i, status: 'have' as const }));
    expect(calcScore(items)).toBe(100);
  });

  it('優先度Sの方がスコアへの寄与が大きい', () => {
    const items = buildItems(base);
    const sDone = items.map((i) => (i.priority === 'S' ? { ...i, status: 'have' as const } : i));
    const bDone = items.map((i) => (i.priority === 'B' ? { ...i, status: 'have' as const } : i));
    expect(calcScore(sDone)).toBeGreaterThan(calcScore(bDone));
  });
});

describe('ICS', () => {
  it('期限つき品目から VEVENT を生成する', () => {
    const items = buildItems(base).map((i) =>
      i.id === 'water' ? { ...i, expiry: { year: 2027, month: 6 } } : i,
    );
    const ics = buildICS(items)!;
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('飲料水');
  });

  it('期限がなければ null', () => {
    expect(buildICS(buildItems(base))).toBeNull();
  });
});

describe('share', () => {
  it('エンコード→デコードで往復できる', () => {
    const snap = { household: base, items: buildItems(base), sheet: { meetingPoint: '公園', evacSite: '小学校', memo: '' } };
    const decoded = decodeShare(encodeShare(snap));
    expect(decoded).not.toBeNull();
    expect(decoded!.household!.adults).toBe(2);
    expect(decoded!.items.length).toBe(snap.items.length);
  });

  it('壊れたデータは null を返す', () => {
    expect(decodeShare('garbage!!')).toBeNull();
  });
});
