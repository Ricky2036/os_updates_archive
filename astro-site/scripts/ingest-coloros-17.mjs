import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const scratchDir = '/Users/jingzhan.chen/.gemini/antigravity/brain/44c3b15b-0164-4da5-9714-e9b54f03b5b3/scratch';
const siteDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(siteDir, '..');

const downloadedAssets = JSON.parse(await fs.readFile(path.join(scratchDir, 'downloaded_assets.json'), 'utf8'));
const cgiData = JSON.parse(await fs.readFile(path.join(scratchDir, 'extracted_cgiData.json'), 'utf8'));
const rawHtml = await fs.readFile(path.join(scratchDir, 'article_content.html'), 'utf8');

const publicInteractiveDir = path.join(siteDir, 'public/assets/legacy/interactive');
const rootInteractiveDir = path.join(repoDir, 'assets/images/interactive');
const coversDir = path.join(siteDir, 'public/assets/covers');
const compatDir = path.join(siteDir, 'public/compat/coloros/63-coloros-17');
const articlesDir = path.join(siteDir, 'src/content/articles');
const repoArticlesDir = path.join(repoDir, 'articles');

await fs.mkdir(publicInteractiveDir, { recursive: true });
await fs.mkdir(rootInteractiveDir, { recursive: true });
await fs.mkdir(coversDir, { recursive: true });
await fs.mkdir(compatDir, { recursive: true });

console.log('--- Processing Images with Sharp ---');
const urlToAssetMap = new Map();
const mediaInventory = [];
const seenHashes = new Set();

for (let i = 0; i < downloadedAssets.length; i++) {
  const item = downloadedAssets[i];
  const buf = await fs.readFile(item.localPath);

  try {
    const meta = await sharp(buf, { animated: true }).metadata();
    const isAnimated = Boolean(meta.pages && meta.pages > 1);

    let outBuf;
    let outExt = 'webp';
    let kind = isAnimated ? 'animated-image' : 'image';

    if (isAnimated) {
      outBuf = await sharp(buf, { animated: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    } else {
      outBuf = await sharp(buf)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
    }

    const hash = crypto.createHash('md5').update(outBuf).digest('hex');
    const filename = `${hash}.${outExt}`;

    await fs.writeFile(path.join(publicInteractiveDir, filename), outBuf);
    await fs.writeFile(path.join(rootInteractiveDir, filename), outBuf);

    const assetInfo = {
      id: hash.slice(0, 12),
      hash,
      filename,
      kind,
      width: meta.width || 1080,
      height: meta.height || 1080,
      bytes: outBuf.length,
      status: 'ready',
      src: `assets/legacy/interactive/${filename}`,
      compatSrc: `../../../assets/legacy/interactive/${filename}`,
      rootSrc: `assets/images/interactive/${filename}`
    };

    urlToAssetMap.set(item.url, assetInfo);

    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      mediaInventory.push(assetInfo);
    }

    console.log(`[${i+1}/${downloadedAssets.length}] OK: ${filename} (${meta.width}x${meta.height}, ${outBuf.length} B, ${kind})`);
  } catch (err) {
    console.error(`[${i+1}/${downloadedAssets.length}] Sharp Error on ${item.localPath}:`, err.message);
    const hash = item.hash;
    const filename = `${hash}.${item.ext}`;
    await fs.writeFile(path.join(publicInteractiveDir, filename), buf);
    await fs.writeFile(path.join(rootInteractiveDir, filename), buf);

    const assetInfo = {
      id: hash.slice(0, 12),
      hash,
      filename,
      kind: 'image',
      width: 1080,
      height: 1080,
      bytes: buf.length,
      status: 'ready',
      src: `assets/legacy/interactive/${filename}`,
      compatSrc: `../../../assets/legacy/interactive/${filename}`,
      rootSrc: `assets/images/interactive/${filename}`
    };

    urlToAssetMap.set(item.url, assetInfo);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      mediaInventory.push(assetInfo);
    }
  }
}

