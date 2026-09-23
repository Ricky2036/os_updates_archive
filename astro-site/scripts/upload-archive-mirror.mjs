import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { manifestPath, mimeFor, safeSourcePath, sha256 } from './archive-mirror-common.mjs';

const dryRun = process.argv.includes('--dry-run');
const onlyManifest = process.argv.includes('--only-manifest');
const entryOnly = process.argv.includes('--entry-only');
const startAtArgument = process.argv.find((argument) => argument.startsWith('--start-at='));
const startAt = Math.max(0, Number(startAtArgument?.split('=')[1] || 0));
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => {
  throw new Error('Archive mirror manifest is missing. Run npm run archive:mirror:prepare first.');
}));
if (!dryRun && !manifest.hashed) throw new Error('Refusing to upload an unhashed manifest. Run npm run archive:mirror:prepare -- --hash first.');

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
if (!dryRun) for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
const accountId = process.env.R2_ACCOUNT_ID;
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || 'os-official-archives';
const concurrency = Math.max(1, Math.min(8, Number(process.env.R2_UPLOAD_CONCURRENCY || 3)));
const transport = process.env.R2_UPLOAD_TRANSPORT || 'fetch';

// --only-prefix=<对象键前缀>：只上传匹配前缀的对象。
// 镜像树是 4.7GB / 1.8 万个对象，加一个新目录时不该整棵重传，
// 而 --start-at 只能表达「从某序号传到结尾」，故补这个过滤器。
const onlyPrefixArgument = process.argv.find((argument) => argument.startsWith('--only-prefix='));
const onlyPrefix = onlyPrefixArgument ? onlyPrefixArgument.slice('--only-prefix='.length) : '';
let selectedFiles = entryOnly ? manifest.files.filter((file) => file.entry) : manifest.files;
if (onlyPrefix) {
  selectedFiles = selectedFiles.filter((file) => file.key.startsWith(onlyPrefix));
  if (!selectedFiles.length) throw new Error(`--only-prefix matched no objects: ${onlyPrefix}`);
}
if (!Number.isSafeInteger(startAt) || startAt > selectedFiles.length) throw new Error(`Invalid --start-at index: ${startAt}`);
const selected = selectedFiles.slice(startAt);
for (const file of selected) {
  const stat = await fs.stat(safeSourcePath(file.key)).catch(() => null);
  if (!stat || stat.size !== file.size || !stat.size) throw new Error(`Archive source is missing or changed: ${file.key}`);
  if (!dryRun && !file.sha256) throw new Error(`Missing checksum for ${file.key}`);
}

const manifestStat = await fs.stat(manifestPath);
const manifestUpload = {
  key: 'archive-mirror-manifest.json',
  size: manifestStat.size,
  sha256: await sha256(manifestPath),
  mime: mimeFor(manifestPath),
  cacheControl: 'public, max-age=300, must-revalidate',
  absolute: manifestPath,
};
const uploads = onlyManifest
  ? [manifestUpload]
  : selected.map((file) => ({ ...file, absolute: safeSourcePath(file.key) })).concat(manifestUpload);

const hash = (value) => createHash('sha256').update(value).digest('hex');
const hmac = (key, value, encoding) => createHmac('sha256', key).update(value).digest(encoding);
const awsUriEncode = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
const encodePath = (value) => value.split('/').map(awsUriEncode).join('/');
const curlConfigValue = (value) => String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');

async function uploadWithCurl(file) {
  const url = `https://${accountId}.r2.cloudflarestorage.com/${awsUriEncode(bucket)}/${encodePath(file.key)}`;
  const config = [
    'globoff',
    'aws-sigv4 = "aws:amz:auto:s3"',
    `user = "${curlConfigValue(accessKey)}:${curlConfigValue(secretKey)}"`,
    'request = "PUT"',
    `upload-file = "${curlConfigValue(file.absolute)}"`,
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

let completed = 0;
function report(file) {
  completed += 1;
  if (uploads.length <= 30 || completed === uploads.length || completed % 250 === 0) {
    console.log(`${dryRun ? 'Validated' : 'Uploaded'} ${completed}/${uploads.length}: ${file.key}`);
  }
}

async function upload(file, attempt = 1) {
  if (dryRun) { report(file); return; }
  if (transport === 'curl') {
    try {
      await uploadWithCurl(file);
      report(file);
      return;
    } catch (error) {
      if (attempt >= 5) throw new Error(`Upload failed for ${file.key}: ${error.message}`, { cause: error });
      await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** (attempt - 1)));
      return upload(file, attempt + 1);
    }
  }
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${awsUriEncode(bucket)}/${encodePath(file.key)}`;
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
      method: 'PUT',
      body: createReadStream(file.absolute),
      duplex: 'half',
      headers: { ...signed, Authorization: authorization, 'Content-Length': String(file.size) },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    report(file);
  } catch (error) {
    if (attempt >= 5) throw new Error(`Upload failed for ${file.key}: ${error.message}`, { cause: error });
    await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** (attempt - 1)));
    return upload(file, attempt + 1);
  }
}

let cursor = 0;
async function worker() {
  while (cursor < uploads.length) await upload(uploads[cursor++]);
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`${dryRun ? 'Validated' : 'Uploaded'} ${uploads.length} objects for R2 bucket ${bucket}.`);
