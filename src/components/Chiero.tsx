import type { ReactNode } from 'react';

// チエロ(イラスト版)。デザインシート準拠の生成イラストを使用。
// docs/06_brand.md: 帽子は必ず大きく/赤・黒・白基調/1画面に1体まで。
export type Face = 'normal' | 'smug' | 'happy' | 'hmm' | 'surprised';

const BASE = import.meta.env.BASE_URL;

/** チエロ全身(ランディングのヒーロー用) */
export function ChieroHero({ size = 200, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={`${BASE}chiero/hero.webp`}
      width={size}
      height={size}
      alt="チエロ"
      draggable={false}
      className={`select-none ${className}`}
    />
  );
}

/** Face framing uses the complete original illustration; face.webp is already cut at the chin. */
export function ChieroFace({ size = 60, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="55 -30 450 415"
      role="img"
      aria-label="チエロ"
      className={`select-none shrink-0 ${className}`}
      style={{ overflow: 'hidden', flexShrink: 0 }}
    >
      {/* Source is 560 x 560. The full head ends near y=350; this frame includes y=385. */}
      <image href={`${BASE}chiero/hero.webp`} width="560" height="560" />
    </svg>
  );
}

/** チエロ+吹き出し(face は将来の表情差分用に受け取るが現状は共通イラスト) */
export function ChieroSays({ children, small = false }: { face?: Face; children: ReactNode; small?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <ChieroFace size={small ? 48 : 64} className="-mt-1 shrink-0" />
      <div className="relative mt-1 rounded-xl border border-line bg-skin px-4 py-3 text-sm leading-relaxed">
        <span className="absolute -left-2 top-4 h-4 w-4 rotate-45 border-b border-l border-line bg-skin" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
