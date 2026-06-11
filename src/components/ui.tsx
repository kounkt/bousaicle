import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border-2 border-ink bg-white p-4 shadow-[3px_3px_0_rgba(17,17,17,0.15)] ${className}`}>{children}</div>;
}

export function PrimaryButton({ children, onClick, className = '', disabled = false }: {
  children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border-2 border-ink bg-brand px-6 py-3.5 text-base font-bold text-white shadow-[3px_3px_0_#111] transition hover:bg-brand-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = '' }: {
  children: ReactNode; onClick?: () => void; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold shadow-[2px_2px_0_rgba(17,17,17,0.4)] transition hover:bg-paper active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

/** そなえスコアのリングゲージ */
export function ScoreRing({ score, size = 150 }: { score: number; size?: number }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label={`そなえスコア ${score}点`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#EDEDED" strokeWidth="13" />
      <circle
        cx="70" cy="70" r={r} fill="none" stroke="#E60012" strokeWidth="13" strokeLinecap="round"
        strokeDasharray={`${(c * clamped) / 100} ${c}`} transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="70" y="74" textAnchor="middle" fontSize="38" fontWeight="700" fill="#111111">{score}</text>
      <text x="70" y="96" textAnchor="middle" fontSize="13" fill="#888888">/100点</text>
    </svg>
  );
}

export function PriorityBadge({ p }: { p: 'S' | 'A' | 'B' }) {
  const style =
    p === 'S' ? 'bg-brand text-white' : p === 'A' ? 'bg-ink text-white' : 'bg-paper text-ink border border-line';
  const label = p === 'S' ? '最優先' : p === 'A' ? '1週間の生活' : 'あると安心';
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-bold ${style}`}>
      {p}<span className="font-normal">{label}</span>
    </span>
  );
}

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
