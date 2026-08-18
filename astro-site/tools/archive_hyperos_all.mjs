import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ARCHIVE_ROOT = '/Users/jingzhan.chen/Documents/antigravity/OS档案馆/astro-site/public/official_archives';

const TARGETS = [
  { name: 'hyperos1', url: 'https://os1.hyperos.mi.com/', host: 'os1.hyperos.mi.com' },
  { name: 'hyperos2', url: 'https://os2.hyperos.mi.com/', host: 'os2.hyperos.mi.com' },
  { name: 'hyperos3', url: 'https://os3.hyperos.mi.com/', host: 'os3.hyperos.mi.com' },
  { name: 'hyperos4', url: 'https://hyperos.mi.com/', host: 'hyperos.mi.com' },
];

function getLocalPath(urlStr) {
  try {
    const u = new URL(urlStr);
    let pathname = decodeURIComponent(u.pathname);
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    } else if (!path.extname(pathname) && !pathname.endsWith('/')) {
      pathname = `${pathname}/index.html`;
    }
    return path.join(ARCHIVE_ROOT, u.hostname, pathname);
  } catch {
    return null;
  }
}

async function downloadFileStream(urlStr, destPath, referer) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return true; // Already downloaded
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  
  return new Promise((resolve) => {
    const client = urlStr.startsWith('https') ? https : http;
    const req = client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': referer || 'https://hyperos.mi.com/',
        'Accept': '*/*',
      },
      timeout: 60000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).toString();
        resolve(downloadFileStream(nextUrl, destPath, referer));
        return;
      }
      if (res.statusCode !== 200 && res.statusCode !== 206 && res.statusCode !== 304) {
        console.warn(`[WARN] HTTP ${res.statusCode} for ${urlStr}`);
        resolve(false);
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve(true));
      });
      fileStream.on('error', (err) => {
        console.error(`[ERROR] File stream error for ${urlStr}:`, err.message);
        try { fs.unlinkSync(destPath); } catch {}
        resolve(false);
      });
    });
    req.on('error', (err) => {
      console.error(`[ERROR] Request error for ${urlStr}:`, err.message);
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function injectSW(htmlContent) {
  const swScript = `<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const scope = window.location.pathname.startsWith('/os_updates_archive') ? '/os_updates_archive/' : '/';
    navigator.serviceWorker.register(scope + 'sw.js', { scope });
  });
}
</script>`;
  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `${swScript}</head>`);
  }
  return swScript + htmlContent;
}

async function archiveTarget(target, browser) {
  console.log(`\n========================================`);
  console.log(`🚀 Starting Archive: ${target.name} (${target.url})`);
  console.log(`========================================\n`);

  const mediaUrls = new Set();
  const assetUrls = new Set();
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => req.continue());

  page.on('response', async (res) => {
    try {
      const urlStr = res.url();
      if (!urlStr.startsWith('http')) return;
      const u = new URL(urlStr);
      
      // Filter trackers
      if (u.hostname.includes('google-analytics') || u.hostname.includes('statcounter') || u.hostname.includes('tracking.miui.com')) return;

      const ct = res.headers()['content-type'] || '';
      const isMedia = ct.includes('video') || ct.includes('audio') || u.pathname.endsWith('.mp4') || u.pathname.endsWith('.webm');

      if (isMedia) {
        mediaUrls.add(urlStr);
      } else {
        const localPath = getLocalPath(urlStr);
        if (localPath && !fs.existsSync(localPath)) {
          try {
            const buf = await res.buffer();
            if (buf && buf.length > 0) {
              fs.mkdirSync(path.dirname(localPath), { recursive: true });
              fs.writeFileSync(localPath, buf);
              assetUrls.add(urlStr);
            }
          } catch {}
        }
      }
    } catch {}
  });

  // 1. Desktop Crawl
  console.log(`[1/3] Desktop Viewport (1920x1080)...`);
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise(r => setTimeout(r, 2000));

  // Deep scroll
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 60);
    });
  });
  await new Promise(r => setTimeout(r, 3000));

  // Trigger clicks on interactive items (tabs, buttons, nav items)
  await page.evaluate(() => {
    const clickable = document.querySelectorAll('button, .tab, .nav-item, [role="tab"], .btn, .switch-item, [data-v-]');
    clickable.forEach(el => {
      try { el.click(); } catch {}
    });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Save desktop HTML with injected SW
  let desktopHtml = await page.content();
  desktopHtml = injectSW(desktopHtml);
  const desktopEntry = path.join(ARCHIVE_ROOT, target.host, 'index.html');
  fs.mkdirSync(path.dirname(desktopEntry), { recursive: true });
  fs.writeFileSync(desktopEntry, desktopHtml, 'utf8');
  console.log(`Saved entry HTML: ${desktopEntry} (${desktopHtml.length} bytes)`);

  // Extract all video/media URLs from DOM & HTML text
  const domMedia = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('video, source, img').forEach(el => {
      const src = el.src || el.getAttribute('data-src') || el.getAttribute('src') || el.currentSrc;
      if (src && src.startsWith('http')) list.push(src);
    });
    return list;
  });
  domMedia.forEach(u => {
    if (u.endsWith('.mp4') || u.endsWith('.webm')) mediaUrls.add(u);
  });

  // Regex extract any hidden .mp4 in page scripts/html
  const mp4Matches = desktopHtml.match(/https?:\/\/[^"'\s)]+\.mp4/g) || [];
  mp4Matches.forEach(u => mediaUrls.add(u));

  // 2. Mobile Viewport Crawl
  console.log(`[2/3] Mobile Viewport (390x844)...`);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 60);
    });
  });
  await new Promise(r => setTimeout(r, 3000));

  let mobileHtml = await page.content();
  mobileHtml = injectSW(mobileHtml);
  const mobileEntry = path.join(ARCHIVE_ROOT, target.host, 'mobile.html');
  fs.writeFileSync(mobileEntry, mobileHtml, 'utf8');
  console.log(`Saved mobile entry HTML: ${mobileEntry}`);

  const mobileMp4Matches = mobileHtml.match(/https?:\/\/[^"'\s)]+\.mp4/g) || [];
  mobileMp4Matches.forEach(u => mediaUrls.add(u));

  await page.close();

  // 3. Download all media stream files with Referer header
  console.log(`[3/3] Downloading ${mediaUrls.size} media files with stream downloader & Referer...`);
  let mediaIdx = 0;
  let successCount = 0;
  for (const mUrl of mediaUrls) {
    mediaIdx++;
    const dest = getLocalPath(mUrl);
    if (dest) {
      process.stdout.write(`[${mediaIdx}/${mediaUrls.size}] ${path.basename(dest)}... `);
      const success = await downloadFileStream(mUrl, dest, target.url);
      if (success) {
        successCount++;
        const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
        console.log(`✓ (${sizeMb} MB)`);
      } else {
        console.log(`FAILED`);
      }
    }
  }

  console.log(`✅ Finished archiving ${target.name}! Assets: ${assetUrls.size}, Media: ${successCount}/${mediaUrls.size}\n`);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const t of TARGETS) {
    try {
      await archiveTarget(t, browser);
    } catch (err) {
      console.error(`[ERROR] Failed to archive ${t.name}:`, err);
    }
  }

  await browser.close();
  console.log(`\n🎉 All HyperOS archives completed successfully!`);
}

main().catch(console.error);
