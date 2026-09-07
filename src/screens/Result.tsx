import { useStore } from '../store';
import { calcScore } from '../logic/score';
import { Card, PrimaryButton, GhostButton, PriorityBadge } from '../components/ui';
import { Icon } from '../components/Icon';
export function Result({ onStart }: { onStart: () => void }) {
  const { household, items, setTargetDays } = useStore();
  if (!household) return null;
  const people = household.adults + household.seniors + household.kidsInfant + household.kidsChild;
  return <div className="page narrow"><p className="eyebrow">わが家の備えが見えてきました</p><h1 className="page-title">{people}人・{household.targetDays}日分の備蓄リスト</h1><p className="lede">家にあるものを確認して、不足する分からそろえましょう。</p>
    <div className="segmented mt-5" role="group" aria-label="備蓄日数">{([3, 7] as const).map(d => <button key={d} aria-pressed={household.targetDays === d} onClick={() => setTargetDays(d)}>{d}日分{d === 7 ? '（推奨）' : 'から始める'}</button>)}</div>
    <Card className="mt-5 result-essentials"><h2 className="section-title">まず確認したい、水とトイレ</h2><div className="quantity-preview"><div><span>飲料・調理用の水</span><p>{people * household.targetDays * 3}<small>L</small></p><small>2Lボトル 約{Math.ceil(people * household.targetDays * 3 / 2)}本</small></div><div><span>携帯トイレ</span><p>{people * household.targetDays * 5}<small>回分</small></p><small>乳幼児はおむつ等で調整</small></div></div><PrimaryButton className="w-full" onClick={onStart}>家にある数を入力する <Icon name="arrow" size={18} /></PrimaryButton></Card>
    {(['S', 'A', 'B'] as const).map(p => <section key={p} className="mt-6"><PriorityBadge p={p} /><Card className="mt-2 divide-y divide-line p-0">{items.filter(i => i.priority === p).map(i => <div key={i.id} className="flex items-center justify-between gap-4 px-5 py-4"><span className="text-sm">{i.emoji} {i.name}</span><strong className="shrink-0 text-sm tabular-nums">{i.requiredQty}{i.unit}</strong></div>)}</Card></section>)}
    <p className="fine-print mt-5">水・トイレ・ボンベは公的資料から換算し、ほかの品目は公的資料を参考にした初期目安です。数量の根拠は「備蓄リスト」で確認できます。持病・アレルギー・食事量・ペットの体格などに合わせて調整してください。</p>
    <a className="source-link" href="https://disaportal.gsi.go.jp/" target="_blank" rel="noreferrer">ハザードマップで自宅周辺のリスクを確認 ↗</a>
    <div className="mt-6 grid gap-3"><PrimaryButton onClick={onStart}>このリストで備えを管理する <Icon name="arrow" size={18} /></PrimaryButton><GhostButton onClick={() => { void import('../logic/shareImage').then(m => m.downloadShareImage(calcScore(items))); }}>現在の準備率を画像で保存</GhostButton></div>
  </div>;
}