console.log(`\nUnique processed media assets count: ${mediaInventory.length}`);

// --- Cover Generation ---
console.log('\n--- Generating Responsive Cover ---');
const coverUrl = cgiData.cover_url || cgiData.cdn_url || downloadedAssets[0]?.url;
const coverAsset = urlToAssetMap.get(coverUrl) || mediaInventory[0];
const coverInputBuf = await fs.readFile(path.join(publicInteractiveDir, coverAsset.filename));

const coverKey = crypto.createHash('sha1').update(`cover:coloros-17:${coverAsset.filename}`).digest('hex').slice(0, 16);
const widths = [480, 800, 1200];
const webpSrcs = [];
const avifSrcs = [];

for (const width of widths) {
  const height = Math.round((width * 9) / 16);
  const pipeline = () =>
    sharp(coverInputBuf, { pages: 1 })
      .flatten({ background: '#0a0a0c' })
      .resize(width, height, { fit: 'cover', position: 'top' });

  const webpName = `${coverKey}-${width}.webp`;
  const avifName = `${coverKey}-${width}.avif`;

  await pipeline().webp({ quality: 80, effort: 4 }).toFile(path.join(coversDir, webpName));
  await pipeline().avif({ quality: 58, effort: 4 }).toFile(path.join(coversDir, avifName));

  webpSrcs.push({ width, src: `assets/covers/${webpName}` });
  avifSrcs.push({ width, src: `assets/covers/${avifName}` });
}

let dominantColor = '#080808';
try {
  const { dominant } = await sharp(coverInputBuf, { pages: 1 })
    .resize(64, 64, { fit: 'cover', position: 'top' })
    .stats();
  dominantColor = `#${[dominant.r, dominant.g, dominant.b].map((p) => p.toString(16).padStart(2, '0')).join('')}`;
} catch (e) {
  console.warn('Dominant color error:', e.message);
}

const coverMetadata = {
  src: webpSrcs.at(-1).src,
  srcset: webpSrcs.map((item) => `${item.src} ${item.width}w`).join(', '),
  avifSrcset: avifSrcs.map((item) => `${item.src} ${item.width}w`).join(', '),
  width: 1200,
  height: 675,
  alt: 'ColorOS 17 正式发布！亮点抢先看 封面',
  dominantColor,
  focalPoint: '50% 0%'
};

// --- Rewriting HTML Content ---
console.log('\n--- Rewriting HTML for Compat and Legacy ---');
let compatHtml = rawHtml;
let rootHtml = rawHtml;

// Sort by URL length descending so longer matching URLs replace first
const sortedEntries = Array.from(urlToAssetMap.entries()).sort((a, b) => b[0].length - a[0].length);

for (const [rawUrl, asset] of sortedEntries) {
  const escapedUrl = rawUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  compatHtml = compatHtml.replace(new RegExp(escapedUrl, 'g'), asset.compatSrc);
  rootHtml = rootHtml.replace(new RegExp(escapedUrl, 'g'), asset.rootSrc);
}

