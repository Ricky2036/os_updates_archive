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

// 1. Gather all URL sources
const capturedUrls = JSON.parse(await fsp.readFile('/tmp/harmonyos7_all_urls.json', 'utf8').catch(() => '[]'));
const desktopHtml = await fsp.readFile('/tmp/harmonyos7_desktop_raw.html', 'utf8').catch(() => '');
const mobileHtml = await fsp.readFile('/tmp/harmonyos7_mobile_raw.html', 'utf8').catch(() => '');
const serverHtml = await fsp.readFile('/tmp/harmonyos7_server_raw.html', 'utf8').catch(() => '');

const allUrls = new Set(capturedUrls);

function extractUrlsFromHtml(html) {
  if (!html) return;
  const patterns = [
    /src=["\x27]([^"\x27]+)["\x27]/gi,
    /href=["\x27]([^"\x27]+)["\x27]/gi,
    /poster=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*src=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*url=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*poster=["\x27]([^"\x27]+)["\x27]/gi,
    /data-[a-z0-9_-]*video=["\x27]([^"\x27]+)["\x27]/gi,
    /url\(["\x27]?([^)"\x27]+)["\x27]?\)/gi,
    /srcset=["\x27]([^"\x27]+)["\x27]/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const raw = match[1].trim();
      if (pattern.source.includes('srcset')) {
        const parts = raw.split(',');
        for (const p of parts) {
          const u = p.trim().split(/\s+/)[0];
          if (u) addUrl(u);
        }
      } else {
        addUrl(raw);
      }
    }
  }
}

function addUrl(raw) {
  if (!raw || raw.startsWith('data:') || raw.startsWith('javascript:') || raw.startsWith('#') || raw.startsWith('mailto:')) return;
  try {
    const resolved = new URL(raw, 'https://consumer.huawei.com/cn/harmonyos-7/').href;
    allUrls.add(resolved);
    
    // Also add high-res counterpart if -thumb exists, and vice versa
    if (resolved.includes('-thumb.')) {
      allUrls.add(resolved.replace('-thumb.', '.'));
    } else if (/\.(jpg|png|webp)$/i.test(resolved) && !resolved.includes('-thumb')) {
      const dotIdx = resolved.lastIndexOf('.');
      allUrls.add(resolved.slice(0, dotIdx) + '-thumb' + resolved.slice(dotIdx));
    }
  } catch (e) {}
}

extractUrlsFromHtml(desktopHtml);
extractUrlsFromHtml(mobileHtml);
extractUrlsFromHtml(serverHtml);

console.log(`Discovered ${allUrls.size} candidate URLs after initial HTML analysis.`);

// 2. Filter target static asset domains
const allowedHosts = new Set([
  'consumer.huawei.com',
  'consumer-img.huawei.com',
  'www.huawei.com',
  'e.huawei.com'
]);

const ignoredPaths = [
  '/hm.js',
  '/gtm.js',
  '/gtag/js',
  '/analytics.js',
  'crazyegg',
  'doubleclick',
  'sgw-cn.c.huawei.com',
  '/legal/',
  '/complaint-page/',
  '/privacy/',
  '/terms-of-use/',
  '/worldwide/'
];

