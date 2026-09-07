import { useStore } from '../store';
import { ChieroSays, ChieroFace } from '../components/Chiero';
import { Card, PrimaryButton } from '../components/ui';

// 環境省ナッジ実証RCT(冷蔵庫掲示シート)のWeb再現(docs/05_evidence.md)
export function Sheet() {
  const { sheet, setSheet, items } = useStore();
  const checkItems = items.filter((i) => i.priority !== 'B').slice(0, 10);
  const input = 'w-full rounded-lg border-2 border-ink bg-white px-3 py-2.5 text-base';

  return (
    <div className="page narrow">
      <p className="eyebrow">家族で共有する</p><h1 className="page-title mb-4">わが家の連絡・避難シート</h1>
      <ChieroSays face="smug">
        連絡がつかない時の約束を、家族で決めておこう。書いたら印刷して、見つけやすい場所に。
      </ChieroSays>

      <Card className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="meeting">災害時にあつまる場所</label>
          <input id="meeting" className={input} maxLength={100} placeholder="例: ○○公園の時計の下"
            value={sheet.meetingPoint} onChange={(e) => setSheet({ meetingPoint: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="evac">避難先の候補（自治体の情報で確認）</label>
          <input id="evac" className={input} maxLength={100} placeholder="例: ○○小学校(指定避難所)"
            value={sheet.evacSite} onChange={(e) => setSheet({ evacSite: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="memo">家族メモ(連絡手順・持病など)</label>
          <input id="memo" maxLength={300} className={input} placeholder="例: つながらない時は171に吹き込む"
            value={sheet.memo} onChange={(e) => setSheet({ memo: e.target.value })} />
        </div>
        <p className="fine-print">避難先は災害の種類や開設状況により変わります。ハザードマップと自治体の情報を確認してください。</p>
        <p className="text-xs text-ink/60">このブラウザに保存されます。印刷物・バックアップには家族メモも含まれるため、保管先を確認してください。</p>
      </Card>

      {/* 印刷対象 */}
      <div id="print-sheet" className="mt-5 rounded-lg border-2 border-ink bg-white p-5">
        <div className="flex items-center justify-between border-b-4 border-brand pb-2">
          <h2 className="text-xl font-bold">わが家のそなえシート</h2>
          <ChieroFace size={48} />
        </div>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div>
            <dt className="font-bold text-brand">■ あつまる場所</dt>
            <dd className="border-b border-line pb-1">{sheet.meetingPoint || '　'}</dd>
          </div>
          <div>
            <dt className="font-bold text-brand">■ 避難先の候補</dt>
            <dd className="border-b border-line pb-1">{sheet.evacSite || '　'}</dd>
          </div>
          <div>
            <dt className="font-bold text-brand">■ つながらないとき</dt>
            <dd>災害用伝言ダイヤル <b>171</b> → 「1」で録音 /「2」で再生。家族で決めた同じ電話番号を使い、音声案内に従う。</dd>
          </div>
          <div>
            <dt className="font-bold text-brand">■ メモ</dt>
            <dd className="border-b border-line pb-1">{sheet.memo || '　'}</dd>
          </div>
          <div>
            <dt className="font-bold text-brand">■ 備蓄チェック(月に1回、家族で)</dt>
            <dd>
              <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                {checkItems.map((i) => (
                  <li key={i.id} className="text-xs">☐ {i.name.split('(')[0]} {i.requiredQty}{i.unit}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-center text-[10px] text-ink/50">ボウサイクル — チエロと3分、わが家の備え。</p>
      </div>

      <div className="mt-4 grid gap-2">
        <PrimaryButton onClick={() => window.print()}>🖨 印刷する</PrimaryButton>
        <p className="text-xs text-ink/60">プリンタがなければスクリーンショットでもOK。コンビニ印刷も使えるよ。白黒印刷でも読めるデザインです。</p>
      </div>
    </div>
  );
}
