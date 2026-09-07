import { useEffect, useState } from 'react';
import { useStore } from '../store';
export function RuntimeStatus() {
  const storageOk = useStore(s => s.storageOk);
  const [online, setOnline] = useState(navigator.onLine);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const changed = () => setOnline(navigator.onLine);
    addEventListener('online', changed); addEventListener('offline', changed);
    let active = true;
    if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then(() => { if (active) setReady(true); });
    return () => { active = false; removeEventListener('online', changed); removeEventListener('offline', changed); };
  }, []);
  if (storageOk && online) return null;
  return <div className="runtime-status" role="status">{!storageOk && <p>このブラウザでは保存できません。画面を閉じる前に「設定・データ」からバックアップを保存してください。</p>}{!online && <p>オフラインです。{ready ? '保存済みのリスト・家族シートを確認できます。' : '次回の起動に備え、通信できる時にアプリを開いてください。'} 外部の公式情報は更新できません。</p>}</div>;
}
