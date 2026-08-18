import fs from 'fs';
import path from 'path';

const ARCHIVES_DIR = '/Users/jingzhan.chen/Documents/antigravity/OS档案馆/astro-site/public/official_archives';

const domains = [
  { domain: 'os1.hyperos.mi.com', rawFile: '/tmp/os1_raw.html', title: 'HyperOS 1' },
  { domain: 'os2.hyperos.mi.com', rawFile: '/tmp/os2_raw.html', title: 'HyperOS 2' },
  { domain: 'os3.hyperos.mi.com', rawFile: '/tmp/os3_raw.html', title: 'HyperOS 3' },
  { domain: 'hyperos.mi.com', rawFile: '/tmp/os4_raw.html', title: 'HyperOS 4' },
];

function replaceAllUrls(content, domain) {
  let res = content;

  // Next.js static asset references
  res = res.replaceAll('href="/_next/', `href="/official_archives/${domain}/_next/`);
  res = res.replaceAll('src="/_next/', `src="/official_archives/${domain}/_next/`);
  res = res.replaceAll('"/_next/', `"/official_archives/${domain}/_next/`);
  res = res.replaceAll('\'/_next/', `'//official_archives/${domain}/_next/`);

  // CDN Media & Assets
  const cdnReplacements = [
    { patterns: ['https://cdn-file.hyperos.mi.com/', 'http://cdn-file.hyperos.mi.com/', '//cdn-file.hyperos.mi.com/'], target: '/official_archives/cdn-file.hyperos.mi.com/' },
    { patterns: ['https://cia.hyperos.mi.com/', 'http://cia.hyperos.mi.com/', '//cia.hyperos.mi.com/'], target: '/official_archives/cia.hyperos.mi.com/' },
    { patterns: ['https://cdn-font.hyperos.mi.com/', 'http://cdn-font.hyperos.mi.com/', '//cdn-font.hyperos.mi.com/'], target: '/official_archives/cdn-font.hyperos.mi.com/' },
    { patterns: ['https://cdn.cnbj1.fds.api.mi-img.com/', 'http://cdn.cnbj1.fds.api.mi-img.com/', '//cdn.cnbj1.fds.api.mi-img.com/'], target: '/official_archives/cdn.cnbj1.fds.api.mi-img.com/' },
    { patterns: ['https://ssl-cdn.static.browser.mi-img.com/', 'http://ssl-cdn.static.browser.mi-img.com/', '//ssl-cdn.static.browser.mi-img.com/'], target: '/official_archives/ssl-cdn.static.browser.mi-img.com/' },
    { patterns: ['https://s01.mifile.cn/', 'http://s01.mifile.cn/', '//s01.mifile.cn/'], target: '/official_archives/s01.mifile.cn/' },
  ];

  for (const { patterns, target } of cdnReplacements) {
    for (const p of patterns) {
      res = res.replaceAll(p, target);
    }
  }

  return res;
}

function processHtml(rawHtml, domain) {
  let html = rawHtml;

  // 1. Inject Service Worker registration script in <head>
  const swScript = `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const scope = window.location.pathname.startsWith('/os_updates_archive') ? '/os_updates_archive/' : '/';
    navigator.serviceWorker.register(scope + 'sw.js', { scope });
  });
}
</script>
`;
  html = html.replace('</head>', `${swScript}</head>`);

  // 2. Perform all URL replacements
  html = replaceAllUrls(html, domain);

  return html;
}

// 1. Process all HTML files
for (const item of domains) {
  if (fs.existsSync(item.rawFile)) {
    const rawHtml = fs.readFileSync(item.rawFile, 'utf-8');
    const processedHtml = processHtml(rawHtml, item.domain);
    const destIndex = path.join(ARCHIVES_DIR, item.domain, 'index.html');
    const destMobile = path.join(ARCHIVES_DIR, item.domain, 'mobile.html');
    
    fs.writeFileSync(destIndex, processedHtml);
    fs.writeFileSync(destMobile, processedHtml);
    console.log(`✅ Processed & saved ${item.domain} index.html & mobile.html (${(processedHtml.length/1024).toFixed(1)} KB)`);
  }
}

// 2. Process all JS Chunks and patch Webpack publicPath / CDN strings
for (const item of domains) {
  const chunksDir = path.join(ARCHIVES_DIR, item.domain, '_next/static/chunks');
  if (fs.existsSync(chunksDir)) {
    function walk(dir) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
          walk(full);
        } else if (f.endsWith('.js')) {
          let content = fs.readFileSync(full, 'utf-8');
          let modified = false;

          // Replace Webpack publicPath variable assignment (.p="/_next/")
          const publicPathRegex = /([a-zA-Z0-9_$]+)\.p\s*=\s*["']\/?_next\/["']/g;
          if (publicPathRegex.test(content)) {
            content = content.replace(publicPathRegex, `$1.p="/official_archives/${item.domain}/_next/"`);
            modified = true;
            console.log(`  🔧 Patched Webpack publicPath in ${item.domain}/_next/static/chunks/${path.relative(chunksDir, full)}`);
          }

          // Replace CDN paths inside JS bundles so dynamically loaded media resolves locally
          const newContent = replaceAllUrls(content, item.domain);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }

          if (modified) {
            fs.writeFileSync(full, content);
          }
        }
      }
    }
    walk(chunksDir);
  }
}

console.log('\n🎉 All HyperOS archives and JS bundles updated successfully!');