// Add data-lazy-bgimg attributes to svg/sections with background urls for progressive loading and fallback reporting
compatHtml = compatHtml.replace(/background(?:-image)?\s*:\s*url\((['"]?)([^'")]+)\1\)/gi, (match, _quote, url) => {
  return `${match} data-lazy-bgimg="${url}"`;
});

// Construct Compat Standalone Page with resize reporter script
const compatFullPage = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>ColorOS 17 正式发布！亮点抢先看</title><style>
:root{color-scheme:light}*{box-sizing:border-box}html,body{margin:0;min-width:0;background:#fff}body{overflow-x:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}.compat-root{width:100%;min-height:100vh;overflow:hidden}.compat-root img,.compat-root video,.compat-root svg{max-width:100%;height:auto}.media-fallback{display:grid;place-items:center;min-height:160px;padding:24px;border:1px dashed #d7dbe1;border-radius:16px;color:#737983;background:#f6f7f9;font-size:14px}
</style></head><body data-compat-id="63-coloros-17"><main class="compat-root"><style>
        body, html { margin: 0; padding: 0; overflow-x: hidden; background: #fff; }
        #js_content { max-width: 100% !important; box-sizing: border-box; }
        /* Make sure scroll snapping works smoothly */
        section { max-width: 100% !important; }
    </style>
<section class="card">
  <div class="card-body">
    <div class="interactive-container" style="width: 100%; overflow: hidden;">
      <div class="rich_media_content js_underline_content autoTypeSetting24psection fix_apple_default_style" id="js_content" style="">${compatHtml}</div>
    </div>
  </div>
</section></main>
<script>
(()=>{const id=document.body.dataset.compatId;const report=()=>parent.postMessage({type:'os-archive:resize',id,height:Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)},'*');
const reveal=(el)=>{const url=el.getAttribute('data-lazy-bgimg');if(url){const probe=new Image();probe.onload=()=>{el.style.setProperty('background-image','url("'+url+'")','important');report()};probe.onerror=()=>el.insertAdjacentHTML('afterend','<div class="media-fallback">该背景媒体暂不可用</div>');probe.src=url}}
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target)}}),{rootMargin:'800px 0px'}):null;
document.querySelectorAll('[data-lazy-bgimg]').forEach(el=>observer?observer.observe(el):reveal(el));document.querySelectorAll('img[data-src]').forEach(img=>{img.loading='lazy';img.src=img.dataset.src});document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{if(img.dataset.failed)return;img.dataset.failed='1';const fallback=document.createElement('div');fallback.className='media-fallback';fallback.textContent='该图片暂不可用';img.replaceWith(fallback);report()}));
if('ResizeObserver'in window)new ResizeObserver(report).observe(document.body);addEventListener('load',report);document.fonts?.ready.then(report);setTimeout(report,100);setTimeout(report,600);setTimeout(report,1600)})();
</script></body></html>`;

await fs.writeFile(path.join(compatDir, 'index.html'), compatFullPage, 'utf8');
console.log('Compat index.html created at:', path.join(compatDir, 'index.html'));

// Construct Legacy Root HTML
const articleFilename = 'ColorOS_17_正式发布！亮点抢先看.html';
const legacyArticleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <title>ColorOS 17 正式发布！亮点抢先看</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        body { background-color: transparent; }
        .card { margin-bottom: 0; box-shadow: none; border: none; background: transparent; backdrop-filter: none; padding: 0; }
        .webm-container { position: relative; width: 100%; }
        .webm-container video { width: 100%; display: block; }
    </style>
</head>
<body>
    <section class="card">
        <div class="card-body">
          <div class="interactive-container" style="width: 100%; overflow: hidden;">
            <div class="rich_media_content js_underline_content autoTypeSetting24psection fix_apple_default_style" id="js_content" style="">${rootHtml}</div>
          </div>
        </div>
    </section>
</body>
</html>`;

await fs.writeFile(path.join(repoArticlesDir, articleFilename), legacyArticleHtml, 'utf8');
console.log('Legacy article created at:', path.join(repoArticlesDir, articleFilename));

// Construct 63-coloros.json
const articleJson = {
  articleId: 'ColorOS_17_正式发布！亮点抢先看',
  order: 63,
  title: 'ColorOS 17 正式发布！亮点抢先看',
  brand: 'coloros',
  year: 2026,
  publishedAt: '2026-09-17',
  slug: '63-coloros-17',
  kind: 'microsite',
  legacyPath: articleFilename,
  html: '',
  compatPath: 'compat/coloros/63-coloros-17/index.html',
  cover: coverMetadata,
  media: mediaInventory.map(m => ({
    id: m.id,
    kind: m.kind,
    src: m.src,
    width: m.width,
    height: m.height,
    bytes: m.bytes,
    status: m.status
  }))
};

await fs.writeFile(path.join(articlesDir, '63-coloros.json'), JSON.stringify(articleJson, null, 2) + '\n', 'utf8');
console.log('Article JSON created at:', path.join(articlesDir, '63-coloros.json'));
