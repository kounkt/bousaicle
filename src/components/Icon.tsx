import type { CSSProperties } from 'react';
export type IconName = 'home' | 'list' | 'cycle' | 'sheet' | 'shield' | 'settings' | 'arrow' | 'water' | 'check' | 'clock' | 'external' | 'share';
const paths: Record<IconName, string> = {
  share: 'M12 16V3m-5 5 5-5 5 5M5 13H3v8h18v-8h-2',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  list: 'M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01',
  cycle: 'M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6',
  sheet: 'M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8Zm0 0v6h6M8 13h8M8 17h6',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM12 7v6m0 4h.01',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  water: 'M12 2C9 7 4 11 4 15a8 8 0 0 0 16 0c0-4-5-8-8-13ZM8 15a4 4 0 0 0 4 4',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v5l3 2',
  external: 'M14 3h7v7m0-7L10 14M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6',
};
export function Icon({ name, size = 22, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
