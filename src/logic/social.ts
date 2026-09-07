import type { StockItem } from '../types';
import { coverage } from './inventory';

/** Public promotion always uses this clean URL, never location.href or a family #share payload. */
export const PUBLIC_APP_URL = 'https://chiero.jp/bousaicle/';
export const APP_SHARE_TITLE = 'ボウサイクル｜わが家の防災ノート';
export type ShareMoment = 'intro' | 'started' | 'basics';
export type PublicShare = {
  moment: ShareMoment;
  headline: string[];
  description: string;
  text: string;
  url: string;
  score?: number;
};
export function getShareMoment(hasHousehold: boolean, items: StockItem[]): ShareMoment {
  if (!hasHousehold) return 'intro';
  const basics = ['water', 'toilet'].map(id => items.find(item => item.id === id));
  return basics.every(item => item && item.requiredQty > 0 && coverage(item) === 1) ? 'basics' : 'started';
}
const MESSAGES = {
  intro: {
    headline: ['わが家の備え、', '何から始める？'],
    description: '3分で必要な備蓄がわかる。',
    text: '防災の備え、何から始める？\n家族に必要な備蓄と、買い足す量がわかる「ボウサイクル」。登録不要・無料。\n次の買い物の前に、のぞいてみて。',
  },
  started: {
    headline: ['わが家の備え、', 'はじめました。'],
    description: '次の買い物で、ひとつずつ。',
    text: 'わが家の備蓄リストを作ってみました。\n全部いっぺんに、じゃなくて、次の買い物でひとつずつ。\nボウサイクルで、あなたの家の備えも見てみませんか。',
  },
  basics: {
    headline: ['水とトイレ、', 'そろえました。'],
    description: 'あとは使って、買い足す習慣に。',
    text: '水と携帯トイレ、備蓄の目安の数量をそろえました。\nこれからも期限を見て、使って、買い足していこう。\nボウサイクルで、わが家の備えを少しずつ。',
  },
} as const;

/** Only a fixed public message and an explicitly opted-in aggregate may leave the app. */
export function buildPublicShare(moment: ShareMoment, score?: number): PublicShare {
  const content = MESSAGES[moment];
  const safeScore = moment !== 'intro' && score !== undefined && Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.floor(score))) : undefined;
  return {
    moment, headline: [...content.headline], description: content.description,
    text: `${content.text}${safeScore === undefined ? '' : `\n備蓄の準備率：${safeScore}%（数量の目安）`}\n#ボウサイクル #防災`,
    url: PUBLIC_APP_URL,
    ...(safeScore === undefined ? {} : { score: safeScore }),
  };
}
export function fullShareText(share: PublicShare): string {
  return `${share.text}\n${PUBLIC_APP_URL}`;
}
export function socialLinks(share: PublicShare) {
  const x = new URL('https://twitter.com/intent/tweet');
  x.searchParams.set('text', share.text);
  x.searchParams.set('url', PUBLIC_APP_URL);
  const line = new URL('https://social-plugins.line.me/lineit/share');
  line.searchParams.set('url', PUBLIC_APP_URL);
  line.searchParams.set('text', share.text);
  return { x: x.href, line: line.href };
}
export async function shareWithDevice(share: PublicShare, file?: File): Promise<'unavailable' | 'cancelled' | 'handed-off'> {
  if (!navigator.share) return 'unavailable';
  if (file && (!navigator.canShare || !navigator.canShare({ files: [file] }))) return 'unavailable';
  try {
    await navigator.share(file ? { title: APP_SHARE_TITLE, text: fullShareText(share), files: [file] } : { title: APP_SHARE_TITLE, text: share.text, url: PUBLIC_APP_URL });
    return 'handed-off';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    throw error;
  }
}
