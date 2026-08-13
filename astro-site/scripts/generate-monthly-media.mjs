import path from 'node:path';
import { buildMonthlyDigest, selectTargetArticles, workDir, writeJson } from './monthly-digest-common.mjs';
import { generateDigestMediaV2 } from './monthly-digest-v2.mjs';

const args = process.argv.slice(2);
const selector = args.includes('--article') ? args[args.indexOf('--article') + 1] : 'all';
const targets = await selectTargetArticles(selector);
let generated = 0;

for (const { file, data: article } of targets) {
  const digest = await buildMonthlyDigest(article, 'draft');
  const articleGenerated = await generateDigestMediaV2(article, digest);
  generated += articleGenerated;
  await writeJson(path.join(workDir, 'candidates', file), digest);
  console.log(`Generated digest media: ${article.order} ${article.title} (${articleGenerated} crops)`);
}
console.log(`Digest V2 media generated: ${generated} precise crops (${generated * 4} files).`);
