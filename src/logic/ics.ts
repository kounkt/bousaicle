import type { StockItem } from '../types';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

// RFC 5545 TEXT エスケープ。共有リンク経由のデータが流れ込むため、
// 改行・特殊文字によるプロパティ/VEVENT注入を防ぐ(セキュリティ監査指摘)。
function escText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// UID は英数とハイフン・アンダースコアのみに正規化
function safeUid(s: string): string {
  return s.replace(/[^A-Za-z0-9_-]/g, '');
}

/** 期限の30日前に終日イベントを置く ICS を生成(目標名入りリマインダー: Karlan et al. 2016) */
export function buildICS(items: StockItem[]): string | null {
  const withExpiry = items.filter((i) => i.expiry);
  if (withExpiry.length === 0) return null;

  const events = withExpiry.map((i) => {
    const e = i.expiry!;
    const end = new Date(e.year, e.month, 0); // 月末
    const remind = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 30);
    const next = new Date(remind.getFullYear(), remind.getMonth(), remind.getDate() + 1);
    return [
      'BEGIN:VEVENT',
      `UID:${safeUid(i.id)}-${e.year}${pad(e.month)}@bousaicle`,
      `DTSTART;VALUE=DATE:${icsDate(remind)}`,
      `DTEND;VALUE=DATE:${icsDate(next)}`,
      `SUMMARY:${escText(`【ボウサイクル】${i.name} がそろそろ食べごろ(期限 ${e.year}/${e.month})`)}`,
      `DESCRIPTION:${escText('ふだんのごはんで食べて、減ったぶんを買い足そう。それがローリングストック。')}`,
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bousaicle//JP',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(items: StockItem[]): boolean {
  const ics = buildICS(items);
  if (!ics) return false;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bousaicle-reminders.ics';
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
