import { useState } from 'react';
import type { StockItem, Status } from '../types';
import { useStore } from '../store';
import { calcScore } from '../logic/score';
import { ChieroSays } from '../components/Chiero';
import { Card, PriorityBadge } from '../components/ui';

const WHEN = ['今日', '明日', '今週の土曜', '今週の日曜', '次の買い物のとき'];
const WHERE = ['いつものスーパー', 'ドラッグストア', 'ホームセンター', 'コンビニ', 'ネット通販'];

function PlanBuilder({ item, onSave }: { item: StockItem; onSave: (plan: string) => void }) {
  const [when, setWhen] = useState(WHEN[4]);
  const [where, setWhere] = useState(WHERE[0]);
  const plan = `${when}、${where}のついでに ${item.name}(${item.requiredQty}${item.unit})を買う`;
  const sel = 'rounded-lg border-2 border-ink bg-white px-2 py-2 text-sm';
  return (
    <div className="mt-2 rounded-lg bg-paper p-3">
      <p className="text-xs font-bold text-ink/70">いつ・どこで買う?(決めた人は実行率が段ちがい)</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <select aria-label="いつ" value={when} onChange={(e) => setWhen(e.target.value)} className={sel}>
          {WHEN.map((w) => <option key={w}>{w}</option>)}
        </select>
        <select aria-label="どこで" value={where} onChange={(e) => setWhere(e.target.value)} className={sel}>
          {WHERE.map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>
      <p className="mt-2 text-sm font-bold">「{plan}」</p>
      <button type="button" onClick={() => onSave(plan)}
        className="mt-2 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white">このプランで決定</button>
    </div>
  );
}

export function Checklist() {
  const { items, updateItem } = useStore();
  const score = calcScore(items);
  const thisWeek = items.filter((i) => i.status === 'this_week');

  const setStatus = (i: StockItem, s: Status) =>
    updateItem(i.id, { status: s, ...(s !== 'this_week' ? { plan: undefined } : {}) });

  const toggle = (selected: boolean) =>
    `rounded-md border-2 px-2.5 py-1.5 text-xs font-bold transition ${
      selected ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink/70 hover:border-ink'
    }`;

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">そろえる</h1>
        <span className="text-sm font-bold">スコア {score}点</span>
      </div>

      {items.length === 0 ? (
        <ChieroSays face="hmm">まだリストがないよ。「しらべる」から3分診断やってみよ。</ChieroSays>
      ) : (
        <>
          {score === 0 && (
            <div className="mb-4">
              <ChieroSays face="normal">ゼロからが一番伸びる。まず水だけ、今週そろえよ。</ChieroSays>
            </div>
          )}
          {thisWeek.length > 0 && (
            <Card className="mb-4 border-brand">
              <p className="text-sm font-bold text-brand">📝 今週のプラン({thisWeek.length}件)</p>
              <ul className="mt-1 space-y-1">
                {thisWeek.map((i) => (
                  <li key={i.id} className="text-sm">{i.plan ?? `${i.emoji} ${i.name}`}</li>
                ))}
              </ul>
            </Card>
          )}
          <div className="space-y-3">
            {items.map((i) => (
              <Card key={i.id} className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{i.emoji} {i.name}</p>
                    <p className="mt-0.5 text-xs text-ink/60">必要量: <b className="tabular-nums">{i.requiredQty}{i.unit}</b>{i.note && ` — ${i.note}`}</p>
                  </div>
                  <PriorityBadge p={i.priority} />
                </div>
                <div className="mt-2.5 flex gap-2" role="group" aria-label={`${i.name}の状態`}>
                  <button type="button" className={toggle(i.status === 'have')} onClick={() => setStatus(i, 'have')}>✔ 持ってる</button>
                  <button type="button" className={toggle(i.status === 'need')} onClick={() => setStatus(i, 'need')}>持ってない</button>
                  <button type="button" className={toggle(i.status === 'this_week')} onClick={() => setStatus(i, 'this_week')}>🛒 今週そろえる</button>
                </div>
                {i.status === 'this_week' && !i.plan && (
                  <PlanBuilder item={i} onSave={(plan) => updateItem(i.id, { plan })} />
                )}
                {i.status === 'this_week' && i.plan && (
                  <p className="mt-2 rounded-lg bg-skin px-3 py-2 text-sm">
                    📝 {i.plan}{' '}
                    <button type="button" className="underline" onClick={() => updateItem(i.id, { plan: undefined })}>編集</button>
                  </p>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
