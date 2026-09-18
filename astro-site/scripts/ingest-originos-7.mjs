import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const siteDir = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(siteDir, '..');

const publicInteractiveDir = path.join(siteDir, 'public/assets/legacy/interactive');
const rootInteractiveDir = path.join(repoDir, 'assets/images/interactive');
const coversDir = path.join(siteDir, 'public/assets/covers');
const compatDir = path.join(siteDir, 'public/compat/originos/64-originos-7');
const articlesDir = path.join(siteDir, 'src/content/articles');
const repoArticlesDir = path.join(repoDir, 'articles');

await fs.mkdir(publicInteractiveDir, { recursive: true });
await fs.mkdir(rootInteractiveDir, { recursive: true });
await fs.mkdir(coversDir, { recursive: true });
await fs.mkdir(compatDir, { recursive: true });

console.log('1. Launching Puppeteer to fetch WeChat article...');
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920 });

await page.goto('https://mp.weixin.qq.com/s/1G1vlYNGfypfd4WOcyMrLw', { waitUntil: 'networkidle2' });

const pageData = await page.evaluate(() => {
  const contentEl = document.querySelector('#js_content');
  const title = document.querySelector('#activity-name')?.textContent?.trim() || '带你一图读懂 OriginOS 7';
  const ogImg = document.querySelector('meta[property="og:image"]')?.content || '';
  const scriptMatch = document.body.innerHTML.match(/msg_cdn_url\s*=\s*["']([^"']+)["']/);
  const coverUrl = ogImg || (scriptMatch ? scriptMatch[1] : '');
  
  return {
    title,
    coverUrl,
    rawHtml: contentEl ? contentEl.innerHTML : ''
  };
});

await browser.close();

console.log('Article Title:', pageData.title);
console.log('Cover URL:', pageData.coverUrl);

// Extract all asset URLs
const rawUrls = new Set();
if (pageData.coverUrl) rawUrls.add(pageData.coverUrl);

// Match <image href="..."> and <image xlink:href="...">
const imageHrefRegex = /<image[^>]+(?:href|xlink:href)=["']([^"']+)["']/gi;
let m;
while ((m = imageHrefRegex.exec(pageData.rawHtml)) !== null) {
  if (m[1].startsWith('http')) rawUrls.add(m[1]);
}

// Match background url(...)
const bgRegex = /url\((?:&quot;|['"]|\\&quot;)?([^'")&]+)(?:&quot;|['"]|\\&quot;)?\)/gi;
while ((m = bgRegex.exec(pageData.rawHtml)) !== null) {
  if (m[1].startsWith('http')) rawUrls.add(m[1]);
}

// Match data-lazy-bgimg
const lazyRegex = /data-lazy-bgimg=["']([^"']+)["']/gi;
while ((m = lazyRegex.exec(pageData.rawHtml)) !== null) {
  if (m[1].startsWith('http')) rawUrls.add(m[1]);
}

// Match img src
const imgRegex = /<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi;
while ((m = imgRegex.exec(pageData.rawHtml)) !== null) {
  if (m[1].startsWith('http')) rawUrls.add(m[1]);
}

console.log(`Extracted ${rawUrls.size} asset URLs`);

// Helper to download a buffer from URL
async function fetchBuffer(urlStr) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https:') ? https : http;
    const req = client.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(new URL(res.headers.location, urlStr).toString()).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
  });
}

console.log('2. Downloading and processing all assets with Sharp...');
const urlToAssetMap = new Map();
const mediaInventory = [];
const seenHashes = new Set();

const rawUrlList = Array.from(rawUrls);
for (let i = 0; i < rawUrlList.length; i++) {
  const originalUrl = rawUrlList[i];
  
  // Transform /640 to /0 for highest original resolution
  let hiResUrl = originalUrl;
  if (hiResUrl.includes('/640?')) {
    hiResUrl = hiResUrl.replace('/640?', '/0?');
  }
  
  try {
    let buf;
    try {
      buf = await fetchBuffer(hiResUrl);
    } catch {
      buf = await fetchBuffer(originalUrl);
    }
    
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
    
    urlToAssetMap.set(originalUrl, assetInfo);
    urlToAssetMap.set(hiResUrl, assetInfo);
    
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      mediaInventory.push(assetInfo);
    }
    
    console.log(`[${i+1}/${rawUrlList.length}] Processed: ${filename} (${meta.width}x${meta.height}, ${outBuf.length} B)`);
  } catch (err) {
    console.error(`Failed to process asset ${originalUrl}:`, err.message);
  }
}

// 3. Generate Responsive Cover
console.log('3. Generating 16:9 responsive covers...');
const coverAsset = urlToAssetMap.get(pageData.coverUrl) || mediaInventory[0];
const coverInputBuf = await fs.readFile(path.join(publicInteractiveDir, coverAsset.filename));

const coverKey = crypto.createHash('sha1').update(`cover:originos-7:${coverAsset.filename}`).digest('hex').slice(0, 16);
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
  alt: `${pageData.title} 封面`,
  dominantColor,
  focalPoint: '50% 0%'
};

// 4. HTML URL Rewriting and Cleanup
console.log('4. Rewriting HTML content...');
let compatHtml = pageData.rawHtml;
let rootHtml = pageData.rawHtml;

