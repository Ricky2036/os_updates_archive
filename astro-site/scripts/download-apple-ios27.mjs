import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');
const officialArchivesDir = path.join(siteDir, 'public/official_archives');
const appleDir = path.join(officialArchivesDir, 'www.apple.com.cn');

await fsp.mkdir(appleDir, { recursive: true });

function fetchBuffer(url, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.apple.com.cn/os/'
      },
      timeout: timeoutMs
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return fetchBuffer(redirectUrl, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200 && res.statusCode !== 206) {
        res.resume();
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout for ${url}`)); });
  });
}

function downloadStream(url, localPath, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://www.apple.com.cn/os/'
      },
      timeout: timeoutMs
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return downloadStream(redirectUrl, localPath, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200 && res.statusCode !== 206) {
        res.resume();
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      const fileStream = fs.createWriteStream(localPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(() => resolve()));
      fileStream.on('error', (err) => {
        fs.unlink(localPath, () => {});
        reject(err);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout for ${url}`)); });
  });
}

console.log('Fetching raw server HTML for both Apple pages...');
const [osHtmlBuf, aiHtmlBuf] = await Promise.all([
  fetchBuffer('https://www.apple.com.cn/os/'),
  fetchBuffer('https://www.apple.com.cn/apple-intelligence/')
]);

const osHtml = osHtmlBuf.toString('utf8');
const aiHtml = aiHtmlBuf.toString('utf8');

let capturedUrls = [];
try {
  capturedUrls = JSON.parse(await fsp.readFile('/tmp/apple_captured_urls.json', 'utf8'));
} catch (e) {}

let domOsHtml = '';
let domAiHtml = '';
try {
  domOsHtml = await fsp.readFile('/tmp/apple_os_index.html', 'utf8');
  domAiHtml = await fsp.readFile('/tmp/apple_apple-intelligence_index.html', 'utf8');
} catch (e) {}

const allUrls = new Set(capturedUrls);

function extractUrlsFromText(text, base) {
  if (!text) return;
  const patterns = [
    /src=["\x27]([^"\x27]+)["\x27]/gi,
    /href=["\x27]([^"\x27]+)["\x27]/gi,
    /poster=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*src=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*url=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*video=["\x27]([^"\x27]+)["\x27]/gi,
    /url\(["\x27]?([^)"\x27]+)["\x27]?\)/gi,
    /srcset=["\x27]([^"\x27]+)["\x27]/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1].trim();
      if (pattern.source.includes('srcset')) {
        for (const p of raw.split(',')) {
          const u = p.trim().split(/\s+/)[0];
          if (u) addUrl(u, base);
        }
      } else {
        addUrl(raw, base);
      }
    }
  }

  const jsonPathRegex = /"(\/[^"\\]+\.(?:jpg|png|webp|svg|mp4|woff2|css|js))"/gi;
  let jm;
  while ((jm = jsonPathRegex.exec(text)) !== null) {
    addUrl(jm[1], base);
  }
}

function addUrl(raw, base) {
  if (!raw || raw.startsWith('data:') || raw.startsWith('blob:') || raw.startsWith('javascript:') || raw.startsWith('#') || raw.startsWith('mailto:')) return;
  try {
    const resolved = new URL(raw, base).href;
    allUrls.add(resolved);

    if (resolved.includes('_large.')) {
      allUrls.add(resolved.replace('_large.', '_large_2x.'));
      allUrls.add(resolved.replace('_large.', '_medium.'));
      allUrls.add(resolved.replace('_large.', '_medium_2x.'));
      allUrls.add(resolved.replace('_large.', '_small.'));
      allUrls.add(resolved.replace('_large.', '_small_2x.'));
    } else if (resolved.includes('_small.')) {
      allUrls.add(resolved.replace('_small.', '_small_2x.'));
      allUrls.add(resolved.replace('_small.', '_medium.'));
      allUrls.add(resolved.replace('_small.', '_large.'));
      allUrls.add(resolved.replace('_small.', '_large_2x.'));
    }
  } catch (e) {}
}

