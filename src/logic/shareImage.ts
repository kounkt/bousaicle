// そなえスコアのシェア画像(Canvas)。個人情報(家族構成・地域・メモ等)は載せない。
const BASE = import.meta.env.BASE_URL;

async function loadImg(src: string): Promise<HTMLImageElement | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    return img;
  } catch {
    return null;
  }
}

async function drawShareImage(score: number): Promise<HTMLCanvasElement> {
  const size = 1080;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const x = c.getContext('2d')!;

  // 背景+ドット(デザインシートのモチーフ)
  x.fillStyle = '#FFFFFF';
  x.fillRect(0, 0, size, size);
  x.fillStyle = 'rgba(17,17,17,0.05)';
  for (let dy = 60; dy < size - 40; dy += 28) {
    for (let dx = 60; dx < size - 40; dx += 28) {
      x.beginPath();
      x.arc(dx, dy, 3, 0, Math.PI * 2);
      x.fill();
    }
  }
  // 外枠(シート感)
  x.strokeStyle = '#111111';
  x.lineWidth = 10;
  x.strokeRect(30, 30, size - 60, size - 60);
  // ヘッダー帯
  x.fillStyle = '#E60012';
  x.fillRect(30, 30, size - 60, 130);
  x.fillStyle = '#FFFFFF';
  x.font = 'bold 64px "Hiragino Sans", sans-serif';
  x.textAlign = 'center';
  x.fillText('わが家のそなえスコア', size / 2, 122);

  // チエロ(イラスト。読み込めない環境では帽子だけ描く)
  const chiero = await loadImg(`${BASE}chiero/hero.webp`);
  if (chiero) {
    x.drawImage(chiero, size / 2 - 170, 190, 340, 340);
  } else {
    const hx = size / 2;
    const hy = 380;
    x.fillStyle = '#E60012';
    x.beginPath();
    x.ellipse(hx, hy + 60, 220, 60, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(hx - 140, hy + 55);
    x.quadraticCurveTo(hx - 140, hy - 120, hx, hy - 120);
    x.quadraticCurveTo(hx + 140, hy - 120, hx + 140, hy + 55);
    x.closePath();
    x.fill();
    x.fillStyle = '#111111';
    x.fillRect(hx - 142, hy + 8, 284, 40);
  }

  // スコア
  x.fillStyle = '#111111';
  x.font = 'bold 240px "Hiragino Sans", sans-serif';
  x.fillText(String(score), size / 2 - 30, 810);
  x.font = 'bold 72px "Hiragino Sans", sans-serif';
  x.fillText('点', size / 2 - 30 + String(score).length * 70 + 60, 810);

  // ✦(ちょいキラ)
  x.fillStyle = '#E60012';
  x.font = '56px sans-serif';
  x.fillText('✦', 150, 300);
  x.fillText('✦', size - 150, 720);

  // フッター
  x.fillStyle = '#111111';
  x.font = 'bold 42px "Hiragino Sans", sans-serif';
  x.fillText('あなたも3分でチェック → ボウサイクル', size / 2, 975);

  return c;
}

export async function downloadShareImage(score: number): Promise<void> {
  const canvas = await drawShareImage(score);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonae-score-${score}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
