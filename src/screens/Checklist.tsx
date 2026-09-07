import { useState } from 'react';
import type { StockItem } from '../types';
import { useStore } from '../store';
import { calcScore } from '../logic/score';
import { missingQuantity, ownedQuantity, shoppingText } from '../logic/inventory';
import { expiryState } from '../logic/expiry';
import { Card, PriorityBadge, PrimaryButton } from '../components/ui';
import { Icon } from '../components/Icon';

const WHEN = ['今日', '明日', '今週の土曜', '今週の日曜', '次の買い物のとき'];
const WHERE = ['いつものスーパー', 'ドラッグストア', 'ホームセンター', 'コンビニ', 'ネット通販'];
function PlanBuilder({ item, onSave }: { item: StockItem; onSave: (plan: string) => void }) {
  const [when, setWhen] = useState(WHEN[4]);
  const [where, setWhere] = useState(WHERE[0]);
  return <div className="plan-builder"><p className="text-sm font-bold">買い足すタイミングを決める</p><div className="mt-2 flex flex-wrap gap-2">
    <select aria-label={`${item.name}を買う日`} value={when} onChange={e => setWhen(e.target.value)}>{WHEN.map(w => <option key={w}>{w}</option>)}</select>
    <select aria-label={`${item.name}を買う場所`} value={where} onChange={e => setWhere(e.target.value)}>{WHERE.map(w => <option key={w}>{w}</option>)}</select>
    <button className="ghost-button" onClick={() => onSave(`${when}、${where}で買い足す`)}>予定を保存</button>
  </div></div>;
}
export function Checklist({ onStart }: { onStart: () => void }) {
  const { household, items, updateItem, setTargetDays } = useStore();
  const [filter, setFilter] = useState<'all' | 'missing' | 'priority' | 'week'>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const missing = items.filter(i => missingQuantity(i) > 0);
  const shown = items.filter(i => (filter !== 'missing' || missingQuantity(i) > 0) && (filter !== 'priority' || i.priority === 'S') && (filter !== 'week' || i.status === 'this_week')).filter(i => `${i.name} ${i.note ?? ''}`.includes(query.trim()));
  const setQuantity = (item: StockItem, qty: number) => {
    if (!Number.isFinite(qty)) return;
    const ownedQty = Math.min(10000, Math.max(0, Math.floor(qty)));
    updateItem(item.id, { ownedQty, status: ownedQty >= item.requiredQty ? 'have' : item.status === 'this_week' ? 'this_week' : 'need', plan: ownedQty >= item.requiredQty ? undefined : item.plan });
  };
  const copy = async () => {
    const list = shoppingText(filter === 'week' ? items.filter(i => i.status === 'this_week') : missing);
    try { await navigator.clipboard.writeText(list); setMessage('買い足すものをコピーしました。メモやLINEに貼り付けられます。'); }
    catch { setMessage('コピーできませんでした。下のテキストを選択してください。'); setCopyText(list); }
  };
  const [copyText, setCopyText] = useState('');
  return <div className="page narrow"><p className="eyebrow">そろえる</p><div className="section-heading"><h1 className="page-title">わが家の備蓄リスト</h1>{household && <span className="completion-label">準備率 <b>{calcScore(items)}%</b></span>}</div>
    {!household ? <Card className="mt-5"><h2 className="section-title">家族に合う備えから始めましょう。</h2><p className="lede mt-2">人数や年齢から、備蓄の目安を作ります。</p><PrimaryButton className="mt-5" onClick={onStart}>備蓄リストを作る <Icon name="arrow" /></PrimaryButton></Card> : <>
      <p className="lede">家にある数を入れると、買い足す量が分かります。</p>
      <div className="list-toolbar"><div className="segmented" role="group" aria-label="備蓄日数">{([3, 7] as const).map(d => <button key={d} aria-pressed={household.targetDays === d} onClick={() => setTargetDays(d)}>{d}日分{d === 7 ? '（推奨）' : ''}</button>)}</div><button className="ghost-button" onClick={copy} disabled={!missing.length}>買い物リストをコピー</button></div>
      <p className="fine-print mb-4">準備率は優先度を重み付けした数量の割合です。期限切れは除外、期限未登録は数量のみ反映。安全を保証するものではありません。</p>
      {items.some(i => i.status === 'have' && i.ownedQty === undefined) && <p className="notice mb-4">以前の「持っている」は引き継いでいます。数量が未確認のため、家にある数を入力するまで準備率に含めません。</p>}
      <label className="search-field"><Icon name="list" size={18} /><input aria-label="品目を検索" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="品目を探す（水・食料・電池など）" /></label>
      <div className="filter-tabs" role="group" aria-label="品目の絞り込み">{([['all', 'すべて'], ['missing', `不足あり ${missing.length}`], ['priority', '最優先'], ['week', '買い物予定']] as const).map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
      {message && <p role="status" className="notice mb-4">{message}</p>}{copyText && <textarea className="copy-fallback" aria-label="買い物リストのテキスト" value={copyText} readOnly onFocus={e => e.target.select()} />}
      <div className="stock-list">{shown.map(i => {
        const needed = missingQuantity(i); const expired = expiryState(i) === 'expired';
        return <Card key={i.id} className={`stock-card ${needed === 0 ? 'stock-complete' : ''}`}>
          <div className="stock-title"><span className="item-symbol" aria-hidden="true">{i.emoji}</span><div><h2>{i.name}</h2><p className="fine-print">目安 <b>{i.requiredQty}{i.unit}</b></p></div><PriorityBadge p={i.priority} /></div>
          <p className="stock-note">{i.note?.replace(/\[出典\d\]/g, '')}{i.note?.match(/\[出典(\d)\]/) && <a href={`#source-${i.note.match(/\[出典(\d)\]/)![1]}`} className="ml-1 underline">根拠</a>}</p>
          <div className="stock-quantity"><label htmlFor={`qty-${i.id}`}>家にある数</label><div className="quantity-input"><input id={`qty-${i.id}`} type="number" inputMode="numeric" min="0" max="10000" step="1" value={i.ownedQty ?? ''} placeholder="未確認" onChange={e => { if (e.target.value === '') { updateItem(i.id, { ownedQty: undefined, status: 'need' }); } else setQuantity(i, Number(e.target.value)); }} /><span>{i.unit}</span></div><span className={`remaining ${needed === 0 ? 'complete' : ''}`}>{needed > 0 ? `あと ${needed}${i.unit}` : '数量を確保'}</span></div>
          {expired && <p className="stock-warning">期限を過ぎています。残量と期限を確認するまで、この品目は準備率から除きます。</p>}
          <div className="stock-actions"><button onClick={() => setQuantity(i, i.requiredQty)} className="text-button"><Icon name="check" size={16} />目安の数量がある</button>{needed > 0 && <button className="text-button" aria-pressed={i.status === 'this_week'} onClick={() => updateItem(i.id, { status: i.status === 'this_week' ? 'need' : 'this_week', plan: undefined })}>{i.status === 'this_week' ? '予定を解除' : '買う予定に入れる'} <Icon name="arrow" size={16} /></button>}</div>
          {i.status === 'this_week' && !i.plan && <PlanBuilder item={i} onSave={plan => updateItem(i.id, { plan })} />}
          {i.status === 'this_week' && i.plan && <p className="plan-saved">{i.plan} <button className="underline" onClick={() => updateItem(i.id, { plan: undefined })}>編集</button></p>}
        </Card>;
      })}</div>
      {shown.length === 0 && <Card className="p-6 text-center"><h2 className="section-title">該当する品目はありません</h2><p className="fine-print">検索語や絞り込みを変えてください。</p><button className="ghost-button mt-3" onClick={() => { setQuery(''); setFilter('all'); }}>すべての品目を見る</button></Card>}
      <details className="source-details mt-6"><summary>数量・品目の根拠と調整のしかた</summary><div className="fine-print mt-3"><p>水・トイレ・ボンベは公的資料の数量を換算しています。そのほかは公的資料の品目例を参考にした本アプリの初期目安です。年齢、食事量、普段の使用量に合わせて調整してください。「1式」は必要なものを各家庭で確認します。</p><ul className="mt-3 space-y-2">
        <li id="source-1"><a href="https://www.maff.go.jp/j/zyukyu/foodstock/guidebook.html" target="_blank" rel="noreferrer">1. 農林水産省：食品ストックガイド ↗</a></li>
        <li id="source-2"><a href="https://www.bichiku.metro.tokyo.lg.jp/" target="_blank" rel="noreferrer">2. 東京都：東京備蓄ナビ ↗</a></li>
        <li id="source-3"><a href="https://www.bousai.go.jp/kohou/kouhoubousai/r06/111/news_08.html" target="_blank" rel="noreferrer">3. 内閣府：災害時のトイレ対策 ↗</a></li>
        <li id="source-4"><a href="https://www.maff.go.jp/j/zyukyu/foodstock/chapter07.html" target="_blank" rel="noreferrer">4. 農林水産省：熱源を確保しよう ↗</a></li></ul><p className="mt-3">出典確認：2026年9月7日</p></div></details>
    </>}
  </div>;
}
