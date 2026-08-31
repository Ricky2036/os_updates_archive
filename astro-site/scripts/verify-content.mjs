import fs from 'node:fs/promises';
import path from 'node:path';

const site = path.resolve(import.meta.dirname, '..');
const contentDir = path.join(site, 'src/content/articles');
const compatDir = path.join(site, 'public/compat');
const manifestDir = path.join(site, 'public/manifests');
const magicPagePath = path.join(site, 'src/pages/magicos/[official].astro');
const officialConfigPath = path.join(site, 'src/lib/official-archives.ts');
const serviceWorkerPath = path.join(site, 'public/sw.js');
const files = (await fs.readdir(contentDir)).filter((name) => name.endsWith('.json')).sort();
const articles = await Promise.all(files.map(async (name) => JSON.parse(await fs.readFile(path.join(contentDir, name), 'utf8'))));
const fail = (message) => { throw new Error(message); };

if (!articles.length) fail('No articles found');
if (new Set(articles.map((article) => article.articleId)).size !== articles.length) fail('Article IDs are not unique');
if (new Set(articles.map((article) => `${article.brand}/${article.year}/${article.slug}`)).size !== articles.length) fail('Article routes are not unique');
const interactive = articles.filter((article) => article.kind !== 'gallery');
if (interactive.length !== 16) fail(`Expected 16 interactive articles, found ${interactive.length}`);
for (const article of articles) {
  if (!article.title || !article.legacyPath || !article.cover) fail(`Incomplete metadata: ${article.articleId}`);
  if (article.kind === 'gallery' && !article.html) fail(`Gallery has no HTML: ${article.articleId}`);
  if (article.kind !== 'gallery') {
    const compat = path.join(compatDir, article.brand, article.slug, 'index.html');
    if (!(await fs.stat(compat).catch(() => null))?.size) fail(`Missing compatibility page: ${article.articleId}`);
  }
}
const videos = JSON.parse(await fs.readFile(path.join(manifestDir, 'coloros16-media.json'), 'utf8'));
if (videos.length !== 59) fail(`Expected 59 ColorOS 16 video references, found ${videos.length}`);
if (videos.filter((video) => video.status === 'ready').length !== 30) fail('Unexpected local ColorOS 16 video inventory');
const migration = JSON.parse(await fs.readFile(path.join(manifestDir, 'migration-report.json'), 'utf8'));
if (migration.articles > articles.length || migration.interactive !== interactive.length) fail('Migration report does not match the migrated catalog');
const official = JSON.parse(await fs.readFile(path.join(manifestDir, 'official-archives.json'), 'utf8'));
if (official.release !== 'v2026-07-30' || official.entryPages !== 6 || official.videos !== 119 || official.files !== 380) fail('Official ColorOS archive manifest is incomplete');
const magicPage = await fs.readFile(magicPagePath, 'utf8');
if (/serviceWorker\.register/.test(magicPage)) fail('MagicOS iframe must not register the root Service Worker');
const officialConfig = await fs.readFile(officialConfigPath, 'utf8');
if (!officialConfig.includes('PUBLIC_MAGICOS_ARCHIVE_BASE_URL')) fail('MagicOS archive CDN configuration is missing');
console.log(`Content verified: ${articles.length} articles, ${interactive.length} interactive pages, ${videos.filter((video) => video.status === 'ready').length}/${videos.length} article videos, ${official.videos} official archive videos.`);
