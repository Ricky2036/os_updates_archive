import fs from 'node:fs/promises';
import path from 'node:path';
import {
  archiveRoot, cacheControlFor, criticalEntries, manifestPath, mimeFor, outputRoot,
  publicRoot, sha256, toPosix, walk,
} from './archive-mirror-common.mjs';

const includeHashes = process.argv.includes('--hash');
await fs.access(archiveRoot).catch(() => { throw new Error(`Archive source is missing: ${archiveRoot}`); });

const files = [];
const excludedZeroByte = [];
let bytes = 0;
for (const absolute of await walk(archiveRoot)) {
  const stat = await fs.stat(absolute);
  const key = toPosix(path.relative(publicRoot, absolute));
  if (!stat.size) {
    excludedZeroByte.push(key);
    continue;
  }
  const file = {
    key,
    size: stat.size,
    mime: mimeFor(key),
    cacheControl: cacheControlFor(key),
    entry: criticalEntries.has(key),
  };
  if (includeHashes) file.sha256 = await sha256(absolute);
  files.push(file);
  bytes += stat.size;
}

const keys = new Set(files.map((file) => file.key));
const missingEntries = [...criticalEntries].filter((entry) => !keys.has(entry));
if (missingEntries.length) throw new Error(`Critical archive entries are missing:\n${missingEntries.join('\n')}`);

const manifest = {
  schemaVersion: 1,
  source: 'public/official_archives',
  generatedAt: new Date().toISOString(),
  hashed: includeHashes,
  summary: {
    files: files.length,
    bytes,
    criticalEntries: criticalEntries.size,
    excludedZeroByte: excludedZeroByte.length,
  },
  excludedZeroByte,
  files,
};
await fs.mkdir(outputRoot, { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Archive mirror manifest prepared: ${files.length} objects, ${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB, ${excludedZeroByte.length} zero-byte files excluded.`);
console.log(`Checksums: ${includeHashes ? 'included' : 'omitted (run with --hash before uploading)'}.`);
console.log(manifestPath);
