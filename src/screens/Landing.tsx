import { useStore } from '../store';
import { calcScore, scoreComment } from '../logic/score';
import { expiryState } from '../logic/expiry';
import { ChieroHero, ChieroSays } from '../components/Chiero';
import { ChieroLinks } from '../components/ChieroLinks';
import { Card, PrimaryButton, GhostButton, ScoreRing } from '../components/ui';

export function Landing({ onStartQuiz, go }: { onStartQuiz: () => void; go: (tab: 'check' | 'rolling' | 'sheet') => void }) {
  const { household, items, storageOk } = useStore();

  // 再訪者: ダッシュボード
  if (household && items.length > 0) {
    const score = calcScore(items);
    const comment = scoreComment(score);
    const soon = items.filter((i) => i.expirable && i.status === 'have' && expiryState(i) === 'soon').length;
    const expired = items.filter((i) => i.expirable && i.status === 'have' && expiryState(i) === 'expired').length;
    const thisWeek = items.filter((i) => i.status === 'this_week').length;

    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <Card className="flex items-center justify-center gap-2 py-5">
          <ScoreRing score={score} size={150} />
          <ChieroHero size={120} />
        </Card>
        <div className="mt-4">
          <ChieroSays>{comment.text}</ChieroSays>
        </div>
        <div className="mt-4 grid gap-2.5">
          {(expired > 0 || soon > 0) && (
            <button type="button" onClick={() => go('rolling')}
              className="rounded-lg border-2 border-brand bg-white px-4 py-3 text-left text-sm font-bold text-brand shadow-[3px_3px_0_rgba(230,0,18,0.25)]">
              🔄 {expired > 0 ? `期限切れが${expired}件。` : ''}{soon > 0 ? `もうすぐ食べごろが${soon}件。` : ''}見にいく →
            </button>
          )}
          {thisWeek > 0 && (
            <button type="button" onClick={() => go('check')}
              className="rounded-lg border-2 border-ink bg-white px-4 py-3 text-left text-sm font-bold shadow-[3px_3px_0_rgba(17,17,17,0.15)]">
              🛒 今週そろえるもの {thisWeek}件 →
            </button>
          )}
          <GhostButton onClick={() => go('check')}>チェックリストを見る</GhostButton>
          <GhostButton onClick={() => go('sheet')}>冷蔵庫シートを作る</GhostButton>
        </div>
        <div className="mt-10">
          <ChieroLinks />
        </div>
      </div>
    );
  }

  // 初回: ヒーロー
  return (
    <div className="dots">
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <div className="flex justify-center">
          <ChieroHero size={230} />
        </div>
        <h1 className="mt-5 text-2xl font-bold leading-snug">
          わが家の防災、3分で<br />「やることリスト」に。
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          住まいと家族構成を選ぶだけ。<br />登録不要・無料。データはあなたの端末の中だけ。
        </p>
        <PrimaryButton className="mt-7 w-full py-4 text-lg" onClick={onStartQuiz}>
          そなえチェックをはじめる ▶
        </PrimaryButton>
        {!storageOk && (
          <p className="mt-3 rounded-lg bg-skin px-3 py-2 text-xs">
            いまは保存できないモード(プライベートブラウズ?)で動いてるよ。診断はできるけど、結果はスクショで残してね。
          </p>
        )}
        <div className="mt-10 space-y-2.5 text-left text-sm">
          {[
            ['1️⃣ しらべる', '5つの質問で、わが家に必要な備えの量がわかる'],
            ['2️⃣ そろえる', '優先度つきリスト。買い物の予定まで決められる'],
            ['3️⃣ まわす', '賞味期限がきたら「食べて買い足す」。それで備えが続く'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border-2 border-ink bg-white px-4 py-3 shadow-[3px_3px_0_rgba(17,17,17,0.15)]">
              <b>{t}</b><span className="ml-2 text-ink/70">{d}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs leading-relaxed text-ink/50">
          数量は農林水産省・東京備蓄ナビ等の公的ガイドに基づく目安です。
        </p>
        <div className="mt-6 border-t border-line/50 pt-5">
          <ChieroLinks />
        </div>
      </div>
    </div>
  );
}
