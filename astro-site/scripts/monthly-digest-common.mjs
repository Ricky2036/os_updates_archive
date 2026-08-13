import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { targetMonthlyOrders } from './monthly-digest-seeds.mjs';

export const siteRoot = path.resolve(import.meta.dirname, '..');
export const archiveRoot = path.resolve(siteRoot, '..');
export const articleDir = path.join(siteRoot, 'src/content/articles');
export const digestDir = path.join(siteRoot, 'src/content/monthly-digests');
export const workDir = path.join(siteRoot, '.monthly-work');
export const digestMediaDir = path.join(siteRoot, 'public/assets/digests');
export const negativeDigestPhrases = [
  '帮我记一下，今天午饭花了22元', '使用前', '使用后', '知道了', '已停1小时15分钟',
  '大学物理', '巴黎圣日耳曼', '银行** 卡号**', '联系人：张三', '免责声明', '升级路径', '推送日期',
];

const digestOrderSet = new Set(targetMonthlyOrders);
const hashCache = new Map();
let rawOcrCache;

export const toPosix = (value) => value.split(path.sep).join('/');
export const publicPath = (value) => value.replace(/^\/+/, '');

export async function exists(file) {
  try { const stat = await fs.stat(file); return stat.isFile() && stat.size > 0; } catch { return false; }
}

export async function hashFile(file) {
  if (hashCache.has(file)) return hashCache.get(file);
  const digest = createHash('sha256').update(await fs.readFile(file)).digest('hex');
  hashCache.set(file, digest);
  return digest;
}

export async function loadArticles() {
  const files = (await fs.readdir(articleDir)).filter((name) => name.endsWith('.json')).sort();
  return Promise.all(files.map(async (name) => ({
    file: name,
    data: JSON.parse(await fs.readFile(path.join(articleDir, name), 'utf8')),
  })));
}

export async function loadTargetArticles() {
  return (await loadArticles())
    .filter(({ data }) => digestOrderSet.has(data.order))
    .sort((a, b) => a.data.order - b.data.order);
}

async function loadRawOcr() {
  if (!rawOcrCache) rawOcrCache = JSON.parse(await fs.readFile(path.join(archiveRoot, 'raw_ocr_results.json'), 'utf8'));
  return rawOcrCache;
}

function normalizeSourcePath(value) {
  if (!value) return null;
  if (path.isAbsolute(value)) return value;
  return path.resolve(archiveRoot, value);
}

export async function articleSources(article) {
  const rawOcr = await loadRawOcr();
  const mapped = (rawOcr.article_map?.[article.articleId] ?? []).map(normalizeSourcePath).filter(Boolean);
  if (article.kind !== 'gallery') {
    const source = path.join(archiveRoot, 'assets/interactive', article.legacyPath);
    const available = [];
    if (await exists(source)) {
      available.push(source);
      const html = await fs.readFile(source, 'utf8');
      const refs = [...new Set([...html.matchAll(/(?:src|data-src|data-lazy-bgimg|href|xlink:href)=["']\/?(assets\/images\/[^"']+)["']/gi)].map((match) => match[1]))];
      for (const ref of refs) {
        const mediaSource = path.join(archiveRoot, ref);
        if (await exists(mediaSource)) {
          available.push(mediaSource);
          continue;
        }
        // Several WeChat exports kept the original .jpg reference while the
        // archived asset was losslessly re-encoded to WebP. Resolve that
        // deterministic sibling instead of treating the archive as missing.
        const webpSource = mediaSource.replace(/\.(?:jpe?g|png)$/i, '.webp');
        if (webpSource !== mediaSource && await exists(webpSource)) available.push(webpSource);
      }
    }
    for (const mappedSource of mapped) if (await exists(mappedSource)) available.push(mappedSource);
    if (available.length) return [...new Set(available)];
  }
  const available = [];
  for (const source of mapped) if (await exists(source)) available.push(source);
  if (available.length) return available;
  const fallback = path.join(archiveRoot, 'articles', article.legacyPath);
  return await exists(fallback) ? [fallback] : [];
}

export async function articleSourceHash(article) {
  const sources = await articleSources(article);
  const parts = [];
  for (const source of [...sources].sort()) {
    parts.push(`${toPosix(path.relative(archiveRoot, source))}\0${await hashFile(source)}`);
  }
  return createHash('sha256').update(parts.join('\n')).digest('hex');
}

export async function buildMonthlyDigest(article, reviewStatus = 'draft') {
  const { buildMonthlyDigestV2 } = await import('./monthly-digest-v2.mjs');
  return buildMonthlyDigestV2(article, reviewStatus);
}

export async function selectTargetArticles(selector) {
  const targets = await loadTargetArticles();
  if (!selector || selector === 'all') return targets;
  const normalized = String(selector).toLowerCase();
  const numericOrder = /^\d+$/.test(normalized) ? Number(normalized) : null;
  const selected = numericOrder === null
    ? targets.filter(({ file, data }) => file.toLowerCase().includes(normalized)
      || data.articleId.toLowerCase().includes(normalized) || data.slug.toLowerCase().includes(normalized))
    : targets.filter(({ data }) => data.order === numericOrder);
  if (!selected.length) throw new Error(`No monthly article matches: ${selector}`);
  return selected;
}

export async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
