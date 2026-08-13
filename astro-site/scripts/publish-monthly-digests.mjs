import fs from 'node:fs/promises';
import path from 'node:path';
import { buildMonthlyDigest, digestDir, selectTargetArticles, workDir, writeJson } from './monthly-digest-common.mjs';
import { generateDigestMediaV2 } from './monthly-digest-v2.mjs';

const args = process.argv.slice(2);
const selector = args.includes('--article') ? args[args.indexOf('--article') + 1] : 'all';
const targets = await selectTargetArticles(selector);
await fs.mkdir(digestDir, { recursive: true });
for (const { file, data } of targets) {
  const digest = await buildMonthlyDigest(data, 'verified');
  await generateDigestMediaV2(data, digest);
  await writeJson(path.join(workDir, 'candidates', file), { ...digest, reviewStatus: 'draft' });
  await writeJson(path.join(digestDir, file), digest);
  console.log(`Published verified digest: ${data.order} ${data.title}`);
}
if (selector === 'all') {
  const keep = new Set(targets.map(({ file }) => file));
  for (const file of await fs.readdir(digestDir)) {
    if (file.endsWith('.json') && !keep.has(file)) await fs.unlink(path.join(digestDir, file));
  }
}
console.log(`Verified digests published: ${targets.length}.`);
