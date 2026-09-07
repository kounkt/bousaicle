import { useStore } from '../store';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui';
export function Emergency() {
  const sheet = useStore(s => s.sheet);
  return <div className="page narrow">
    <p className="eyebrow">もしもの時</p><h1 className="page-title">いま必要な情報へ。</h1>
    <p className="lede">身の安全を確保し、自治体・気象庁の最新情報を確認してください。</p>
    <div className="notice mt-5"><Icon name="shield" /><p>このアプリは緊急速報を配信しません。外部の公式情報を開くには通信が必要です。</p></div>
    <div className="official-links">
      {[
        ['気象庁', '警報・地震・津波の情報', 'https://www.jma.go.jp/bosai/'],
        ['国土地理院・国土交通省', 'ハザードマップ・地域の避難情報を探す', 'https://disaportal.gsi.go.jp/'],
        ['NTT東日本・NTT西日本', '災害用伝言板 web171', 'https://www.web171.jp/'],
      ].map(([label, title, href]) => <a key={href} href={href} target="_blank" rel="noreferrer"><span><small>{label}</small><strong>{title}</strong></span><Icon name="external" /></a>)}
    </div>
    <Card className="mt-6"><h2 className="section-title">家族と決めたこと</h2><dl className="family-notes">
      <div><dt>あつまる場所</dt><dd>{sheet.meetingPoint || '未記入 —「家族シート」で登録できます'}</dd></div>
      <div><dt>避難先の候補</dt><dd>{sheet.evacSite || '未記入 — 災害の種類ごとに自治体で確認を'}</dd></div>
      <div><dt>連絡手順・メモ</dt><dd>{sheet.memo || '未記入'}</dd></div>
    </dl><p className="fine-print mt-4">登録した場所が、いま安全とは限りません。開設状況や避難情報を確認してください。</p></Card>
    <Card className="mt-4"><h2 className="section-title">電話で安否を残す・聞く</h2><div className="dial-number">171 <span>災害用伝言ダイヤル</span></div><p>音声ガイダンスに従い、録音は「1」、再生は「2」。家族で同じ電話番号を使うと決めておきましょう。</p><a className="source-link" href="https://www.ntt-east.co.jp/saigai/voice171/index.html" target="_blank" rel="noreferrer">NTT東日本：使い方・提供条件 ↗</a><p className="fine-print mt-2">利用できる時期や登録対象の電話番号は、災害時の提供条件によります。</p></Card>
    <p className="fine-print mt-6">公式リンク確認：2026年9月7日</p>
  </div>;
}
