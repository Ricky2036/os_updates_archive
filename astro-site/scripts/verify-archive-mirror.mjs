import fs from 'node:fs/promises';
import { criticalEntries, manifestPath, safeSourcePath, sha256 } from './archive-mirror-common.mjs';

const verifyHashes = process.argv.includes('--hash');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => {
  throw new Error('Archive mirror manifest is missing. Run npm run archive:mirror:prepare first.');
}));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) throw new Error('Unsupported archive mirror manifest.');

const keys = new Set();
let bytes = 0;
for (const file of manifest.files) {
  if (keys.has(file.key)) throw new Error(`Duplicate mirror key: ${file.key}`);
  keys.add(file.key);
  const absolute = safeSourcePath(file.key);
  const stat = await fs.stat(absolute).catch(() => null);
  if (!stat || !stat.isFile() || stat.size !== file.size || !stat.size) throw new Error(`Archive source is missing or changed: ${file.key}`);
  if (verifyHashes) {
    if (!file.sha256) throw new Error(`Manifest has no checksum for ${file.key}; prepare it with --hash.`);
    if (await sha256(absolute) !== file.sha256) throw new Error(`Archive checksum mismatch: ${file.key}`);
  }
  bytes += stat.size;
}
for (const entry of criticalEntries) if (!keys.has(entry)) throw new Error(`Critical archive entry is absent: ${entry}`);
if (bytes !== manifest.summary.bytes || keys.size !== manifest.summary.files) throw new Error('Archive mirror summary does not match its file list.');
console.log(`Archive mirror verified: ${keys.size} objects, ${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB, ${criticalEntries.size} critical entries.`);
