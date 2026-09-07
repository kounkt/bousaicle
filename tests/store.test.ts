import { afterEach, expect, it, vi } from 'vitest';
import type { Household } from '../src/types';
const family: Household = { version: 1, prefecture: '', dwelling: 'house', adults: 2, seniors: 0, kidsInfant: 0, kidsChild: 0, pets: [], flags: { allergy: false, medication: false }, targetDays: 3 };
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
it('persists actual counts through target changes and a fresh application load', async () => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) });
  vi.resetModules();
  const { useStore } = await import('../src/store');
  useStore.getState().diagnose(family);
  useStore.getState().updateItem('water', { ownedQty: 9, status: 'have' });
  useStore.getState().setTargetDays(7);
  expect(useStore.getState().items.find(i => i.id === 'water')).toMatchObject({ requiredQty: 21, ownedQty: 9, status: 'need' });
  vi.resetModules();
  const { useStore: reopened } = await import('../src/store');
  expect(reopened.getState().items.find(i => i.id === 'water')).toMatchObject({ requiredQty: 21, ownedQty: 9 });
});
it('continues in memory and surfaces storage failures without a retry loop', async () => {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); }, removeItem: () => {} });
  vi.resetModules();
  const { useStore } = await import('../src/store');
  expect(() => useStore.getState().diagnose(family)).not.toThrow();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(useStore.getState().storageOk).toBe(false);
  expect(useStore.getState().items.length).toBeGreaterThan(0);
});
