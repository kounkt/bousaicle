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
    const reader = new FileReader();
    reader.onload = () => {
      const s = parseImportJSON(String(reader.result));
      if (!s) { setMsg('ファイルを読み込めなかった…形式が違うみたい。'); return; }
      if (confirm('いまのデータをこのファイルの内容で置き換える?')) {
        importSnapshot(s);
        setMsg('読み込んだよ。おかえり。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-lg font-bold">設定・データ</h1>
      {msg && <p className="mb-3 rounded-lg bg-skin px-3 py-2 text-sm">{msg}</p>}

      <Card className="space-y-2">
        <h2 className="text-sm font-bold">データの持ち運び</h2>
        <GhostButton className="w-full" onClick={exportJSON}>⬇ バックアップを保存(JSON)</GhostButton>
        <GhostButton className="w-full" onClick={() => fileRef.current?.click()}>⬆ バックアップを読み込む</GhostButton>
        <input ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => e.target.files?.[0] && onImportFile(e.target.files[0])} />
        <GhostButton className="w-full" onClick={copyShareLink}>🔗 家族に共有リンクを送る</GhostButton>
        <GhostButton className="w-full" onClick={onRediagnose}>🔁 もう一度診断する(チェックは引き継がれます)</GhostButton>
      </Card>

      <Card className="mt-4 space-y-1.5">
        <h2 className="text-sm font-bold">📱 オフラインでも使える</h2>
        <p className="text-xs leading-relaxed text-ink/70">
          このサイトをスマホの<b>ホーム画面に追加</b>すると、災害で通信が不安定なときも備蓄リスト・冷蔵庫シートを開けます。
          iPhone: 共有ボタン→「ホーム画面に追加」/ Android: メニュー→「アプリをインストール」
        </p>
      </Card>

      <Card className="mt-4 space-y-1.5">
        <h2 className="text-sm font-bold">プライバシー</h2>
        <p className="text-xs leading-relaxed text-ink/70">
          入力したデータ(家族構成・備蓄状況・集合場所など)は、すべて<b>この端末のブラウザの中だけ</b>に保存され、サーバーには一切送信されません。
          アカウント登録もありません。共有リンク機能を使った場合のみ、リンクを渡した相手にリストの内容が見えます。
        </p>
      </Card>

      <Card className="mt-4 space-y-1.5">
        <h2 className="text-sm font-bold">数量の根拠(出典)</h2>
        <ul className="space-y-1 text-xs">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-ink/70">
          本サイトの数量・リストは公的ガイドに基づく<b>目安</b>であり、安全を保証するものではありません。
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
        <p className="mt-2 text-center text-[11px] text-ink/40">ボウサイクル v1.1</p>
      </div>
    </div>
  );
}
