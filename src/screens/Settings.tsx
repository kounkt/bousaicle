import { useRef, useState } from 'react';
import { useStore } from '../store';
import { encodeShare, parseImportJSON } from '../logic/share';
import { SOURCES } from '../data/stockMaster';
import { Card, GhostButton } from '../components/ui';
import { ChieroLinks } from '../components/ChieroLinks';

export function Settings({ onRediagnose }: { onRediagnose: () => void }) {
  const { household, items, sheet, importSnapshot, reset } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const snapshot = { household, items, sheet };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bousaicle-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyShareLink = async () => {
    // 集合場所・避難先・メモは含めない(encodeShare 側で除外。監査指摘)
    const url = `${location.origin}${location.pathname}#share=${encodeShare(snapshot)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMsg('共有リンクをコピーしたよ。リンクには家族構成と備蓄リストが含まれる(集合場所・メモは含まれない)から、家族にだけ送ってね');
    } catch {
      prompt('このURLをコピーしてね:', url);
    }
  };

  const onImportFile = (file: File) => {
    if (file.size > 1_000_000) { setMsg('ファイルが大きすぎます。1MB以下のバックアップを選んでください。'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const s = parseImportJSON(String(reader.result));
      if (!s) { setMsg('ファイルを読み込めなかった…形式が違うみたい。'); return; }
      if (confirm('いまのデータをこのファイルの内容で置き換える?')) {
        importSnapshot(s);
        setMsg('読み込んだよ。おかえり。');
      }
    };
    reader.onerror = () => setMsg('ファイルを読み込めませんでした。もう一度選んでください。');
    reader.readAsText(file);
  };

  return (
    <div className="page narrow">
      <p className="eyebrow">データを手元に</p><h1 className="page-title mb-5">設定・バックアップ</h1>
      {msg && <p role="status" className="mb-3 rounded-lg bg-skin px-3 py-2 text-sm">{msg}</p>}

      <Card className="mb-5 migration-card">
        <h2 className="section-title">保存データの引き継ぎ</h2>
        <ol className="mt-3 space-y-2 text-sm list-decimal pl-5"><li><a href="https://kounkt.github.io/bousaicle/#settings" target="_blank" rel="noreferrer" className="underline">以前のURLの設定画面 ↗</a>を、使っていた端末・ブラウザで開き、「バックアップを保存(JSON)」を選ぶ。</li><li><a href="https://chiero.jp/bousaicle/#settings" target="_blank" rel="noreferrer" className="underline">新しい公式URLの設定画面 ↗</a>を開く。</li><li>新しい公式URLで「バックアップを読み込む」を選び、保存したファイルで復元する。</li></ol>
        <p className="fine-print mt-3">以前のURLでも引き続き利用できます。保存データはURLのドメインごとに分かれ、自動では同期されません。移行後も以前のデータはそのまま残ります。</p>
      </Card>
      <Card className="space-y-2">
        <h2 className="text-sm font-bold">データの持ち運び</h2>
        <GhostButton className="w-full" onClick={exportJSON}>⬇ バックアップを保存(JSON)</GhostButton>
        <GhostButton className="w-full" onClick={() => fileRef.current?.click()}>⬆ バックアップを読み込む</GhostButton>
        <input ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportFile(file); e.target.value = ""; }} />
        <GhostButton className="w-full" onClick={copyShareLink}>🔗 家族用の共有リンクをコピー</GhostButton>
        <GhostButton className="w-full" onClick={onRediagnose}>🔁 家族構成を変更する（残量は引き継ぎ）</GhostButton>
      </Card>

      <Card className="mt-4 space-y-1.5">
        <h2 className="text-sm font-bold">📱 オフラインでも使える</h2>
        <p className="text-xs leading-relaxed text-ink/70">
          通信できる時に一度開き、読み込みが完了してから<b>ホーム画面に追加</b>すると便利です。保存済みのアプリ・備蓄リスト・家族シートは、通信がない時も利用できます。事前に機内モードで開けるかお試しください。ブラウザのデータを消した場合は再読み込みが必要です。
          iPhone: 共有ボタン→「ホーム画面に追加」/ Android: メニュー→「アプリをインストール」
        </p>
      </Card>

      <Card className="mt-4 space-y-1.5">
        <h2 className="text-sm font-bold">プライバシー</h2>
        <p className="text-xs leading-relaxed text-ink/70">
          入力した家族構成・備蓄状況・家族シートは、<b>このブラウザの保存領域</b>に記録します。アプリから入力内容を運営者へ送信する機能はありません。共有端末では、同じブラウザを使う人が内容を見られます。
          アカウント登録もありません。共有リンク機能を使った場合のみ、リンクを知っている人に家族構成・備蓄リストの内容が見えます。集合場所・家族メモ・買い物予定の自由文は共有リンクに含めません。バックアップファイルには家族シートも含まれます。
        </p>
      </Card>

      <Card className="mt-4 space-y-1.5">
        <h2 className="text-sm font-bold">数量の根拠・確認日</h2>
        <ul className="space-y-1 text-xs">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-ink/70">
          水・トイレ・ボンベは公的資料から換算し、その他は資料を参考にした初期<b>目安</b>であり、安全を保証するものではありません。
          災害時は自治体・気象庁等の公式情報を最優先してください。
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-bold text-brand">データを全部消す</h2>
        <p className="mt-1 text-xs text-ink/60">この端末からすべてのデータを削除します。元に戻せません。</p>
        <button type="button"
          onClick={() => { if (confirm('本当に全部消す?(バックアップ保存をおすすめ)')) { reset(); setMsg('全部消したよ。また必要になったら、いつでも3分でやり直せるからね。'); } }}
          className="mt-2 rounded-lg border-2 border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand hover:text-white">
          全データを削除
        </button>
      </Card>

      <div className="mt-8">
        <ChieroLinks />
        <p className="mt-2 text-center text-[11px] text-ink/40">ボウサイクル v2.0 / 出典確認 2026-09-07</p>
      </div>
    </div>
  );
}
