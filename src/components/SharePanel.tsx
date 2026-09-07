import { useEffect, useId, useState } from 'react';
import { useStore } from '../store';
import { calcScore } from '../logic/score';
import { APP_SHARE_TITLE, buildPublicShare, fullShareText, getShareMoment, shareWithDevice, socialLinks } from '../logic/social';
import { Icon } from './Icon';

export function SharePanel({ milestoneOnly = false }: { milestoneOnly?: boolean }) {
  const household = useStore(s => s.household);
  const items = useStore(s => s.items);
  const moment = getShareMoment(Boolean(household), items);
  const [selection, setSelection] = useState<'auto' | 'intro'>('auto');
  const [includeScore, setIncludeScore] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [imageError, setImageError] = useState(false);
  const [prepared, setPrepared] = useState<{ key: string; file: File; url: string } | null>(null);
  const chosen = selection === 'intro' ? 'intro' : moment;
  const share = buildPublicShare(chosen, includeScore ? calcScore(items) : undefined);
  const key = `${chosen}:${share.score ?? 'none'}`;
  const file = prepared?.key === key ? prepared.file : undefined;
  const previewUrl = prepared?.key === key ? prepared.url : undefined;
  const links = socialLinks(share);
  const textId = useId();
  const scoreId = useId();

  useEffect(() => {
    if (!open) return;
    let active = true;
    let objectUrl: string | undefined;
    setPrepared(null);
    setImageError(false);
    void import('../logic/shareImage').then(m => m.createShareFile(buildPublicShare(chosen, share.score))).then(imageFile => {
      if (!active) return;
      objectUrl = URL.createObjectURL(imageFile);
      setPrepared({ key, file: imageFile, url: objectUrl });
    }).catch(() => { if (active) setImageError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [open, key, chosen, share.score]);

  if (milestoneOnly && moment !== 'basics') return null;

  const copy = async (linkOnly = false) => {
    try {
      await navigator.clipboard.writeText(linkOnly ? share.url : fullShareText(share));
      setMessage(linkOnly ? 'アプリのリンクをコピーしました。' : '投稿文とリンクをコピーしました。共有先で貼り付けられます。');
    } catch {
      const textarea = document.getElementById(textId) as HTMLTextAreaElement | null;
      textarea?.focus(); textarea?.select();
      setMessage('コピーできませんでした。下の投稿文を選択してコピーしてください。');
    }
  };
  const nativeShare = async (withImage = false) => {
    try {
      const result = await shareWithDevice(share, withImage ? file : undefined);
      setMessage(result === 'unavailable' ? 'このブラウザでは共有メニューを開けません。画像を保存するか、投稿文をコピーしてください。' : result === 'cancelled' ? '' : '共有先への受け渡しが終わりました。投稿結果は共有先で確認してください。');
    } catch {
      setMessage('共有メニューを開けませんでした。画像を保存するか、投稿文をコピーしてください。');
    }
  };
  const canShareImage = (() => {
    try { return Boolean(file && typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })); } catch { return false; }
  })();

  return <details className={`share-panel ${milestoneOnly ? 'share-milestone' : ''}`} onToggle={e => setOpen(e.currentTarget.open)}>
    <summary><Icon name="share" /><span><strong>{moment === 'basics' ? '水とトイレ、目安の数量がそろいました。' : moment === 'started' ? '備えを始めた、その一歩を。' : '備えのきっかけを、大切な人にも。'}</strong><small>{moment === 'intro' ? 'このアプリを知らせる' : '今日のひと手間を、シェアしませんか。'}</small></span><span className="share-open-label">共有する <Icon name="arrow" size={17} /></span></summary>
    {open && <div className="share-body">
      {moment !== 'intro' && <div className="segmented mb-4" role="group" aria-label="共有する内容"><button type="button" aria-pressed={selection === 'auto'} onClick={() => { setSelection('auto'); setMessage(''); }}>今回の一歩</button><button type="button" aria-pressed={selection === 'intro'} onClick={() => { setSelection('intro'); setMessage(''); }}>アプリを紹介</button></div>}
      <div className="share-layout"><div className="share-visual">
        {previewUrl ? <img src={previewUrl} alt={`${APP_SHARE_TITLE}。${share.headline.join('')}${share.score === undefined ? '' : ` 備蓄準備率${share.score}%`}`} width={1200} height={630} /> : <div className="share-image-placeholder" role="status">{imageError ? '画像を用意できませんでした。投稿文とリンクは共有できます。' : '共有用の画像を用意しています…'}</div>}
        {chosen !== 'intro' && <label className="share-score-toggle" htmlFor={scoreId}><input id={scoreId} type="checkbox" checked={includeScore} onChange={e => { setIncludeScore(e.target.checked); setMessage(''); }} />備蓄の準備率（%）も載せる</label>}
        <p className="fine-print mt-3">家族構成・住所・避難先・備蓄の内訳は含みません。表示中の文章と画像だけを共有します。</p>
      </div><div>
        <label htmlFor={textId} className="share-text-label">投稿文のプレビュー</label><textarea id={textId} className="share-text" readOnly value={fullShareText(share)} onFocus={e => e.currentTarget.select()} />
        <div className="share-destinations"><a className="share-x" href={links.x} target="_blank" rel="noopener noreferrer">Xで投稿を作る ↗</a><a className="share-line" href={links.line} target="_blank" rel="noopener noreferrer">LINEで送る ↗</a>
          {typeof navigator.share === 'function' && <button type="button" onClick={() => { void nativeShare(); }}>ほかのアプリで共有</button>}<button type="button" onClick={() => { void copy(); }}>投稿文をコピー</button>
        </div><p className="fine-print mt-2">共有先で内容を確認・編集してから投稿できます。X・LINEのボタンは文章とリンクを渡します。今回の画像を載せるときは、保存して投稿画面に添付してください。</p>
        <div className="share-file-actions"><button type="button" disabled={!file} onClick={() => { if (file) void import('../logic/shareImage').then(m => { m.downloadShareFile(file); setMessage('画像の保存を開始しました。保存後、Instagramなどの投稿画面で選べます。'); }).catch(() => setMessage('画像を保存できませんでした。通信状況を確認してください。')); }}>画像を保存</button>{canShareImage && <button type="button" onClick={() => { void nativeShare(true); }}>画像を共有</button>}<button type="button" onClick={() => { void copy(true); }}>リンクだけコピー</button></div>
        {message && <p className="share-status" role="status">{message}</p>}
      </div></div>
    </div>}
  </details>;
}
