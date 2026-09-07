import { PUBLIC_APP_URL, type PublicShare } from './social';
const BASE = import.meta.env.BASE_URL;
const FONT = '"Hiragino Sans", "Noto Sans JP", sans-serif';
async function loadImg(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

/** Render only the public message, optional percentage, and existing Chiero illustration. */
export async function createShareFile(share: PublicShare): Promise<File> {
  if (share.moment === 'intro') {
    const response = await fetch(`${BASE}og.png`);
    if (!response.ok) throw new Error('Card image unavailable');
    return new File([await response.blob()], 'bousaicle.png', { type: 'image/png' });
  }
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 630;
  const x = c.getContext('2d');
  if (!x) throw new Error('Image export unavailable');
  const chiero = await loadImg(`${BASE}chiero/hero.webp`);
  x.fillStyle = '#F1F4EA'; x.fillRect(0, 0, 1200, 630);
  x.fillStyle = '#FFFFFF'; x.fillRect(20, 20, 1160, 590);
  x.fillStyle = '#D91724'; x.fillRect(68, 78, 7, 34);
  x.fillStyle = '#202824'; x.font = `bold 30px ${FONT}`; x.fillText('ボウサイクル', 92, 104);
  x.fillStyle = '#DADDD7'; x.fillRect(68, 138, 640, 1);
  x.font = `bold 65px ${FONT}`;
  share.headline.forEach((line, index) => { x.fillStyle = index === 0 ? '#202824' : '#D91724'; x.fillText(line, 68, 240 + index * 88, 675); });
  x.fillStyle = '#526158'; x.font = `28px ${FONT}`; x.fillText(share.description, 68, 398, 675);
  if (share.score !== undefined) {
    x.fillStyle = '#202824'; x.font = `bold 28px ${FONT}`; x.fillText(`備蓄の準備率  ${share.score}%`, 68, 465);
    x.fillStyle = '#526158'; x.font = `18px ${FONT}`; x.fillText('数量の目安です。災害時の安全を保証するものではありません。', 68, 504);
  }
  x.drawImage(chiero, 780, 152, 370, 370);
  x.fillStyle = '#202824'; x.font = `24px ${FONT}`; x.fillText(PUBLIC_APP_URL.replace('https://', ''), 68, 565);
  x.fillStyle = '#526158'; x.font = `20px ${FONT}`; x.fillText('登録不要・無料', 906, 565);
  const blob = await new Promise<Blob>((resolve, reject) => c.toBlob(value => value ? resolve(value) : reject(new Error('Image export failed')), 'image/png'));
  return new File([blob], `bousaicle-${share.moment}.png`, { type: 'image/png' });
}
export function downloadShareFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
