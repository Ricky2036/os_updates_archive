import fs from 'node:fs/promises';
import path from 'node:path';
import { outputRoot, release, releaseRoot, sha256 } from './official-archive-common.mjs';

const manifestPath = path.join(releaseRoot, 'manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => { throw new Error('Prepared archive manifest is missing. Run npm run archive:prepare first.'); }));
if (manifest.release !== release) throw new Error(`Unexpected archive release: ${manifest.release}`);
if (manifest.summary.entryPages !== 6 || manifest.summary.videos !== 119) throw new Error('Archive entry or video count is incomplete');

for (const file of manifest.files) {
  const absolute = path.join(outputRoot, file.path);
  const stat = await fs.stat(absolute).catch(() => null);
  if (!stat || stat.size !== file.size || !stat.size) throw new Error(`Archive file is missing or changed: ${file.path}`);
  if (process.argv.includes('--hash') && await sha256(absolute) !== file.sha256) throw new Error(`Archive checksum mismatch: ${file.path}`);
}
console.log(`Official archives verified: ${manifest.summary.files} files, ${manifest.summary.videos} videos, 6 responsive entry pages.`);
