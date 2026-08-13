import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

export const release = 'v2026-07-30';
export const siteRoot = path.resolve(import.meta.dirname, '..');
export const sourceRoot = path.resolve(process.env.OFFICIAL_ARCHIVE_SOURCE || '/Users/jingzhan.chen/Workbuddy/OS网页存档');
export const outputRoot = path.resolve(process.env.OFFICIAL_ARCHIVE_OUTPUT || path.join(siteRoot, '.official-archive-dist'));
export const releaseRoot = path.join(outputRoot, release);
export const versions = {
  coloros15: { source: 'ColorOS15', label: 'ColorOS 15' },
  coloros16: { source: 'ColorOS16', label: 'ColorOS 16' },
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

export function mimeFor(file) {
  if (file.endsWith('navigation-settings')) return 'application/json; charset=utf-8';
  return mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

export function cacheControlFor(file) {
  return /\.html$/i.test(file) ? 'public, max-age=300, must-revalidate' : 'public, max-age=31536000, immutable';
}

export async function walk(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
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
  await new Promise((resolve, reject) => createReadStream(file).on('data', (chunk) => hash.update(chunk)).on('end', resolve).on('error', reject));
  return hash.digest('hex');
}

export function toPosix(file) { return file.split(path.sep).join('/'); }
