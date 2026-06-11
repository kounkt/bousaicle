// そなえスコアのシェア画像(Canvas)。個人情報(家族構成・地域)は載せない。
export function drawShareImage(score: number): HTMLCanvasElement {
  const size = 1080;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const x = c.getContext('2d')!;

  // 背景
  x.fillStyle = '#FFFFFF';
  x.fillRect(0, 0, size, size);
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

  // チエロの帽子
  const hx = size / 2;
  const hy = 400;
  x.fillStyle = '#E60012';
  x.beginPath();
  x.ellipse(hx, hy + 60, 230, 65, 0, 0, Math.PI * 2);
  x.fill();
  x.beginPath();
  x.moveTo(hx - 150, hy + 55);
  x.quadraticCurveTo(hx - 150, hy - 130, hx, hy - 130);
  x.quadraticCurveTo(hx + 150, hy - 130, hx + 150, hy + 55);
  x.closePath();
  x.fill();
  x.fillStyle = '#111111';
  x.fillRect(hx - 152, hy + 8, 304, 42);

  // スコア
  x.fillStyle = '#111111';
  x.font = 'bold 300px "Hiragino Sans", sans-serif';
  x.fillText(String(score), hx, 850);
  x.font = 'bold 80px "Hiragino Sans", sans-serif';
  x.fillText('点', hx + (String(score).length * 85), 850);

  // ✦(ちょいキラ)
  x.fillStyle = '#E60012';
  x.font = '60px sans-serif';
  x.fillText('✦', 160, 300);
  x.fillText('✦', size - 160, 760);

  // フッター
  x.fillStyle = '#111111';
  x.font = '44px "Hiragino Sans", sans-serif';
  x.fillText('あなたも3分でチェック → ボウサイクル', size / 2, 980);

  return c;
}

export function downloadShareImage(score: number): void {
  const canvas = drawShareImage(score);
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
