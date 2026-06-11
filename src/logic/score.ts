import type { StockItem } from '../types';

const WEIGHT = { S: 3, A: 2, B: 1 } as const;

/** そなえスコア(0-100)。優先度Sの重みを大きく。 */
export function calcScore(items: StockItem[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((s, i) => s + WEIGHT[i.priority], 0);
  const done = items.filter((i) => i.status === 'have').reduce((s, i) => s + WEIGHT[i.priority], 0);
  return Math.round((100 * done) / total);
}

/** スコア帯ごとのチエロのコメント(煽らない。docs/04 参照) */
export function scoreComment(score: number): { face: 'normal' | 'smug' | 'happy' | 'hmm' | 'surprised'; text: string } {
  if (score <= 10) return { face: 'surprised', text: 'おっ、まっさらだね。つまり、これから全部良くなるってこと。' };
  if (score <= 35) return { face: 'normal', text: 'まず水とトイレだけ先に埋めよ。そこが本体だから。' };
  if (score <= 65) return { face: 'hmm', text: '半分まで来てる。いい調子。次の買い物で1個だけ足そ。' };
  if (score <= 85) return { face: 'smug', text: 'かなりいいね。あとは「まわす」だけ。それができたら本物。' };
  return { face: 'happy', text: '…やるじゃん。期限の管理までできてたら、もう先生って呼ぶよ。' };
}
