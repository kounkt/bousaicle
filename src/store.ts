import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Household, SheetInfo, StockItem } from './types';
import { buildItems } from './data/stockMaster';
import { snapshotSchema, type Snapshot } from './logic/share';

interface AppStore {
  household: Household | null;
  items: StockItem[];
  sheet: SheetInfo;
  storageOk: boolean;
  diagnose: (h: Household) => void;
  setTargetDays: (d: 3 | 7) => void;
  updateItem: (id: string, patch: Partial<StockItem>) => void;
  setSheet: (s: Partial<SheetInfo>) => void;
  importSnapshot: (s: Snapshot) => void;
  reset: () => void;
}

const EMPTY_SHEET: SheetInfo = { meetingPoint: '', evacSite: '', memo: '' };

function storageAvailable(): boolean {
  try {
    localStorage.setItem('__t', '1');
    localStorage.removeItem('__t');
    return true;
  } catch {
    return false;
  }
}

/** 再診断時: 新リストに旧リストのチェック状態・期限・プランを引き継ぐ */
function mergeItems(next: StockItem[], prev: StockItem[]): StockItem[] {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  return next.map((i) => {
    const old = prevMap.get(i.id);
    return old ? { ...i, status: old.status, expiry: old.expiry, plan: old.plan } : i;
  });
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      household: null,
      items: [],
      sheet: EMPTY_SHEET,
      storageOk: storageAvailable(),
      diagnose: (h) => set({ household: h, items: mergeItems(buildItems(h), get().items) }),
      setTargetDays: (d) => {
        const h = get().household;
        if (!h) return;
        const nh = { ...h, targetDays: d };
        set({ household: nh, items: mergeItems(buildItems(nh), get().items) });
      },
      updateItem: (id, patch) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      setSheet: (s) => set({ sheet: { ...get().sheet, ...s } }),
      importSnapshot: (s) => set({ household: s.household, items: s.items, sheet: s.sheet }),
      reset: () => set({ household: null, items: [], sheet: EMPTY_SHEET }),
    }),
    {
      name: 'bousaicle:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ household: s.household, items: s.items, sheet: s.sheet }),
      // localStorage が手動改ざん・破損していても安全に初期状態へ戻す(監査指摘)
      merge: (persisted, current) => {
        const parsed = snapshotSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...(parsed.data as Snapshot) } : current;
      },
      migrate: (state) => state as never,
    },
  ),
);
