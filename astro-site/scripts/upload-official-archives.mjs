import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { outputRoot, releaseRoot, sha256 } from './official-archive-common.mjs';

const dryRun = process.argv.includes('--dry-run');
const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
if (!dryRun) for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
const accountId = process.env.R2_ACCOUNT_ID;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || 'os-official-archives';
const concurrency = Math.max(1, Math.min(8, Number(process.env.R2_UPLOAD_CONCURRENCY || 3)));
const manifestPath = path.join(releaseRoot, 'manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => { throw new Error('Prepared archives are missing. Run npm run archive:prepare first.'); }));
const manifestStat = await fs.stat(manifestPath);
const uploads = [...manifest.files, {
  path: path.relative(outputRoot, manifestPath).split(path.sep).join('/'), size: manifestStat.size, sha256: await sha256(manifestPath),
  mime: 'application/json; charset=utf-8', cacheControl: 'public, max-age=300, must-revalidate',
}];

const hash = (value) => createHash('sha256').update(value).digest('hex');
const hmac = (key, value, encoding) => createHmac('sha256', key).update(value).digest(encoding);
const encodePath = (value) => value.split('/').map((part) => encodeURIComponent(part)).join('/');

async function upload(file, attempt = 1) {
  if (dryRun) { console.log(`[dry-run] ${file.path} (${file.size} bytes)`); return; }
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodeURIComponent(bucket)}/${encodePath(file.path)}`;
  const signed = {
    'cache-control': file.cacheControl,
    'content-type': file.mime,
    host,
    'x-amz-content-sha256': file.sha256,
    'x-amz-date': amzDate,
    'x-amz-meta-sha256': file.sha256,
  };
  const signedHeaders = Object.keys(signed).sort().join(';');
  const canonicalHeaders = Object.keys(signed).sort().map((key) => `${key}:${signed[key].trim()}\n`).join('');
  const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${file.sha256}`;
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${hash(canonicalRequest)}`;
  const dateKey = hmac(`AWS4${secretKey}`, dateStamp);
  const regionKey = hmac(dateKey, 'auto');
  const serviceKey = hmac(regionKey, 's3');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = hmac(signingKey, stringToSign, 'hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const absolute = path.join(outputRoot, file.path);
  try {
    const response = await fetch(`https://${host}${canonicalUri}`, {
      method: 'PUT', body: createReadStream(absolute), duplex: 'half',
      headers: { ...signed, Authorization: authorization, 'Content-Length': String(file.size) },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    console.log(`Uploaded ${file.path}`);
  } catch (error) {
    if (attempt >= 3) throw error;
    await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** (attempt - 1)));
    return upload(file, attempt + 1);
  }
}

let cursor = 0;
async function worker() {
  while (cursor < uploads.length) {
    const file = uploads[cursor++];
    await upload(file);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`${dryRun ? 'Validated' : 'Uploaded'} ${uploads.length} objects to R2 bucket ${bucket}.`);