// Helper: fetch single URL
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://consumer.huawei.com/cn/harmonyos-7/'
      },
      timeout: 25000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).href;
        }
        return fetchBuffer(redirectUrl).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200 && res.statusCode !== 206) {
        res.resume();
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// 3. Recursively parse CSS files for embedded fonts/images
const knownCssUrls = [...allUrls].filter(u => {
  try {
    const p = new URL(u).pathname;
    return p.endsWith('.css') && allowedHosts.has(new URL(u).hostname);
  } catch (e) { return false; }
});

console.log(`Checking ${knownCssUrls.length} CSS files for nested font/image assets...`);
for (const cssUrl of knownCssUrls) {
  try {
    const buf = await fetchBuffer(cssUrl);
    const cssText = buf.toString('utf8');
    const regex = /url\(["\x27]?([^)"\x27]+)["\x27]?\)/gi;
    let m;
    while ((m = regex.exec(cssText)) !== null) {
      const raw = m[1].trim();
      if (!raw.startsWith('data:') && !raw.startsWith('#')) {
        try {
          const resolved = new URL(raw, cssUrl).href;
          allUrls.add(resolved);
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn(`Failed to inspect CSS ${cssUrl}: ${e.message}`);
  }
}

// 4. Build download queue
const downloadQueue = [];
const seenFiles = new Set();

for (const rawUrl of allUrls) {
  try {
    const parsed = new URL(rawUrl);
    if (!allowedHosts.has(parsed.hostname)) continue;
    if (ignoredPaths.some(p => parsed.pathname.includes(p) || parsed.hostname.includes(p))) continue;
    
    // Skip html root pages (we handle index.html separately)
    if (parsed.pathname === '/' || parsed.pathname === '/cn/harmonyos-7/' || parsed.pathname === '/cn/harmonyos-7/index.html') continue;
    
    // Skip empty or search/query pages without extension
    const ext = path.extname(parsed.pathname).toLowerCase();
    if (!ext && !parsed.pathname.includes('/etc/designs/') && !parsed.pathname.includes('/content/dam/')) continue;

    const decodedPath = decodeURIComponent(parsed.pathname);
    const localFile = path.join(officialArchivesDir, parsed.hostname, decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath);

    if (seenFiles.has(localFile)) continue;
    seenFiles.add(localFile);

    downloadQueue.push({
      url: rawUrl,
      host: parsed.hostname,
      localFile
    });
  } catch (e) {}
}

console.log(`Total downloadable assets in queue: ${downloadQueue.length}`);

// 5. Download with timeout and retry
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
    }, 35000);

    // Check if file already exists with size > 0
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://consumer.huawei.com/cn/harmonyos-7/'
      },
      timeout: 25000
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

// 6. Concurrency pool
async function runPool(items, concurrency = 20) {
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

      if (completed % 50 === 0 || completed === items.length) {
        console.log(`Progress: ${completed}/${items.length} (DL: ${downloadedCount}, Skipped: ${skippedCount}, Fail: ${failedCount}, ${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
      }
    }
  });

  await Promise.all(workers);
  console.log(`\nDownload Complete! Total DL: ${downloadedCount}, Skipped: ${skippedCount}, Fail: ${failedCount}, Total Size: ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);
}

await runPool(downloadQueue, 20);

// 7. Clean and prepare HTML entry page
console.log('\n--- Preparing sanitized HTML entry page ---');

function cleanAndPrepareHtml(html) {
  let res = html;
  
  // Remove third-party telemetry scripts
  res = res.replace(/<script[^>]*src=["'][^"']*(?:googletagmanager|google-analytics|crazyegg|hm\.baidu|doubleclick)[^"']*["'][^>]*>\s*<\/script>/gi, '');
  res = res.replace(/<script\b[^>]*>[\s\S]*?(?:gtm\.start|dataLayer\.push|_hmt|crazyegg)[\s\S]*?<\/script>/gi, '');
  res = res.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  // Inject Service Worker registration and analytics stub right inside <head>
  const headInject = `
<script>
  window.dataLayer = window.dataLayer || [];
  window.digitalData = window.digitalData || { page: { pageInfo: { siteCode2: 'cn' } } };
  window.pageLoadStart = Date.now();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    navigator.serviceWorker.register('/os_updates_archive/sw.js', { scope: '/os_updates_archive/' }).catch(() => {});
  }
</script>
`;
  res = res.replace(/<head>/i, '<head>' + headInject);
  return res;
}

const finalHtml = cleanAndPrepareHtml(serverHtml || desktopHtml);
const huaweiEntryDir = path.join(officialArchivesDir, 'consumer.huawei.com/cn/harmonyos-7');
await fsp.mkdir(huaweiEntryDir, { recursive: true });

await fsp.writeFile(path.join(huaweiEntryDir, 'index.html'), finalHtml, 'utf8');
console.log('Saved entry page to:', path.join(huaweiEntryDir, 'index.html'));
