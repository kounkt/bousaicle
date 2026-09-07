import { useEffect, useState } from 'react';
import { useStore } from './store';
import { decodeShare, type Snapshot } from './logic/share';
import { Landing } from './screens/Landing';
import { Quiz } from './screens/Quiz';
import { Result } from './screens/Result';
import { Checklist } from './screens/Checklist';
import { Rolling } from './screens/Rolling';
import { Sheet } from './screens/Sheet';
import { Emergency } from './screens/Emergency';
import { Icon, type IconName } from './components/Icon';
import { RuntimeStatus } from './components/RuntimeStatus';
import { Settings } from './screens/Settings';

type Tab = 'home' | 'check' | 'rolling' | 'sheet' | 'settings' | 'emergency';
type Flow = 'tabs' | 'quiz' | 'result';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'ホーム', icon: 'home' },
  { id: 'check', label: '備蓄リスト', icon: 'list' },
  { id: 'rolling', label: '期限・補充', icon: 'cycle' },
  { id: 'sheet', label: '家族シート', icon: 'sheet' },
  { id: 'emergency', label: 'もしもの時', icon: 'shield' },
];

export default function App() {
  const importSnapshot = useStore((s) => s.importSnapshot);
  const [flow, setFlow] = useState<Flow>('tabs');
  const [tab, setTab] = useState<Tab>(location.hash === '#settings' ? 'settings' : location.hash === '#emergency' ? 'emergency' : 'home');
  const [incoming, setIncoming] = useState<Snapshot | null>(null);
  const [importError, setImportError] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [tab, flow]);

  // 共有リンク(#share=...)の受け取り
  useEffect(() => {
    const m = location.hash.match(/#share=(.+)/);
    if (m) {
      const snap = decodeShare(m[1]);
      history.replaceState(null, '', location.pathname);
      if (snap) setIncoming(snap);
      else setImportError(true);
    }
  }, []);

  const acceptIncoming = () => {
    if (incoming) importSnapshot(incoming);
    setIncoming(null);
    setTab('check');
    setFlow('tabs');
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main">本文へ移動</a>
      <header className="app-header">
        <div className="header-inner">
          <button type="button" onClick={() => { setFlow('tabs'); setTab('home'); }} className="brand-lockup" aria-label="ボウサイクル ホーム">
            <span className="brand-mark"><Icon name="cycle" size={29} /></span>ボウサイクル
          </button>
          <div className="header-tools"><a href="https://chiero.jp/">by CHIERO ↗</a><button className="icon-button" aria-label="設定・データ" onClick={() => { setFlow('tabs'); setTab('settings'); }}><Icon name="settings" /></button></div>
        </div>
      </header>
      <RuntimeStatus />
      {importError && <p role="alert" className="runtime-status">共有リンクを読み込めませんでした。リンクの全文、またはバックアップファイルを確認してください。</p>}

      {incoming && (
        <div className="mx-auto max-w-md px-4 pt-4">
          <div className="rounded-lg border-2 border-brand bg-white p-4">
            <p className="text-sm font-bold">共有された備えリストを受け取ったよ。自分用に取り込む?</p>
            <p className="mt-1 text-xs text-ink/60">※ いまこの端末にあるデータは上書きされます</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={acceptIncoming} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white">取り込む</button>
              <button type="button" onClick={() => setIncoming(null)} className="rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold">やめておく</button>
            </div>
          </div>
        </div>
      )}

      <main id="main" tabIndex={-1}>
        {flow === 'quiz' && <Quiz onDone={() => setFlow('result')} onCancel={() => setFlow('tabs')} />}
        {flow === 'result' && <Result onStart={() => { setFlow('tabs'); setTab('check'); }} />}
        {flow === 'tabs' && (
          <>
            {tab === 'emergency' && <Emergency />}
            {tab === 'home' && <Landing onStartQuiz={() => setFlow('quiz')} go={(t) => setTab(t)} />}
            {tab === 'check' && <Checklist onStart={() => setFlow('quiz')} />}
            {tab === 'rolling' && <Rolling />}
            {tab === 'sheet' && <Sheet />}
            {tab === 'settings' && <Settings onRediagnose={() => setFlow('quiz')} />}
          </>
        )}
      </main>

      {flow === 'tabs' && (
        <nav className="app-nav print:hidden" aria-label="メインナビゲーション">
          <div>{TABS.map(t => <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}><Icon name={t.icon} />{t.label}</button>)}</div>
        </nav>
      )}
    </div>
  );
}
