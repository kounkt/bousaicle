import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
const target = process.argv[2];
if (!target) throw new Error('Usage: node scripts/stage-release.mjs /path/to/chiero-site');
const site = resolve(target);
if (readFileSync(join(site, 'CNAME'), 'utf8').trim() !== 'chiero.jp') throw new Error('Target is not the chiero.jp checkout.');
if (!existsSync('dist/index.html')) throw new Error('Build first.');
// Copy only the public build into the application path; never replace the site root.
cpSync('dist', join(site, 'bousaicle'), { recursive: true });
const files = ['index.html', 'en/index.html', 'llms.txt', 'en/llms.txt'];
for (const relative of files) {
  const file = join(site, relative);
  if (!existsSync(file)) continue;
  writeFileSync(file, readFileSync(file, 'utf8').replaceAll('https://kounkt.github.io/bousaicle/', 'https://chiero.jp/bousaicle/'));
}
const sitemap = join(site, 'sitemap.xml');
let xml = readFileSync(sitemap, 'utf8');
if (!xml.includes('<loc>https://chiero.jp/bousaicle/</loc>')) xml = xml.replace('</urlset>', '  <url>\n    <loc>https://chiero.jp/bousaicle/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>');
writeFileSync(sitemap, xml);
console.log(`Staged ${readdirSync('dist', { recursive: true }).length} entries to ${join(site, 'bousaicle')}. No publication performed.`);
