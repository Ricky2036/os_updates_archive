import fs from 'node:fs/promises';
import path from 'node:path';
import { archiveRoot, publicRoot, siteRoot, walk } from './archive-mirror-common.mjs';

const mirrorBase = (process.env.PUBLIC_ARCHIVE_MIRROR_BASE_URL || '').replace(/\/$/, '');
let mirrorUrl;
try { mirrorUrl = new URL(mirrorBase); } catch { /* handled below */ }
if (!mirrorUrl || mirrorUrl.protocol !== 'https:' || mirrorUrl.username || mirrorUrl.password || mirrorUrl.search || mirrorUrl.hash) {
  throw new Error('PUBLIC_ARCHIVE_MIRROR_BASE_URL must be an HTTPS URL before preparing the Pages artifact.');
}

const destination = path.join(siteRoot, '.pages-public');
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(destination, { recursive: true });
await fs.cp(publicRoot, destination, {
  recursive: true,
  filter: (source) => source !== archiveRoot && !source.startsWith(`${archiveRoot}${path.sep}`),
});

await fs.writeFile(path.join(destination, 'archive-mirror.json'), `${JSON.stringify({ baseUrl: mirrorBase }, null, 2)}\n`);
let bytes = 0;
const files = await walk(destination);
for (const file of files) bytes += (await fs.stat(file)).size;
console.log(`Pages public directory prepared without official_archives: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)}MB.`);
