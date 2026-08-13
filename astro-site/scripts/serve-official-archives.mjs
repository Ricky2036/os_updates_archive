import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { cacheControlFor, mimeFor, outputRoot, releaseRoot } from './official-archive-common.mjs';

await fs.access(releaseRoot).catch(() => { throw new Error('Prepared archives are missing. Run npm run archive:prepare first.'); });
const port = Number(process.env.OFFICIAL_ARCHIVE_PORT || 8765);

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let absolute = path.resolve(outputRoot, pathname.replace(/^\/+/, ''));
    if (!absolute.startsWith(`${outputRoot}${path.sep}`)) throw new Error('Invalid path');
    const stat = await fs.stat(absolute);
    if (stat.isDirectory()) { absolute = path.join(absolute, 'index.html'); }
    const fileStat = await fs.stat(absolute);
    const relative = path.relative(outputRoot, absolute);
    const headers = {
      'Content-Type': mimeFor(relative), 'Cache-Control': cacheControlFor(relative), 'X-Robots-Tag': 'noindex, nofollow',
      'Access-Control-Allow-Origin': '*', 'Accept-Ranges': 'bytes',
    };
    const range = request.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), fileStat.size - 1) : fileStat.size - 1;
      if (start > end || start >= fileStat.size) { response.writeHead(416, { 'Content-Range': `bytes */${fileStat.size}` }); response.end(); return; }
      response.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${fileStat.size}` });
      if (request.method === 'HEAD') response.end(); else createReadStream(absolute, { start, end }).pipe(response);
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Length': fileStat.size });
    if (request.method === 'HEAD') response.end(); else createReadStream(absolute).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Official archives: http://127.0.0.1:${port}`));
