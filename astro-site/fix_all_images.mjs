import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const htmlPath = path.resolve('public/official_archives/www.honor.com/cn/magic-os/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace remaining root-relative content/dam paths in srcset and src
html = html.replace(/([,\s"'])\/content\/dam\//g, '$1../../content/dam/');
html = html.replace(/([,\s"'])\/etc\//g, '$1../../etc/');
html = html.replace(/([,\s"'])\/libs\//g, '$1../../libs/');
html = html.replace(/([,\s"'])\/etc\.clientlibs\//g, '$1../../etc.clientlibs/');

// 2. For every <picture> that has an <img src=""> without src, populate src with the last source's srcset URL
html = html.replace(/<picture([\s\S]*?)<\/picture>/gi, (match) => {
  if (match.includes('<img src=""') || match.includes('<img class="lazyload') || !match.includes('<img src="http')) {
    // Find the last srcset in the picture
    const srcsetMatches = [...match.matchAll(/srcset=["']([^"']+)["']/g)];
    if (srcsetMatches.length > 0) {
      const lastSrcset = srcsetMatches[srcsetMatches.length - 1][1];
      const candidateUrl = lastSrcset.split(',')[0].trim().split(/\s+/)[0];
      return match.replace(/<img\s+src=""/gi, `<img src="${candidateUrl}"`)
                  .replace(/<img(?!\s+src)/gi, `<img src="${candidateUrl}"`);
    }
  }
  return match;
});

// 3. For any remaining img without src or src=""
html = html.replace(/<img([^>]*?)\s+src=""([^>]*?)>/gi, '<img$1$2>');

fs.writeFileSync(htmlPath, html, 'utf8');

// Copy to dist
const distHtmlPath = path.resolve('dist/official_archives/www.honor.com/cn/magic-os/index.html');
if (fs.existsSync(path.dirname(distHtmlPath))) {
  fs.writeFileSync(distHtmlPath, html, 'utf8');
}

console.log('Successfully patched all images and srcset in index.html');

// Run tests
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new'
});

async function main() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let brokenImages = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('404')) {
      console.log('404 Error:', msg.text());
    }
  });

  await page.goto('http://localhost:4321/magicos/10/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll to section-safe (around position 13000)
  const frame = page.frames().find(f => f !== page.mainFrame());
  if (frame) {
    await frame.evaluate(() => {
      const safe = document.querySelector('.section-safe') || document.querySelector('.item2');
      if (safe) safe.scrollIntoView();
    });
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'safe_section_fixed.png' });
  console.log('Saved safe_section_fixed.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  browser.close();
});
