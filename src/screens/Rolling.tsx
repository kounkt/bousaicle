import { useStore } from '../store';
import { expiryState, fmtExpiry } from '../logic/expiry';
import { downloadICS } from '../logic/ics';
import { ChieroSays } from '../components/Chiero';
import { Card, GhostButton } from '../components/ui';

export function Rolling() {
  const { items, updateItem } = useStore();
  const expirable = items.filter((i) => i.expirable && i.status === 'have');
  const soon = expirable.filter((i) => expiryState(i) === 'soon');
  const expired = expirable.filter((i) => expiryState(i) === 'expired');
  const now = new Date();
  const years = Array.from({ length: 11 }, (_, k) => now.getFullYear() + k - 1);

  const eatAndRebuy = (id: string) => updateItem(id, { status: 'this_week', expiry: null, plan: undefined });

  // 過去の年月が選ばれたら入力ミスの可能性を確認(docs/03 エッジケース)
  const setExpiryChecked = (id: string, expiry: { year: number; month: number }) => {
    const end = new Date(expiry.year, expiry.month, 0, 23, 59, 59);
    if (end < new Date() && !confirm('過去の期限みたいだけど、まちがいない?(すでに期限切れとして表示されます)')) return;
    updateItem(id, { expiry });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-bold">まわす(ローリングストック)</h1>

      {expirable.length === 0 ? (
        <ChieroSays face="hmm">
          「持ってる」にした食べもの・飲みものがここに並ぶよ。まずは「そろえる」でチェックを入れてきて。
        </ChieroSays>
      ) : (
        <>
          <ChieroSays face="normal">
            賞味期限は「年と月」だけでOK。期限が近づいたら、ふだんのごはんで食べて買い足す。それだけで備えがまわり続ける。
          </ChieroSays>

          {expired.length > 0 && (
            <Card className="mt-4 border-brand">
              <p className="text-sm font-bold text-brand">期限切れ({expired.length}件)</p>
              <p className="mt-1 text-xs text-ink/70">だいじょうぶ、気づけたのが偉い。買い物リストに戻そう。</p>
              <ul className="mt-2 space-y-2">
                {expired.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>{i.emoji} {i.name}(〜{i.expiry && fmtExpiry(i.expiry)})</span>
                    <button type="button" onClick={() => eatAndRebuy(i.id)}
                      className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-white">買い足しリストへ</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {soon.length > 0 && (
            <Card className="mt-4 border-brand/60">
              <p className="text-sm font-bold">🔄 もうすぐ食べごろ(期限30日以内)</p>
              <ul className="mt-2 space-y-2">
                {soon.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>{i.emoji} {i.name}(〜{i.expiry && fmtExpiry(i.expiry)})</span>
                    <button type="button" onClick={() => eatAndRebuy(i.id)}
                      className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">食べた!買い足す</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <section className="mt-5 space-y-3">
            {expirable.map((i) => (
              <Card key={i.id} className="p-3.5">
                <p className="text-sm font-bold">{i.emoji} {i.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs font-bold text-ink/60" htmlFor={`y-${i.id}`}>いちばん近い期限:</label>
                  <select id={`y-${i.id}`} aria-label="年" value={i.expiry?.year ?? ''}
                    onChange={(e) => {
                      const year = Number(e.target.value);
                      if (!year) { updateItem(i.id, { expiry: null }); return; }
                      setExpiryChecked(i.id, { year, month: i.expiry?.month ?? 12 });
                    }}
                    className="rounded-lg border-2 border-ink bg-white px-2 py-1.5 text-sm">
                    <option value="">未設定</option>
                    {years.map((y) => <option key={y} value={y}>{y}年</option>)}
                  </select>
                  {i.expiry && (
                    <select aria-label="月" value={i.expiry.month}
                      onChange={(e) => setExpiryChecked(i.id, { year: i.expiry!.year, month: Number(e.target.value) })}
                      className="rounded-lg border-2 border-ink bg-white px-2 py-1.5 text-sm">
                      {Array.from({ length: 12 }, (_, k) => k + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
                    </select>
                  )}
                </div>
              </Card>
            ))}
          </section>

          <div className="mt-5">
            <GhostButton className="w-full" onClick={() => {
              if (!downloadICS(items)) alert('期限が設定された品目がまだないよ。');
            }}>
              📅 カレンダーに通知を入れる(.ics をダウンロード)
            </GhostButton>
            <p className="mt-1.5 text-xs text-ink/60">
              期限の1ヶ月前に「そろそろ食べごろ」の予定が入るファイルです。iPhone/Android/Googleカレンダーで開けます。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
