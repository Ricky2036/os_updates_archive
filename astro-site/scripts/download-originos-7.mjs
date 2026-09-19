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

const allUrls = JSON.parse(await fsp.readFile(path.join(__dirname, 'all_target_urls_fixed.json'), 'utf8'));

// Filter static asset domains
const allowedHosts = new Set([
  'wwwstatic.vivo.com.cn',
  'wwwresstatic.vivo.com.cn',
  'www.vivo.com.cn',
  'cn-exstatic-vivofs.iqoo.com',
  'res.wx.qq.com',
]);

const ignoredPaths = [
  '/hm.js',
  '/vmonitor.min.js',
  '/h5/reportsingle',
  '/h5/monitor',
  '/open/api',
  '/login',
  '/register',
  '/shoppingcart',
  '/order',
  '/set/cookie'
];

const downloadQueue = [];

for (const rawUrl of allUrls) {
  try {
    const parsed = new URL(rawUrl);
    if (!allowedHosts.has(parsed.hostname)) continue;
    if (ignoredPaths.some(p => parsed.pathname.includes(p))) continue;
    if (parsed.pathname === '/' || parsed.pathname === '/originos') continue;

    const decodedPath = decodeURIComponent(parsed.pathname);
    const localFile = path.join(officialArchivesDir, parsed.hostname, decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath);

    downloadQueue.push({
      url: rawUrl,
      host: parsed.hostname,
      localFile
    });
  } catch (e) {}
}

console.log(`Total downloadable assets in queue: ${downloadQueue.length}`);

function downloadFileWithTimeout(item, retries = 3) {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (result) => {
      if (!finished) {
        finished = true;
        resolve(result);
      }
    };

    const timer = setTimeout(() => {
      if (retries > 0) {
        downloadFileWithTimeout(item, retries - 1).then(finish);
      } else {
        finish({ success: false, error: 'OverallTimeout', url: item.url });
      }
    }, 30000);

    // Check if file exists and has size > 0
    if (fs.existsSync(item.localFile)) {
      try {
        const stat = fs.statSync(item.localFile);
        if (stat.size > 0) {
          clearTimeout(timer);
          return finish({ success: true, skipped: true, size: stat.size });
        }
      } catch (e) {}
    }

    const dir = path.dirname(item.localFile);
    fs.mkdirSync(dir, { recursive: true });

    const client = item.url.startsWith('https:') ? https : http;
    const req = client.get(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.vivo.com.cn/originos'
      },
      timeout: 20000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, item.url).href;
        }
        item.url = redirectUrl;
        clearTimeout(timer);
        return downloadFileWithTimeout(item, retries - 1).then(finish);
      }

      if (res.statusCode !== 200 && res.statusCode !== 206) {
        res.resume();
        clearTimeout(timer);
        if (retries > 0) {
          setTimeout(() => downloadFileWithTimeout(item, retries - 1).then(finish), 500);
        } else {
          finish({ success: false, status: res.statusCode, url: item.url });
        }
        return;
      }

      const fileStream = fs.createWriteStream(item.localFile);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          clearTimeout(timer);
          try {
            const stat = fs.statSync(item.localFile);
            finish({ success: true, size: stat.size });
          } catch (e) {
            finish({ success: true, size: 0 });
          }
        });
      });

      fileStream.on('error', (err) => {
        fs.unlink(item.localFile, () => {});
        clearTimeout(timer);
        if (retries > 0) {
          setTimeout(() => downloadFileWithTimeout(item, retries - 1).then(finish), 500);
        } else {
          finish({ success: false, error: err.message, url: item.url });
        }
      });
    });

    req.on('error', (err) => {
      clearTimeout(timer);
      if (retries > 0) {
        setTimeout(() => downloadFileWithTimeout(item, retries - 1).then(finish), 500);
      } else {
        finish({ success: false, error: err.message, url: item.url });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      clearTimeout(timer);
      if (retries > 0) {
        setTimeout(() => downloadFileWithTimeout(item, retries - 1).then(finish), 500);
      } else {
        finish({ success: false, error: 'SocketTimeout', url: item.url });
      }
    });
  });
}

// Pool runner
async function runPool(items, concurrency = 25) {
  let index = 0;
  let completed = 0;
  let downloadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let totalBytes = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      if (index >= items.length) break;
      const currentIdx = index++;
      const item = items[currentIdx];
      const res = await downloadFileWithTimeout(item);
      completed++;

      if (res.success) {
        if (res.skipped) {
          skippedCount++;
        } else {
          downloadedCount++;
          totalBytes += res.size;
        }
      } else {
        failedCount++;
        console.warn(`[FAIL] ${item.url} -> ${res.error || res.status}`);
      }

      if (completed % 100 === 0 || completed === items.length) {
        console.log(`Progress: ${completed}/${items.length} (DL: ${downloadedCount}, Skipped: ${skippedCount}, Fail: ${failedCount}, ${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
      }
    }
  });

  await Promise.all(workers);
  console.log(`\nDownload Complete! Total DL: ${downloadedCount}, Skipped: ${skippedCount}, Fail: ${failedCount}, Total Size: ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);
}

await runPool(downloadQueue, 25);

// Prepare HTML entry files
console.log('\n--- Preparing HTML entry files ---');
let desktopHtml = await fsp.readFile(path.join(__dirname, 'server_desktop.html'), 'utf8');
let mobileHtml = await fsp.readFile(path.join(__dirname, 'server_mobile.html'), 'utf8');

function cleanAndPrepareHtml(html) {
  let res = html;
  // Remove Baidu analytics, sentinel, and buryingPoint telemetry scripts
  res = res.replace(/<script[^>]*src=["'][^"']*(?:hm\.baidu|vmonitor|vivo-h5-sdk|buryingPoint)[^"']*["'][^>]*>\s*<\/script>/gi, '');
  res = res.replace(/<script>\s*var _hmt[\s\S]*?hm\.src[\s\S]*?<\/script>/gi, '');
  res = res.replace(/<script\b[^>]*>[\s\S]*?vmonitor[\s\S]*?<\/script>/gi, '');
  res = res.replace(/<link[^>]*href=["'][^"']*x300-ultra[^"']*["'][^>]*>\s*/gi, '');

  // Rewrite ./zip/ to full CDN url so SW proxy catches it effortlessly
  res = res.replace(/(?:src|href|data-src|data-video|data-img|data-poster)=["']\.\/zip\/([^"']+)["']/g, (m) => {
    return m.replace('./zip/', 'https://wwwstatic.vivo.com.cn/vivoportal/files/resource/funtouch/1789652280489/zip/');
  });

  // Inject Service Worker registration right after <head>
  const swScript = `
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }
</script>
`;
  res = res.replace(/<head>/i, '<head>' + swScript);
  return res;
}

const finalDesktopHtml = cleanAndPrepareHtml(desktopHtml);
const finalMobileHtml = cleanAndPrepareHtml(mobileHtml);

const vivoDir = path.join(officialArchivesDir, 'www.vivo.com.cn');
await fsp.mkdir(vivoDir, { recursive: true });

await fsp.writeFile(path.join(vivoDir, 'originos7.html'), finalDesktopHtml, 'utf8');
await fsp.writeFile(path.join(vivoDir, 'originos7_mobile.html'), finalMobileHtml, 'utf8');

console.log('Saved entry pages:');
console.log(' -', path.join(vivoDir, 'originos7.html'));
console.log(' -', path.join(vivoDir, 'originos7_mobile.html'));
