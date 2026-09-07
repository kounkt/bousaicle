import { useEffect, useState } from 'react';
import type { Dwelling, Household } from '../types';
import { useStore } from '../store';
import { ChieroSays } from '../components/Chiero';
import { PrimaryButton, GhostButton, PREFECTURES } from '../components/ui';

const TOTAL = 5;

export function Quiz({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const diagnose = useStore((s) => s.diagnose);
  const saved = useStore((s) => s.household);
  const [step, setStep] = useState(0);
  useEffect(() => { window.scrollTo({ top: 0 }); document.querySelector<HTMLElement>('[data-quiz-title]')?.focus({ preventScroll: true }); }, [step]);
  const [prefecture, setPrefecture] = useState(saved?.prefecture ?? '');
  const [dwelling, setDwelling] = useState<Dwelling | null>(saved?.dwelling ?? null);
  const [adults, setAdults] = useState(saved?.adults ?? 2);
  const [seniors, setSeniors] = useState(saved?.seniors ?? 0);
  const [kidsInfant, setKidsInfant] = useState(saved?.kidsInfant ?? 0);
  const [kidsChild, setKidsChild] = useState(saved?.kidsChild ?? 0);
  const [pets, setPets] = useState<('dog' | 'cat' | 'other')[]>(saved?.pets ?? []);
  const [allergy, setAllergy] = useState(saved?.flags.allergy ?? false);
  const [medication, setMedication] = useState(saved?.flags.medication ?? false);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => (step === 0 ? onCancel() : setStep((s) => s - 1));

  const finish = () => {
    const total = adults + seniors + kidsInfant + kidsChild;
    if (total === 0) return;
    const h: Household = {
      version: 1,
      prefecture,
      dwelling: dwelling ?? 'house',
      adults,
      seniors,
      kidsInfant,
      kidsChild,
      pets,
      flags: { allergy, medication },
      targetDays: saved?.targetDays ?? 7, // デフォルト効果: 推奨値を初期選択(docs/05)
    };
    diagnose(h);
    onDone();
  };

  const choiceBtn = (selected: boolean) =>
    `rounded-lg border-2 px-4 py-3 text-sm font-bold transition ${
      selected ? 'border-brand bg-brand text-white' : 'border-ink bg-white hover:bg-paper'
    }`;

  const counter = (label: string, value: number, set: (n: number) => void, max = 20) => (
    <div className="flex items-center justify-between rounded-lg border-2 border-ink bg-white px-4 py-3">
      <span className="text-sm font-bold">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`${label}を減らす`} disabled={value === 0} onClick={() => set(Math.max(0, value - 1))}
          className="h-10 w-10 rounded-full border-2 border-ink text-lg font-bold hover:bg-paper">−</button>
        <span className="w-8 text-center text-lg font-bold tabular-nums">{value}</span>
        <button type="button" aria-label={`${label}を増やす`} disabled={value === max} onClick={() => set(Math.min(max, value + 1))}
          className="h-10 w-10 rounded-full border-2 border-ink text-lg font-bold hover:bg-paper">＋</button>
      </div>
    </div>
  );

  return (
    <div className="page narrow">
      <p className="eyebrow">家族に合わせた備蓄リスト</p><h1 data-quiz-title tabIndex={-1} className="page-title mb-5">わが家のことを、少しだけ。</h1>
      {/* 進捗 */}
      <div className="mb-5 flex items-center gap-2" aria-label={`質問 ${step + 1} / ${TOTAL}`}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <span key={i} className={`h-2.5 flex-1 rounded-full ${i <= step ? 'bg-brand' : 'bg-line'}`} />
        ))}
        <span className="ml-1 text-xs font-bold text-ink/60">{step + 1}/{TOTAL}</span>
      </div>

      {step === 0 && (
        <section aria-label="質問1">
          <ChieroSays face="normal">お住まいはどこ？ あとで地域のハザードマップを確認しよう。地域の危険度は、このアプリでは判定しないよ。</ChieroSays>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-bold" htmlFor="pref">都道府県</label>
            <select id="pref" value={prefecture} onChange={(e) => setPrefecture(e.target.value)}
              className="w-full rounded-lg border-2 border-ink bg-white px-3 py-3 text-base">
              <option value="">選択する(スキップ可)</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="mt-6 flex justify-between">
            <GhostButton onClick={back}>← もどる</GhostButton>
            <PrimaryButton onClick={next}>つぎへ →</PrimaryButton>
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-label="質問2">
          <ChieroSays face="hmm">住まいのタイプは？ 集合住宅では、断水時のトイレにも備えておこう。</ChieroSays>
          <div className="mt-4 grid gap-2">
            {([
              ['house', '戸建て'],
              ['apt_low', 'マンション・アパート(1〜2階)'],
              ['apt_high', 'マンション(3階以上)'],
            ] as [Dwelling, string][]).map(([v, label]) => (
              <button key={v} type="button" aria-pressed={dwelling === v} className={choiceBtn(dwelling === v)} onClick={() => setDwelling(v)}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <GhostButton onClick={back}>← もどる</GhostButton>
            <PrimaryButton onClick={next} disabled={!dwelling}>つぎへ →</PrimaryButton>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-label="質問3">
          <ChieroSays face="normal">おとなは何人?(65歳以上は分けて教えて)</ChieroSays>
          <div className="mt-4 grid gap-2">
            {counter('おとな(18〜64歳)', adults, setAdults)}
            {counter('65歳以上', seniors, setSeniors)}
          </div>
          <div className="mt-6 flex justify-between">
            <GhostButton onClick={back}>← もどる</GhostButton>
            <PrimaryButton onClick={next}>つぎへ →</PrimaryButton>
          </div>
        </section>
      )}

      {step === 3 && (
        <section aria-label="質問4">
          <ChieroSays face="happy">子どもは?(年齢で備えが変わるよ)</ChieroSays>
          <div className="mt-4 grid gap-2">
            {counter('乳幼児(0〜2歳)', kidsInfant, setKidsInfant)}
            {counter('子ども(3〜17歳)', kidsChild, setKidsChild)}
          </div>
          <div className="mt-6 flex justify-between">
            <GhostButton onClick={back}>← もどる</GhostButton>
            <PrimaryButton onClick={next}>つぎへ →</PrimaryButton>
          </div>
        </section>
      )}

      {step === 4 && (
        <section aria-label="質問5">
          <ChieroSays face="smug">さいご。あてはまるものある?(なければそのまま結果へ)</ChieroSays>
          <div className="mt-4 grid gap-2">
            <p className="text-sm font-bold">ペットの頭数</p>
            {(['dog', 'cat', 'other'] as const).map(kind => <div key={kind}>{counter(kind === 'dog' ? '犬' : kind === 'cat' ? '猫' : 'その他のペット', pets.filter(p => p === kind).length, n => setPets(p => [...p.filter(x => x !== kind), ...Array.from({ length: n }, () => kind)]), 10)}</div>)}
            <button type="button" aria-pressed={allergy} className={choiceBtn(allergy)} onClick={() => setAllergy((v) => !v)}>
              🏷️ 食物アレルギーの家族がいる
            </button>
            <button type="button" aria-pressed={medication} className={choiceBtn(medication)} onClick={() => setMedication((v) => !v)}>
              💊 毎日飲む薬がある
            </button>
          </div>
          {adults + seniors + kidsInfant + kidsChild === 0 && <p className="notice mt-4" role="alert">家族の人数を1人以上にしてください。「もどる」から変更できます。</p>}
          <div className="mt-6 flex justify-between">
            <GhostButton onClick={back}>← もどる</GhostButton>
            <PrimaryButton onClick={finish} disabled={adults + seniors + kidsInfant + kidsChild === 0}>リストを作る →</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
