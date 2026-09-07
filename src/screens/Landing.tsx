import { useState } from 'react';
import { useStore } from '../store';
import { calcScore } from '../logic/score';
import { ownedQuantity } from '../logic/inventory';
import { expiryState } from '../logic/expiry';
import { ChieroHero } from '../components/Chiero';
import { Icon } from '../components/Icon';
import { Card, PrimaryButton, ScoreRing } from '../components/ui';

export function Landing({ onStartQuiz, go }: { onStartQuiz: () => void; go: (tab: 'check' | 'rolling' | 'sheet' | 'emergency') => void }) {
  const { household, items } = useStore();
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState<3 | 7>(7);
  const ready = household && items.length > 0;
  const soon = items.filter(i => ownedQuantity(i) > 0 && expiryState(i) === 'soon').length;
  const expired = items.filter(i => ownedQuantity(i) > 0 && expiryState(i) === 'expired').length;
  return <div className="page home-page">
    <div className="home-heading"><p className="eyebrow">BOUSAICLE / わが家の防災ノート</p><span className="local-label"><Icon name="check" size={16} />登録不要・無料</span></div>
    {ready ? <>
      <h1 className="page-title">備えを、日々の習慣に。</h1><p className="lede">{household.adults + household.seniors + household.kidsInfant + household.kidsChild}人家族・{household.targetDays}日分の備蓄を管理中</p>
      <div className="dashboard-grid">
        <Card className="progress-card"><div><p className="eyebrow">備蓄の準備率</p><h2>いまの備えを<br />ひとつずつ。</h2><p className="fine-print">数量を記録すると更新されます。<br />安全性を評価する点数ではありません。</p></div><ScoreRing score={calcScore(items)} size={170} /></Card>
        <Card className="next-card"><p className="eyebrow">次にすること</p><h2>{expired ? `期限を過ぎた${expired}品目を確認` : soon ? `期限が近い${soon}品目を確認` : '水とトイレの数を確認'}</h2><p>{expired || soon ? 'パッケージの期限と残量を確認して、買い足しへ。' : '家にある量を入れると、買い足す数が分かります。'}</p><PrimaryButton onClick={() => go(expired || soon ? 'rolling' : 'check')}>{expired || soon ? '期限を確認する' : '備蓄リストを開く'} <Icon name="arrow" size={18} /></PrimaryButton></Card>
      </div>
      <div className="quick-actions"><button onClick={() => go('check')}><Icon name="list" /><span>足りないものをそろえる</span><Icon name="arrow" /></button><button onClick={() => go('sheet')}><Icon name="sheet" /><span>家族の連絡先・避難先を残す</span><Icon name="arrow" /></button></div>
    </> : <div className="intro-grid">
      <section className="intro-copy"><h1>いつもの暮らしに、<br /><span>もしもの備え。</span></h1><p className="intro-description">まず、わが家に必要な量を知る。<br />そろえて、使って、買い足す。<br />家族の備えを、このノートに。</p><div className="guide-character"><ChieroHero size={140} /><p>チエロと一緒に、<br />できるところから。</p></div></section>
      <Card className="calculator"><div className="section-heading"><h2>水とトイレ、何日分？</h2><span className="subtle-tag">かんたん計算</span></div><p className="fine-print mt-2">家族の人数に合わせた備蓄の目安です。</p>
        <div className="calc-controls"><label htmlFor="quick-people">家族の人数<small>乳幼児を含む</small></label><div className="number-control"><button aria-label="人数を減らす" disabled={people === 1} onClick={() => setPeople(p => p - 1)}>−</button><input id="quick-people" aria-label="家族の人数" inputMode="numeric" type="number" min="1" max="80" value={people} onChange={e => setPeople(Math.max(1, Math.min(80, Math.floor(Number(e.target.value) || 1))))} /><span>人</span><button aria-label="人数を増やす" disabled={people === 80} onClick={() => setPeople(p => p + 1)}>＋</button></div></div>
        <div className="segmented" role="group" aria-label="備蓄日数">{([3, 7] as const).map(d => <button key={d} aria-pressed={days === d} onClick={() => setDays(d)}>{d}日分{d === 7 && <small>おすすめ</small>}</button>)}</div>
        <div className="quantity-preview" aria-live="polite"><div><span><Icon name="water" size={18} />飲料・調理用の水</span><p>{people * days * 3}<small>L</small></p><small>2Lボトル 約{Math.ceil(people * days * 3 / 2)}本</small></div><div><span>携帯トイレ</span><p>{people * days * 5}<small>回分</small></p><small>1人1日5回の目安</small></div></div>
        <PrimaryButton className="w-full" onClick={onStartQuiz}>家族に合わせてリストを作る <Icon name="arrow" size={18} /></PrimaryButton><p className="fine-print text-center mt-3">5つの質問・約3分。途中でやめても大丈夫。</p>
        <p className="fine-print source-note">水は1人1日3L、トイレは5回を基準に計算。<a href="https://www.maff.go.jp/j/zyukyu/foodstock/imadoki/imadoki02_10.html" target="_blank" rel="noreferrer">農林水産省 ↗</a> / <a href="https://www.bousai.go.jp/kohou/kouhoubousai/r06/111/news_08.html" target="_blank" rel="noreferrer">内閣府 ↗</a></p>
      </Card>
    </div>}
    <button className="emergency-entry" onClick={() => go('emergency')}><Icon name="shield" /><span><strong>災害情報・安否確認はこちら</strong><small>気象庁・ハザードマップ・災害用伝言板</small></span><Icon name="arrow" /></button>
    <footer className="home-footer"><a href="https://chiero.jp/">CHIERO</a><p>備蓄のデータはこのブラウザに保存。<br className="mobile-only" />ご自身のペースで、備えを続けましょう。</p></footer>
  </div>;
}
