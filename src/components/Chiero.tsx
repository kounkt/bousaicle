import type { ReactNode } from 'react';

// チエロ(SVG版)。docs/06_brand.md: 帽子は必ず大きく/目は半目が基本/赤・黒・白基調。
export type Face = 'normal' | 'smug' | 'happy' | 'hmm' | 'surprised';

export function ChieroSVG({ face = 'normal', size = 96 }: { face?: Face; size?: number }) {
  const eyes = (() => {
    switch (face) {
      case 'happy':
        return (
          <>
            <path d="M34 52 q5 -7 10 0" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M58 52 q5 -7 10 0" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="39" cy="52" r="5.5" fill="#fff" stroke="#111" strokeWidth="3" />
            <circle cx="63" cy="52" r="5.5" fill="#fff" stroke="#111" strokeWidth="3" />
          </>
        );
      default:
        // 半目(基本)
        return (
          <>
            <path d="M32 50 a7 7 0 0 1 14 0 z" fill="#fff" stroke="#111" strokeWidth="3" />
            <path d="M56 50 a7 7 0 0 1 14 0 z" fill="#fff" stroke="#111" strokeWidth="3" />
          </>
        );
    }
  })();

  const mouth = (() => {
    switch (face) {
      case 'smug':
        return <path d="M44 66 q8 6 16 -2" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'happy':
        return <path d="M42 64 q9 9 18 0" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'hmm':
        return <path d="M45 67 h12" stroke="#111" strokeWidth="3" strokeLinecap="round" />;
      case 'surprised':
        return <ellipse cx="51" cy="67" rx="5" ry="6.5" fill="#fff" stroke="#111" strokeWidth="3" />;
      default:
        return <path d="M45 66 q6 5 13 0" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 102 102" role="img" aria-label={`チエロ(${face})`}>
      {/* 顔 */}
      <circle cx="51" cy="56" r="34" fill="#FFF2D6" stroke="#111" strokeWidth="3.5" />
      {/* 前髪 */}
      <path d="M20 50 q-2 -18 12 -24 q18 -8 38 0 q14 6 12 24 q-8 -10 -16 -9 q-6 1 -14 -3 q-4 6 -14 7 q-10 1 -18 5 z" fill="#111" />
      {/* 帽子(大きく) */}
      <ellipse cx="51" cy="26" rx="48" ry="14" fill="#E60012" stroke="#111" strokeWidth="3.5" />
      <path d="M16 25 q0 -22 35 -22 q35 0 35 22 z" fill="#E60012" stroke="#111" strokeWidth="3.5" />
      <rect x="15" y="17" width="72" height="8" rx="2" fill="#111" />
      {/* 眉(知的に少し下げる) */}
      <path d="M32 42 q7 -4 14 -1" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M56 41 q7 -3 14 1" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {eyes}
      {mouth}
      {/* ほっぺ */}
      <circle cx="29" cy="62" r="3.5" fill="#E60012" opacity="0.25" />
      <circle cx="73" cy="62" r="3.5" fill="#E60012" opacity="0.25" />
    </svg>
  );
}

/** チエロ+吹き出し */
export function ChieroSays({ face = 'normal', children, small = false }: { face?: Face; children: ReactNode; small?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0">
        <ChieroSVG face={face} size={small ? 56 : 80} />
      </div>
      <div className="relative mt-2 rounded-xl border-2 border-ink bg-skin px-4 py-3 text-sm leading-relaxed">
        <span className="absolute -left-2 top-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-ink bg-skin" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
