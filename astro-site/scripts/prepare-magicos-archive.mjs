import fs from 'node:fs/promises';
import path from 'node:path';
import { outputRoot, release, releaseRoot, sha256, mimeFor, cacheControlFor, toPosix, walk } from './official-archive-common.mjs';

const localSource = path.resolve(process.env.MAGICOS_ARCHIVE_SOURCE || path.join(import.meta.dirname, '..', '.archive-sources/honor/www.honor.com'));
const legacySource = path.resolve(import.meta.dirname, '../public/official_archives/www.honor.com');
const source = await fs.stat(localSource).then(() => localSource).catch(() => legacySource);
const destination = path.join(releaseRoot, 'magicos10');
const entrySource = path.join(source, 'cn/magic-os/index.html');
const maxBytes = 650 * 1024 * 1024;

const requiredTrees = [
  'content/dam/honor/cn/magic-os-10',
  'content/dam/honor/cn/magic-os-9',
  'content/dam/honor/common',
  'etc',
  'etc.clientlibs',
];

function stripTrackingAndWorkers(html) {
  return html
    // Inspect one script element at a time. A cross-element expression can start
    // at an unrelated script and accidentally remove every script before a
    // later analytics block.
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (block) =>
      /hm\.baidu|googletagmanager/i.test(block) ? '' : block)
    .replace(/if\s*\(\s*['"]serviceWorker['"]\s+in\s+navigator\s*\)\s*\{[\s\S]*?navigator\.serviceWorker\.register\([\s\S]*?\);?\s*\}/gi, '')
    .replace(/navigator\.serviceWorker\.register\([\s\S]*?\);?/gi, '');
}

function rewriteURLs(html) {
  return html
    .replace(/https?:\/\/www-file\.honor\.com\//gi, '../../')
    .replace(/\/\/www-file\.honor\.com\//gi, '../../')
    .replace(/\.\.\/\.\.\/\.\.\/www-file\.honor\.com\//g, '../../')
    .replace(/(["'(=])\/(content|etc|etc\.clientlibs)\//g, '$1../../$2/');
}

await fs.access(entrySource).catch(() => { throw new Error(`MagicOS source entry is missing: ${entrySource}`); });
await fs.mkdir(releaseRoot, { recursive: true });
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(path.join(destination, 'cn/magic-os'), { recursive: true });

for (const relative of requiredTrees) {
  const from = path.join(source, relative);
  const to = path.join(destination, relative);
  await fs.access(from).catch(() => { throw new Error(`MagicOS dependency tree is missing: ${from}`); });
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.cp(from, to, { recursive: true });
}

let html = await fs.readFile(entrySource, 'utf8');
html = rewriteURLs(stripTrackingAndWorkers(html));
const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'">`;
html = html.replace(/<head>/i, `<head>\n${policy}`);
await fs.writeFile(path.join(destination, 'cn/magic-os/index.html'), html);

const files = [];
const excludedZeroByte = [];
let bytes = 0;
let videos = 0;
for (const absolute of await walk(destination)) {
  const stat = await fs.stat(absolute);
  const relative = toPosix(path.relative(outputRoot, absolute));
  if (!stat.size) {
    excludedZeroByte.push(relative);
    await fs.unlink(absolute);
    continue;
  }
  bytes += stat.size;
  if (/\.(mp4|webm|mov)$/i.test(relative)) videos += 1;
  files.push({ path: relative, size: stat.size, sha256: await sha256(absolute), mime: mimeFor(relative), cacheControl: cacheControlFor(relative) });
}
if (bytes > maxBytes) throw new Error(`MagicOS release exceeds 650MB: ${(bytes / 1024 / 1024).toFixed(1)}MB`);
if (/hm\.baidu|googletagmanager|serviceWorker\.register/i.test(html)) throw new Error('Tracking or Service Worker code remains in MagicOS entry');

const manifest = {
  release,
  source: 'offline-archive:MagicOS10',
  generatedAt: new Date().toISOString(),
  summary: { files: files.length, videos, entryPages: 1, bytes, excludedZeroByte },
  files,
};
await fs.writeFile(path.join(releaseRoot, 'magicos-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`MagicOS 10 archive prepared: ${files.length} files, ${videos} videos, ${(bytes / 1024 / 1024).toFixed(1)}MB.`);
