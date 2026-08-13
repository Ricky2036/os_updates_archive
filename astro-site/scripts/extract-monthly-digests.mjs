import path from 'node:path';
import { buildMonthlyDigest, selectTargetArticles, workDir, writeJson } from './monthly-digest-common.mjs';

const args = process.argv.slice(2);
const selector = args.includes('--all') ? 'all' : args[args.indexOf('--article') + 1];
if (!selector) throw new Error('Use --all or --article <id/order/slug>');
const targets = await selectTargetArticles(selector);
for (const { file, data } of targets) {
  const digest = await buildMonthlyDigest(data, 'draft');
  await writeJson(path.join(workDir, 'candidates', file), digest);
  console.log(`Extracted candidate: ${data.order} ${data.title}`);
}
console.log(`Candidate extraction complete: ${targets.length} article(s).`);