// Sort by URL length descending
const sortedEntries = Array.from(urlToAssetMap.entries()).sort((a, b) => b[0].length - a[0].length);

for (const [rawUrl, asset] of sortedEntries) {
  const escapedUrl = rawUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  compatHtml = compatHtml.replace(new RegExp(escapedUrl, 'g'), asset.compatSrc);
  rootHtml = rootHtml.replace(new RegExp(escapedUrl, 'g'), asset.rootSrc);
}

// Replace &quot; inside style with single quote '
compatHtml = compatHtml.replace(/&quot;/g, "'");
rootHtml = rootHtml.replace(/&quot;/g, "'");

// Fix SVG attributes
compatHtml = compatHtml
  .replace(/viewbox=/gi, 'viewBox=')
  .replace(/foreignobject=/gi, 'foreignObject=')
  .replace(/animatetransform=/gi, 'animateTransform=')
  .replace(/attributename=/gi, 'attributeName=')
  .replace(/calcmode=/gi, 'calcMode=')
  .replace(/keysplines=/gi, 'keySplines=')
  .replace(/repeatcount=/gi, 'repeatCount=')
  .replace(/preserveaspectratio=/gi, 'preserveAspectRatio=');

rootHtml = rootHtml
  .replace(/viewbox=/gi, 'viewBox=')
  .replace(/foreignobject=/gi, 'foreignObject=')
  .replace(/animatetransform=/gi, 'animateTransform=')
  .replace(/attributename=/gi, 'attributeName=')
  .replace(/calcmode=/gi, 'calcMode=')
  .replace(/keysplines=/gi, 'keySplines=')
  .replace(/repeatcount=/gi, 'repeatCount=')
  .replace(/preserveaspectratio=/gi, 'preserveAspectRatio=');

// 5. Generate Standalone Compat HTML
const compatFullPage = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${pageData.title}</title><style>
:root{color-scheme:light}*{box-sizing:border-box}html,body{margin:0;min-width:0;background:#fff}body{overflow-x:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}.compat-root{width:100%;min-height:100vh;overflow:hidden}.compat-root img,.compat-root video,.compat-root svg{max-width:100%;height:auto}.media-fallback{display:grid;place-items:center;min-height:160px;padding:24px;border:1px dashed #d7dbe1;border-radius:16px;color:#737983;background:#f6f7f9;font-size:14px}
</style></head><body data-compat-id="64-originos-7"><main class="compat-root"><style>
        body, html { margin: 0; padding: 0; overflow-x: hidden; background: #fff; }
        #js_content { max-width: 100% !important; box-sizing: border-box; }
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

// 6. Generate Legacy Root HTML
const articleFilename = '带你一图读懂_OriginOS_7.html';
const legacyArticleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <title>${pageData.title}</title>
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

// 7. Update data_originos.js
console.log('7. Updating data_originos.js...');
const dataOriginosPath = path.join(repoDir, 'data_originos.js');
let dataOriginosContent = await fs.readFile(dataOriginosPath, 'utf8');
const articleBody = `<section class="card">\n        <div class="card-body">\n          <div class="interactive-container" style="width: 100%; overflow: hidden;">\n            <div class="rich_media_content js_underline_content autoTypeSetting24psection fix_apple_default_style" id="js_content" style="">${rootHtml}</div>\n          </div>\n        </div>\n    </section>`;

// Parse window.articleData = { ... }
const jsonMatch = dataOriginosContent.match(/window\.articleData\s*=\s*(\{[\s\S]*\});?/);
if (jsonMatch) {
  try {
    const dataObj = JSON.parse(jsonMatch[1]);
    dataObj['带你一图读懂_OriginOS_7'] = articleBody;
    // Put new key first
    const reordered = { '带你一图读懂_OriginOS_7': articleBody, ...dataObj };
    dataOriginosContent = `window.articleData = ${JSON.stringify(reordered)};\n`;
    await fs.writeFile(dataOriginosPath, dataOriginosContent, 'utf8');
    console.log('Updated data_originos.js');
  } catch (e) {
    console.warn('JSON parse error on data_originos.js, doing string injection:', e.message);
    const injectStr = `"带你一图读懂_OriginOS_7": ${JSON.stringify(articleBody)},`;
    dataOriginosContent = dataOriginosContent.replace('window.articleData = {', `window.articleData = {\n${injectStr}`);
    await fs.writeFile(dataOriginosPath, dataOriginosContent, 'utf8');
  }
}

// 8. Generate 64-originos.json
console.log('8. Generating 64-originos.json...');
const articleJson = {
  articleId: '带你一图读懂_OriginOS_7',
  order: 64,
  title: pageData.title,
  brand: 'originos',
  year: 2026,
  publishedAt: '2026-09-16',
  slug: '64-originos-7',
  kind: 'microsite',
  legacyPath: articleFilename,
  html: '',
  compatPath: 'compat/originos/64-originos-7/index.html',
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

await fs.writeFile(path.join(articlesDir, '64-originos.json'), JSON.stringify(articleJson, null, 2) + '\n', 'utf8');
console.log('Created 64-originos.json');

console.log('\n--- OriginOS 7 Ingestion Complete! ---');
