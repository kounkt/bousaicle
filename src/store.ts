import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Household, SheetInfo, StockItem } from './types';
import { buildItems } from './data/stockMaster';
import { mergeInventory } from './logic/inventory';
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
    const key = 'bousaicle:storage-probe';
    const previous = localStorage.getItem(key);
    localStorage.setItem(key, '1');
    if (previous === null) localStorage.removeItem(key);
    else localStorage.setItem(key, previous);
    return true;
  } catch {
    return false;
  }
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      household: null,
      items: [],
      sheet: EMPTY_SHEET,
      storageOk: storageAvailable(),
      diagnose: (h) => set({ household: h, items: mergeInventory(buildItems(h), get().items) }),
      setTargetDays: (d) => {
        const h = get().household;
        if (!h) return;
        const nh = { ...h, targetDays: d };
        set({ household: nh, items: mergeInventory(buildItems(nh), get().items) });
      },
      updateItem: (id, patch) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      setSheet: (s) => set({ sheet: { ...get().sheet, ...s } }),
      importSnapshot: (s) => set({ household: s.household, items: s.household ? mergeInventory(buildItems(s.household), s.items) : [], sheet: s.sheet }),
      reset: () => set({ household: null, items: [], sheet: EMPTY_SHEET }),
    }),
    {
      name: 'bousaicle:v1',
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
        setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { queueMicrotask(() => { if (useStore.getState().storageOk) useStore.setState({ storageOk: false }); }); } },
        removeItem: (key) => { try { localStorage.removeItem(key); } catch { /* unavailable */ } },
      })),
      partialize: (s) => ({ household: s.household, items: s.items, sheet: s.sheet }),
      // localStorage が手動改ざん・破損していても安全に初期状態へ戻す(監査指摘)
      merge: (persisted, current) => {
        const parsed = snapshotSchema.safeParse(persisted);
        if (!parsed.success) return current;
        const snapshot = parsed.data as Snapshot;
        return { ...current, ...snapshot, items: snapshot.household ? mergeInventory(buildItems(snapshot.household), snapshot.items) : [] };
      },
      migrate: (state) => state as never,
    },
  ),
);
