// チエロのSNSリンク集。控えめに、でも見つけたい人には見つかるように。
const SNS: { label: string; url: string }[] = [
  { label: 'LINE', url: 'https://lin.ee/YCCoRsBu' },
  { label: 'TikTok', url: 'https://vt.tiktok.com/ZSTvdJ3e/' },
  { label: 'X (Twitter)', url: 'https://twitter.com/chiero_piero' },
  { label: 'Instagram', url: 'https://www.instagram.com/chiero_piero/' },
  { label: 'YouTube', url: 'https://www.youtube.com/channel/UCS9wlXLeVxTqXgPWU3kn7EQ' },
  { label: 'note', url: 'https://note.com/kounkt' },
];

export function ChieroLinks() {
  return (
    <div className="text-center">
      <p className="text-xs font-bold text-ink/50">つくった人: チエロ 🤹‍♂️</p>
      <nav aria-label="チエロのSNS" className="mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {SNS.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-ink/40 underline-offset-2 transition hover:text-brand hover:underline"
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
