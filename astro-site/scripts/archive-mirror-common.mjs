import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

export const siteRoot = path.resolve(import.meta.dirname, '..');
export const publicRoot = path.join(siteRoot, 'public');
export const archiveRoot = path.join(publicRoot, 'official_archives');
export const outputRoot = path.resolve(process.env.OFFICIAL_ARCHIVE_OUTPUT || path.join(siteRoot, '.official-archive-dist'));
export const manifestPath = path.join(outputRoot, 'archive-mirror-manifest.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

export const criticalEntries = new Set([
  'official_archives/www.coloros.com/version/coloros17/index.html',
  'official_archives/www.coloros.com/version/coloros17/mobile.html',
  'official_archives/www.vivo.com.cn/originos.html',
  'official_archives/www.vivo.com.cn/originos7.html',
  'official_archives/www.vivo.com.cn/originos7_mobile.html',
  'official_archives/os1.hyperos.mi.com/index.html',
  'official_archives/os1.hyperos.mi.com/mobile.html',
  'official_archives/os2.hyperos.mi.com/index.html',
  'official_archives/os2.hyperos.mi.com/mobile.html',
  'official_archives/os3.hyperos.mi.com/index.html',
  'official_archives/os3.hyperos.mi.com/mobile.html',
  'official_archives/hyperos.mi.com/index.html',
  'official_archives/hyperos.mi.com/mobile.html',
  'official_archives/www.honor.com/cn/magic-os-10/index.html',
  'official_archives/www.honor.com/cn/magic-os/index.html',
  'official_archives/consumer.huawei.com/cn/harmonyos-7/index.html',
]);

export function toPosix(value) { return value.split(path.sep).join('/'); }

export function mimeFor(file) {
  return mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

export function cacheControlFor(file) {
  const basename = path.posix.basename(file);
  if (/\.(?:html?|json|xml)$/i.test(file) || /^(?:sw|service-worker)\.js$/i.test(basename) || !path.posix.extname(file)) {
    return 'public, max-age=300, must-revalidate';
  }
  if (/(?:^|[._-])[a-f0-9]{8,}(?:[._-]|$)/i.test(basename)) return 'public, max-age=31536000, immutable';
  return 'public, max-age=86400, stale-while-revalidate=604800';
}

export async function walk(root) {
  const files = [];
  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  await visit(root);
  return files;
}

export async function sha256(file) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => createReadStream(file)
    .on('data', (chunk) => hash.update(chunk))
    .on('end', resolve)
    .on('error', reject));
  return hash.digest('hex');
}

export function safeSourcePath(key) {
  if (!key.startsWith('official_archives/') || key.includes('..') || path.isAbsolute(key)) throw new Error(`Unsafe mirror key: ${key}`);
  const absolute = path.resolve(publicRoot, key);
  if (!absolute.startsWith(`${archiveRoot}${path.sep}`)) throw new Error(`Mirror key escapes archive root: ${key}`);
  return absolute;
}
