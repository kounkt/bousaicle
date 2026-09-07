import type { StockItem } from '../types';
import { coverage } from './inventory';

const WEIGHT = { S: 3, A: 2, B: 1 } as const;

/** そなえスコア(0-100)。優先度Sの重みを大きく。 */
export function calcScore(items: StockItem[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((s, i) => s + WEIGHT[i.priority], 0);
  const done = items.reduce((s, i) => s + WEIGHT[i.priority] * coverage(i), 0);
  return Math.floor((100 * done) / total + 1e-9);
}

/** スコア帯ごとのチエロのコメント(煽らない。docs/04 参照) */
export function scoreComment(score: number): { face: 'normal' | 'smug' | 'happy' | 'hmm' | 'surprised'; text: string } {
  if (score <= 10) return { face: 'normal', text: 'まずは家にある水とトイレの数を入れてみよう。足りない分が見えてくるよ。' };
  if (score <= 65) return { face: 'normal', text: '次の買い物で、足りないものをひとつずつ。ふだん使うものからで大丈夫。' };
  return { face: 'happy', text: '数量の記録が進んでいるね。期限と保管場所も、家族で確認しておこう。' };
}
