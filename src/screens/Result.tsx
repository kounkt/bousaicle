import { useStore } from '../store';
import { calcScore, scoreComment } from '../logic/score';
import { downloadShareImage } from '../logic/shareImage';
import { ChieroSays } from '../components/Chiero';
import { Card, PrimaryButton, GhostButton, PriorityBadge, ScoreRing } from '../components/ui';

export function Result({ onStart }: { onStart: () => void }) {
  const { household, items, setTargetDays } = useStore();
  if (!household) return null;

  const score = calcScore(items);
  const comment = scoreComment(score);
  const byPriority = (p: 'S' | 'A' | 'B') => items.filter((i) => i.priority === p);

  const famLabel = [
    household.adults > 0 && `おとな${household.adults}`,
    household.seniors > 0 && `65歳以上${household.seniors}`,
    household.kidsInfant > 0 && `乳幼児${household.kidsInfant}`,
    household.kidsChild > 0 && `子ども${household.kidsChild}`,
    household.pets.length > 0 && `ペット${household.pets.length}`,
  ].filter(Boolean).join('・');

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Card className="text-center">
        <p className="text-sm font-bold text-ink/60">わが家のそなえスコア <span className="text-brand" aria-hidden="true">✦</span></p>
        <div className="flex justify-center py-1">
          <ScoreRing score={score} size={160} />
        </div>
        <p className="text-xs text-ink/60">リストにチェックを入れると上がっていくよ</p>
      </Card>

      <div className="mt-4">
        <ChieroSays face={comment.face}>{comment.text}</ChieroSays>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-base font-bold">
          {famLabel} の {household.targetDays}日分
        </h2>
        <div className="flex rounded-lg border-2 border-ink text-xs font-bold" role="group" aria-label="備蓄日数">
          {([3, 7] as const).map((d) => (
            <button key={d} type="button" onClick={() => setTargetDays(d)}
              className={`px-3 py-1.5 ${household.targetDays === d ? 'bg-ink text-white' : 'bg-white'} ${d === 3 ? 'rounded-l-md' : 'rounded-r-md'}`}>
              {d}日分{d === 7 ? '(推奨)' : ''}
            </button>
          ))}
        </div>
      </div>

      {(['S', 'A', 'B'] as const).map((p) => (
        <section key={p} className="mt-4">
          <PriorityBadge p={p} />
          <Card className="mt-1.5 divide-y divide-line/60 p-0">
            {byPriority(p).map((i) => (
              <div key={i.id} className="flex items-baseline justify-between gap-2 px-4 py-2.5">
                <span className="text-sm">{i.emoji} {i.name}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums">{i.requiredQty}{i.unit}</span>
              </div>
            ))}
          </Card>
        </section>
      ))}

      <div className="mt-6 grid gap-2">
        <PrimaryButton onClick={onStart}>このリストで始める ▶</PrimaryButton>
        <GhostButton onClick={() => { void downloadShareImage(score); }}>📸 スコアを画像でシェア(個人情報は入らないよ)</GhostButton>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink/60">
        ※ 数量は公的ガイド(農林水産省・東京備蓄ナビ等)に基づく目安です。お住まいの自治体の情報もあわせて確認してください。
        {household.prefecture && (
          <>
            {' '}
            <a className="underline" href="https://disaportal.gsi.go.jp/" target="_blank" rel="noreferrer">
              {household.prefecture}のハザードマップを確認する ↗
            </a>
          </>
        )}
      </p>
    </div>
  );
}
