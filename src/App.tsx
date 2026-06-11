import { useEffect, useState } from 'react';
import { useStore } from './store';
import { decodeShare, type Snapshot } from './logic/share';
import { Landing } from './screens/Landing';
import { Quiz } from './screens/Quiz';
import { Result } from './screens/Result';
import { Checklist } from './screens/Checklist';
import { Rolling } from './screens/Rolling';
import { Sheet } from './screens/Sheet';
import { Settings } from './screens/Settings';

type Tab = 'home' | 'check' | 'rolling' | 'sheet' | 'settings';
type Flow = 'tabs' | 'quiz' | 'result';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '🎩' },
  { id: 'check', label: 'そろえる', icon: '✅' },
  { id: 'rolling', label: 'まわす', icon: '🔄' },
  { id: 'sheet', label: 'シート', icon: '📄' },
  { id: 'settings', label: '設定', icon: '⚙️' },
];

export default function App() {
  const importSnapshot = useStore((s) => s.importSnapshot);
  const [flow, setFlow] = useState<Flow>('tabs');
  const [tab, setTab] = useState<Tab>('home');
  const [incoming, setIncoming] = useState<Snapshot | null>(null);

  // 共有リンク(#share=...)の受け取り
  useEffect(() => {
    const m = location.hash.match(/#share=(.+)/);
    if (m) {
      const snap = decodeShare(m[1]);
      history.replaceState(null, '', location.pathname);
      if (snap) setIncoming(snap);
    }
  }, []);

  const acceptIncoming = () => {
    if (incoming) importSnapshot(incoming);
    setIncoming(null);
    setTab('check');
    setFlow('tabs');
  };

  return (
    <div className="min-h-screen bg-paper pb-24">
      <header className="border-b-2 border-ink bg-white">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button type="button" onClick={() => { setFlow('tabs'); setTab('home'); }} className="text-lg font-bold">
            <span className="text-brand">ボウ</span>サイクル
          </button>
          <span className="text-[11px] font-bold text-ink/50">チエロと3分、わが家の備え。</span>
        </div>
      </header>

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

      <main>
        {flow === 'quiz' && <Quiz onDone={() => setFlow('result')} onCancel={() => setFlow('tabs')} />}
        {flow === 'result' && <Result onStart={() => { setFlow('tabs'); setTab('check'); }} />}
        {flow === 'tabs' && (
          <>
            {tab === 'home' && <Landing onStartQuiz={() => setFlow('quiz')} go={(t) => setTab(t)} />}
            {tab === 'check' && <Checklist />}
            {tab === 'rolling' && <Rolling />}
            {tab === 'sheet' && <Sheet />}
            {tab === 'settings' && <Settings onRediagnose={() => setFlow('quiz')} />}
          </>
        )}
      </main>

      {flow === 'tabs' && (
        <nav className="fixed inset-x-0 bottom-0 border-t-2 border-ink bg-white print:hidden" aria-label="メインナビゲーション">
          <div className="mx-auto flex max-w-md">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${
                  tab === t.id ? 'text-brand' : 'text-ink/50'
                }`}>
                <span className="text-lg" aria-hidden="true">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
