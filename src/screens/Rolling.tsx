import { useState } from 'react';
import { useStore } from '../store';
import { expiryState, fmtExpiry } from '../logic/expiry';
import { ownedQuantity } from '../logic/inventory';
import { downloadICS } from '../logic/ics';
import { Card, GhostButton } from '../components/ui';
import { Icon } from '../components/Icon';
import type { StockItem } from '../types';
const dateValue = (i: StockItem) => i.expiry?.day ? `${i.expiry.year}-${String(i.expiry.month).padStart(2, '0')}-${String(i.expiry.day).padStart(2, '0')}` : '';
export function Rolling() {
  const { items, updateItem } = useStore();
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'attention' | 'unset'>('all');
  const expirable = items.filter(i => i.expirable && (ownedQuantity(i) > 0 || i.status === 'have'));
  const rank = (i: StockItem) => expiryState(i) === 'expired' ? 0 : expiryState(i) === 'soon' ? 1 : !i.expiry?.day ? 2 : 3;
  const shown = expirable.filter(i => filter === 'all' || (filter === 'attention' ? rank(i) <= 1 : !i.expiry?.day)).sort((a, b) => rank(a) - rank(b) || dateValue(a).localeCompare(dateValue(b)));
  const consume = (item: StockItem) => {
    const quantity = Math.max(0, ownedQuantity(item) - 1);
    updateItem(item.id, { ownedQty: quantity, status: quantity >= item.requiredQty ? 'have' : 'this_week', expiry: null, plan: undefined });
    setMessage(`${item.name}を1${item.unit}減らしました。残りの品物でいちばん近い期限を登録してください。`);
  };
  return <div className="page narrow"><p className="eyebrow">使って、買い足す</p><h1 className="page-title">期限を見て、備えをまわす。</h1><p className="lede">家にあるものを、期限が近い順に。減った分だけ買い足しましょう。</p>
    <div className="notice mt-5"><Icon name="clock" /><p>パッケージに表示された期限を登録してください。消費期限と賞味期限は異なります。このアプリは食べられるかを判定しません。</p></div>
    <div className="filter-tabs" role="group" aria-label="期限の絞り込み">{([['all', `すべて ${expirable.length}`], ['attention', '期限が近い・過ぎた'], ['unset', '日付未登録']] as const).map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
    {message && <p className="notice mb-4" role="status">{message}</p>}
    {!expirable.length ? <Card className="p-6"><h2 className="section-title">家にある備蓄から登録できます。</h2><p className="lede mt-2">「備蓄リスト」で数量を入れると、水・食品・電池などがここに並びます。</p></Card> : <>
      <div className="space-y-4">{shown.map(i => { const state = expiryState(i); return <Card className="expiry-card" key={i.id}><div className="section-heading"><h2 className="section-title">{i.emoji} {i.name}</h2><span className={`expiry-label ${state === 'expired' ? 'expired' : state === 'soon' ? 'soon' : ''}`}>{state === 'expired' ? '期限を過ぎています' : state === 'soon' ? '30日以内' : i.expiry?.day ? '期限登録済み' : '日付未登録'}</span></div>
        <p className="fine-print mt-2">現在 {i.ownedQty === undefined ? '数量未確認' : `${i.ownedQty}${i.unit}`}{i.expiry ? ` ／ ${fmtExpiry(i.expiry)}` : ''}</p>
        {i.expiry && !i.expiry.day && <p className="stock-warning">以前の年月だけの記録です。表示・並び順は月末を仮の基準にしています。パッケージの正確な日付を確認してください。</p>}
        <label className="date-field">いちばん近い期限<input aria-label={`${i.name}の期限`} type="date" min="2020-01-01" max="2100-12-31" value={dateValue(i)} onChange={e => { if (!e.target.value) { updateItem(i.id, { expiry: null }); return; } const [year, month, day] = e.target.value.split('-').map(Number); if (year < 2020 || year > 2100) return; updateItem(i.id, { expiry: { year, month, day } }); }} /></label>
        <div className="stock-actions"><button className="text-button" disabled={!ownedQuantity(i)} onClick={() => consume(i)}>1{i.unit}使った・取り出した <Icon name="cycle" size={16} /></button><button className="text-button" onClick={() => { updateItem(i.id, { status: 'this_week', ownedQty: 0, expiry: null, plan: undefined }); setMessage(`${i.name}の残量を0にし、買い物予定に入れました。`); }}>残り0・買い足す <Icon name="arrow" size={16} /></button></div>
      </Card>; })}</div>
      {!shown.length && <p className="notice">この条件に該当する品目はありません。</p>}
      <div className="mt-6"><GhostButton className="w-full" onClick={() => { if (!downloadICS(expirable)) setMessage('まず期限を登録してください。'); else setMessage('カレンダー用ファイルを保存しました。予定アプリに読み込み、通知設定も確認してください。'); }}>カレンダーに確認予定を追加（.ics）</GhostButton><p className="fine-print mt-3">期限の30日前に確認予定を作成します。年月だけの記録は月末を仮の基準にします。読み込み先の通知設定により通知の有無が変わります。</p></div>
    </>}
  </div>;
}
