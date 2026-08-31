import fs from 'node:fs/promises';
import path from 'node:path';
import { outputRoot, release, releaseRoot, sha256 } from './official-archive-common.mjs';

const manifestPath = path.join(releaseRoot, 'magicos-manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => { throw new Error('MagicOS manifest is missing. Run npm run archive:prepare:magicos first.'); }));
if (manifest.release !== release || manifest.summary.entryPages !== 1 || !manifest.summary.files) throw new Error('MagicOS manifest is incomplete');
if (manifest.summary.bytes > 650 * 1024 * 1024) throw new Error('MagicOS archive exceeds its 650MB budget');
const entry = path.join(releaseRoot, 'magicos10/cn/magic-os/index.html');
const html = await fs.readFile(entry, 'utf8');
if (/hm\.baidu|googletagmanager|serviceWorker\.register/i.test(html)) throw new Error('MagicOS entry still contains tracking or Service Worker registration');
if (!/Content-Security-Policy/i.test(html)) throw new Error('MagicOS entry is missing its offline Content Security Policy');
for (const file of manifest.files) {
  const absolute = path.join(outputRoot, file.path);
  const stat = await fs.stat(absolute).catch(() => null);
  if (!stat || !stat.size || stat.size !== file.size) throw new Error(`MagicOS file is missing or changed: ${file.path}`);
  if (process.argv.includes('--hash') && await sha256(absolute) !== file.sha256) throw new Error(`MagicOS checksum mismatch: ${file.path}`);
}
console.log(`MagicOS archive verified: ${manifest.summary.files} files, ${(manifest.summary.bytes / 1024 / 1024).toFixed(1)}MB.`);
