import fs from 'node:fs/promises';
import path from 'node:path';
import { cacheControlFor, mimeFor, outputRoot, release, releaseRoot, sha256, sourceRoot, toPosix, versions, walk } from './official-archive-common.mjs';

const ignored = [
  '/.workbuddy/', '/打开存档.command', '/存档说明.txt', '/failed-urls.json', '/resource-map.json', '/_preview.png',
  '/mirror/hm.baidu.com/', '/mirror/www.googletagmanager.com/', '/thirdparty/hm.baidu.com/',
];
const entries = ['index.html', 'pad.html', 'mobile.html'];
const textExtensions = new Set(['.html', '.js', '.json']);

function shouldCopy(sourceBase, file) {
  const relative = `/${toPosix(path.relative(sourceBase, file))}`;
  return !ignored.some((item) => relative.includes(item));
}

function stripTracking(html) {
  return html
    .replace(/<script\b[^>]*src=["'][^"']*(?:hm\.baidu|googletagmanager)[^"']*["'][^>]*>\s*<\/script>/gi, '')
    .replace(/<script>\s*var _hmt[\s\S]*?hm\.src[\s\S]*?<\/script>/gi, '');
}

function rewriteArchiveLinks(text, currentFolder) {
  const routes = {
    coloros15: `/${release}/coloros15/index.html`,
    coloros16: `/${release}/coloros16/index.html`,
  };
  return text
    // The official bundles call `/api`, which would escape the versioned CDN
    // prefix. Keep the request beside each immutable archive instead.
    .replace(/baseURL:"\/api"/g, 'baseURL:"./api"')
    .replace(/https:\/\/www\.coloros\.com\/version\/coloros15\/?/g, routes.coloros15)
    .replace(/https:\/\/www\.coloros\.com\/version\/coloros16\/?/g, routes.coloros16)
    .replace(/(["'`])\/version\/coloros15\/?\1/g, `$1${routes.coloros15}$1`)
    .replace(/(["'`])\/version\/coloros16\/?\1/g, `$1${routes.coloros16}$1`)
    .replace(/https:\/\/www\.coloros\.com\/(?=["'])/g, routes[currentFolder]);
}

function archiveShellScript() {
  return `(() => {
  const routes = {
    '/version/coloros15': '/${release}/coloros15/index.html',
    '/version/coloros16': '/${release}/coloros16/index.html'
  };
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const matched = Object.entries(routes).find(([key]) => url.hostname === 'www.coloros.com' && url.pathname.startsWith(key));
    if (matched) { event.preventDefault(); location.href = matched[1][1]; return; }
    if (url.origin !== location.origin) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  }, true);
})();\n`;
}

function localReferences(html) {
  const refs = [];
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) refs.push(match[1]);
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/gi)) refs.push(...match[1].split(',').map((item) => item.trim().split(/\s+/)[0]));
  return refs.filter((ref) => ref.startsWith('./') || ref.startsWith('../'));
}

await fs.access(sourceRoot).catch(() => { throw new Error(`Offline archive source is unavailable: ${sourceRoot}`); });
await fs.rm(releaseRoot, { recursive: true, force: true });
await fs.mkdir(releaseRoot, { recursive: true });

for (const [folder, config] of Object.entries(versions)) {
  const source = path.join(sourceRoot, config.source);
  const destination = path.join(releaseRoot, folder);
  await fs.access(source).catch(() => { throw new Error(`Missing source archive: ${source}`); });
  await fs.cp(source, destination, {
    recursive: true,
    filter: (file) => shouldCopy(source, file),
  });

  const navigationTarget = path.join(destination, 'api/colorOS/business/p2/navigation-settings');
  const navigationSource = path.join(sourceRoot, versions.coloros15.source, 'mirror/www.coloros.com/api/colorOS/business/p2/navigation-settings');
  if (!(await fs.stat(navigationTarget).catch(() => null))) {
    await fs.mkdir(path.dirname(navigationTarget), { recursive: true });
    await fs.copyFile(navigationSource, navigationTarget);
  }

  await fs.writeFile(path.join(destination, 'archive-shell.js'), archiveShellScript());
  for (const file of await walk(destination)) {
    const extension = path.extname(file).toLowerCase();
    if (!textExtensions.has(extension) && !file.endsWith('navigation-settings')) continue;
    let text = await fs.readFile(file, 'utf8');
    if (extension === '.html') {
      text = stripTracking(text);
      if (!text.includes('archive-shell.js')) text = text.replace(/<\/body>/i, '<script src="./archive-shell.js"></script>\n</body>');
    }
    text = rewriteArchiveLinks(text, folder);
    await fs.writeFile(file, text);
  }
}

const mappedMissing = [];
for (const [folder, config] of Object.entries(versions)) {
  const map = JSON.parse(await fs.readFile(path.join(sourceRoot, config.source, 'resource-map.json'), 'utf8'));
  for (const [url, mapped] of Object.entries(map)) {
    if (/hm\.baidu|googletagmanager/.test(url)) continue;
    if (!(await fs.stat(path.join(releaseRoot, folder, mapped)).catch(() => null))) mappedMissing.push(`${folder}/${mapped}`);
  }
}
if (mappedMissing.length) throw new Error(`Mapped resources missing from release:\n${mappedMissing.slice(0, 20).join('\n')}`);

for (const folder of Object.keys(versions)) {
  for (const entry of entries) {
    const file = path.join(releaseRoot, folder, entry);
    const html = await fs.readFile(file, 'utf8');
    if (/hm\.baidu|googletagmanager/.test(html)) throw new Error(`Tracking code remains in ${folder}/${entry}`);
    for (const reference of localReferences(html)) {
      const target = path.resolve(path.dirname(file), reference.split(/[?#]/)[0]);
      if (!(await fs.stat(target).catch(() => null))) throw new Error(`Broken local reference in ${folder}/${entry}: ${reference}`);
    }
  }
}

const releaseFiles = await walk(releaseRoot);
const zeroByte = [];
const files = [];
let totalBytes = 0;
let videos = 0;
for (const absolute of releaseFiles) {
  const stat = await fs.stat(absolute);
  const relative = toPosix(path.relative(outputRoot, absolute));
  if (!stat.size) zeroByte.push(relative);
  if (/\.(mp4|webm|mov)$/i.test(relative)) videos += 1;
  totalBytes += stat.size;
  files.push({ path: relative, size: stat.size, sha256: await sha256(absolute), mime: mimeFor(relative), cacheControl: cacheControlFor(relative) });
}
if (zeroByte.length) throw new Error(`Zero-byte files found:\n${zeroByte.join('\n')}`);
if (videos !== 119) throw new Error(`Expected 119 archived videos, found ${videos}`);

const manifest = {
  release,
  source: sourceRoot,
  generatedAt: new Date().toISOString(),
  summary: { files: files.length, videos, entryPages: 6, bytes: totalBytes },
  files,
};
await fs.writeFile(path.join(releaseRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Official archives prepared: ${files.length} files, ${videos} videos, ${(totalBytes / 1024 / 1024).toFixed(1)}MB in ${releaseRoot}`);
