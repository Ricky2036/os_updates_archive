import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { outputRoot, releaseRoot, sha256 } from './official-archive-common.mjs';

const dryRun = process.argv.includes('--dry-run');
const onlyManifest = process.argv.includes('--only-manifest');
const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
if (!dryRun) for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
const accountId = process.env.R2_ACCOUNT_ID;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || 'os-official-archives';
const concurrency = Math.max(1, Math.min(8, Number(process.env.R2_UPLOAD_CONCURRENCY || 3)));
const transport = process.env.R2_UPLOAD_TRANSPORT || 'fetch';
const manifestPath = path.join(releaseRoot, 'manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => { throw new Error('Prepared archives are missing. Run npm run archive:prepare first.'); }));
const manifestStat = await fs.stat(manifestPath);
const manifestUpload = {
  path: path.relative(outputRoot, manifestPath).split(path.sep).join('/'), size: manifestStat.size, sha256: await sha256(manifestPath),
  mime: 'application/json; charset=utf-8', cacheControl: 'public, max-age=300, must-revalidate',
};
const uploads = onlyManifest ? [manifestUpload] : [...manifest.files, manifestUpload];

const hash = (value) => createHash('sha256').update(value).digest('hex');
const hmac = (key, value, encoding) => createHmac('sha256', key).update(value).digest(encoding);
const encodePath = (value) => value.split('/').map((part) => encodeURIComponent(part)).join('/');
const curlConfigValue = (value) => String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');

async function uploadWithCurl(file, absolute) {
  const url = `https://${accountId}.r2.cloudflarestorage.com/${encodeURIComponent(bucket)}/${encodePath(file.path)}`;
  const config = [
    'aws-sigv4 = "aws:amz:auto:s3"',
    `user = "${curlConfigValue(accessKey)}:${curlConfigValue(secretKey)}"`,
    'request = "PUT"',
    `upload-file = "${curlConfigValue(absolute)}"`,
    `header = "Content-Type: ${curlConfigValue(file.mime)}"`,
    `header = "Cache-Control: ${curlConfigValue(file.cacheControl)}"`,
    `header = "x-amz-meta-sha256: ${file.sha256}"`,
    `url = "${curlConfigValue(url)}"`,
    'fail-with-body',
    'silent',
    'show-error',
  ].join('\n');
  await new Promise((resolve, reject) => {
    const child = spawn('curl', ['--config', '-'], { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { if (stderr.length < 2000) stderr += chunk; });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`curl exited ${code}: ${stderr.slice(0, 500)}`)));
    child.stdin.end(config);
  });
}

async function upload(file, attempt = 1) {
  if (dryRun) { console.log(`[dry-run] ${file.path} (${file.size} bytes)`); return; }
  const absolute = path.join(outputRoot, file.path);
  if (transport === 'curl') {
    try {
      await uploadWithCurl(file, absolute);
      console.log(`Uploaded ${file.path}`);
      return;
    } catch (error) {
      if (attempt >= 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** (attempt - 1)));
      return upload(file, attempt + 1);
    }
  }
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