extractUrlsFromText(osHtml, 'https://www.apple.com.cn/os/');
extractUrlsFromText(aiHtml, 'https://www.apple.com.cn/apple-intelligence/');
extractUrlsFromText(domOsHtml, 'https://www.apple.com.cn/os/');
extractUrlsFromText(domAiHtml, 'https://www.apple.com.cn/apple-intelligence/');

const allowedHosts = new Set(['www.apple.com.cn', 'www.apple.com']);
const cssUrls = [...allUrls].filter(u => {
  try {
    const p = new URL(u);
    return allowedHosts.has(p.hostname) && p.pathname.endsWith('.css');
  } catch(e) { return false; }
});

for (const cssUrl of cssUrls) {
  try {
    const buf = await fetchBuffer(cssUrl);
    const cssText = buf.toString('utf8');
    const regex = /url\(["\x27]?([^)"\x27]+)["\x27]?\)/gi;
    let m;
    while ((m = regex.exec(cssText)) !== null) {
      addUrl(m[1].trim(), cssUrl);
    }
  } catch (e) {}
}

// Supplemental animation videos
const animDirs = [
  'https://www.apple.com.cn/105/media/us/os/visionos/2026/e931143d-8b6a-4fac-b448-b6aecdd4ef90/anim/highlights-spatial-scenes/',
  'https://www.apple.com.cn/105/media/us/os/shared/2026/ddee26e5-ed05-4bf5-a59a-69f6cd265e29/anim/spatial-scenes/',
  'https://www.apple.com.cn/105/media/us/os/visionos/2026/e931143d-8b6a-4fac-b448-b6aecdd4ef90/anim/curved-windows/'
];
for (const dir of animDirs) {
  for (const file of ['large.mp4', 'medium.mp4', 'small.mp4', 'large.jpg', 'medium.jpg', 'small.jpg']) {
    allUrls.add(dir + file);
  }
}

// Supplemental scripts
for (const s of [
  'https://www.apple.com.cn/metrics/ac-analytics/2.30.0/scripts/ac-analytics.js',
  'https://www.apple.com.cn/metrics/ac-analytics/2.30.0/scripts/auto-init.js',
  'https://www.apple.com.cn/metrics/data-relay/1.2.0/scripts/data-relay.js',
  'https://www.apple.com.cn/metrics/data-relay/1.2.0/scripts/auto-relay.js'
]) {
  allUrls.add(s);
}

const ignoredPaths = [
  'securemetrics',
  'analytics',
  '/shop/bag/status',
  '/search-services/suggestions/',
  '/api-www/global-elements/global-header/v1/flyouts',
  'doubleclick',
  'google-analytics'
];

const downloadQueue = [];
const seenFiles = new Set();

for (const rawUrl of allUrls) {
  try {
    const parsed = new URL(rawUrl);
    if (!allowedHosts.has(parsed.hostname)) continue;
    if (ignoredPaths.some(ig => parsed.pathname.includes(ig) || parsed.hostname.includes(ig))) continue;

    if (parsed.pathname === '/' || parsed.pathname === '/os/' || parsed.pathname === '/os/index.html' ||
        parsed.pathname === '/apple-intelligence/' || parsed.pathname === '/apple-intelligence/index.html') {
      continue;
    }

    const ext = path.extname(parsed.pathname).toLowerCase();
    if (!ext && !parsed.pathname.includes('/wss/fonts/') && !parsed.pathname.includes('/globalheader.css')) {
      continue;
    }

    const decodedPath = decodeURIComponent(parsed.pathname);
    const cleanPath = decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath;
    const localFile = path.join(appleDir, cleanPath);

    if (seenFiles.has(localFile)) continue;
    seenFiles.add(localFile);

    downloadQueue.push({
      url: rawUrl,
      localFile,
      isMedia: ext === '.mp4' || ext === '.mov' || ext === '.webm'
    });
  } catch(e) {}
}

console.log(`Downloading ${downloadQueue.length} assets...`);
const CONCURRENCY = 12;
let completed = 0;
let skipped = 0;

async function worker(items) {
  for (const item of items) {
    if (fs.existsSync(item.localFile)) {
      try {
        const stat = fs.statSync(item.localFile);
        if (stat.size > 0) {
          skipped++;
          completed++;
          continue;
        }
      } catch(e) {}
    }

    try {
      if (item.isMedia) {
        await downloadStream(item.url, item.localFile);
      } else {
        const buf = await fetchBuffer(item.url);
        fs.mkdirSync(path.dirname(item.localFile), { recursive: true });
        await fsp.writeFile(item.localFile, buf);
      }
      completed++;
    } catch(err) {}
  }
}

const chunks = Array.from({ length: CONCURRENCY }, () => []);
downloadQueue.forEach((item, index) => chunks[index % CONCURRENCY].push(item));
await Promise.all(chunks.map(chunk => worker(chunk)));

// Process and save entry HTMLs
function processHtml(html) {
  const swScript = `<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}
</script>`;

  const hideStyle = `<style id="archive-hide-globalheader">
#globalheader, #globalmessage-segment, .globalmessage-segment, #globalnav, .globalnav { display: none !important; }
.section-spatial-experiences .media-block { --p-width: 696px; --p-height: 452px; }
@media (max-width: 1068px) { .section-spatial-experiences .media-block { --p-width: 644px; --p-height: 416px; } }
@media (max-width: 734px) { .section-spatial-experiences .media-block { --p-width: 260px; --p-height: 316px; } }
.section-spatial-experiences video, .section-spatial-experiences picture img { width: 100%; height: 100%; object-fit: cover; }
.media-block .fallback-frame { display: block !important; }
</style>`;

  let processed = html;
  if (!processed.includes("navigator.serviceWorker.register")) {
    processed = processed.replace('</head>', `${swScript}\n</head>`);
  }
  if (!processed.includes("archive-hide-globalheader")) {
    processed = processed.replace('</head>', `${hideStyle}\n</head>`);
  }
  // Remove data-empty sources so real images show immediately
  processed = processed.replace(/<source data-empty[^>]*>\s*/g, '');

  // Populate inline videos
  processed = processed.replace(/<video([^>]*data-inline-media-basepath="([^"]+)"[^>]*)><\/video>/g, (match, attrs, basepath) => {
    return '<video' + attrs + ' autoplay loop muted playsinline preload="auto">' +
      '<source src="' + basepath + 'large.mp4" type="video/mp4" media="(min-width:1069px)">' +
      '<source src="' + basepath + 'medium.mp4" type="video/mp4" media="(min-width:735px)">' +
      '<source src="' + basepath + 'small.mp4" type="video/mp4">' +
      '<source src="' + basepath + 'large.mp4" type="video/mp4">' +
      '</video>';
  });

  processed = processed.replace(
    /href=["\x27]\/wss\/fonts\?families=SF\+Pro[^"\x27]*["\x27]/g,
    'href="/wss/fonts/sf-pro.css"'
  );
  processed = processed.replace(
    /href=["\x27]\/wss\/fonts\?family=SF\+Pro\+SC[^"\x27]*["\x27]/g,
    'href="/wss/fonts/sf-pro-sc.css"'
  );
  return processed;
}

const osIndexPath = path.join(appleDir, 'os/index.html');
const aiIndexPath = path.join(appleDir, 'apple-intelligence/index.html');

await fsp.mkdir(path.dirname(osIndexPath), { recursive: true });
await fsp.mkdir(path.dirname(aiIndexPath), { recursive: true });

await fsp.writeFile(osIndexPath, processHtml(osHtml), 'utf8');
await fsp.writeFile(aiIndexPath, processHtml(aiHtml), 'utf8');

console.log(`Apple iOS 27 and Apple Intelligence archived successfully!`);
