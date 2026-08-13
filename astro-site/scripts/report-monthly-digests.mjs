import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { archiveRoot, selectTargetArticles, siteRoot, workDir } from './monthly-digest-common.mjs';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const targets = await selectTargetArticles('all');
const sections = [];

for (const { file, data: article } of targets) {
  const candidate = JSON.parse(await fs.readFile(path.join(workDir, 'candidates', file), 'utf8'));
  const evidence = new Map(candidate.evidence.map((item) => [item.id, item]));
  const rows = candidate.highlights.map((item) => {
    const body = evidence.get(item.evidenceIds.find((id) => evidence.get(id)?.role === 'body-text'));
    const demo = evidence.get(item.media[0]?.evidenceId);
    const crops = item.media.map((entry) => `<picture>${entry.avifThumbnail ? `<source srcset="${pathToFileURL(path.join(siteRoot, 'public', entry.avifThumbnail))}" type="image/avif">` : ''}<img src="${pathToFileURL(path.join(siteRoot, 'public', entry.thumbnail))}" alt="${escapeHtml(entry.alt)}"></picture>`).join('') || '<em>原档案未提供演示</em>';
    return `<tr><td>${escapeHtml(item.module)}</td><td><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.description)}</td><td>${demo ? `<a href="${pathToFileURL(path.join(archiveRoot, demo.source))}">${escapeHtml(demo.source)}<br>(${demo.region.x}, ${demo.region.y}, ${demo.region.width}, ${demo.region.height})</a>` : ''}</td><td>${crops}</td><td>${escapeHtml((body?.blockIds ?? []).join(', '))}</td></tr>`;
  }).join('');
  const updates = candidate.updates.map((item) => {
    const source = evidence.get(item.evidenceIds[0]);
    return `<tr><td>${escapeHtml(item.module)}<small>${escapeHtml(item.moduleSource)}</small></td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.description)}</td><td><a href="${pathToFileURL(path.join(archiveRoot, source.source))}">${escapeHtml(source.source)}<br>(${source.region.x}, ${source.region.y}, ${source.region.width}, ${source.region.height})</a></td><td>${escapeHtml(source.blockIds.join(', '))}</td></tr>`;
  }).join('');
  const audit = candidate.audit;
  sections.push(`<section><header><div><small>${article.order} · ${escapeHtml(article.brand.toUpperCase())}</small><h2>${escapeHtml(article.title)}</h2></div><p>来源条目 ${audit.sourceItemCount} · 收录 ${audit.includedItemCount} · 排除 ${audit.excludedItemCount} · 亮点 ${audit.highlightCount} · 更新 ${audit.updateCount} · 媒体 ${audit.mediaCount} · 覆盖率 ${(audit.coverageRate * 100).toFixed(0)}%</p></header><h3>亮点：源区域—裁切—文案—证据</h3><div class="table-scroll"><table><thead><tr><th>模块</th><th>亮点与说明</th><th>源区域</th><th>精准裁切</th><th>OCR block</th></tr></thead><tbody>${rows}</tbody></table></div><h3>其他更新点：结构化行—来源坐标—证据</h3><div class="table-scroll"><table><thead><tr><th>模块</th><th>类型</th><th>更新说明</th><th>来源坐标</th><th>OCR block</th></tr></thead><tbody>${updates}</tbody></table></div></section>`);
}

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>月更档案 V2 四方复核报告</title><style>*{box-sizing:border-box}body{margin:0;background:#eef2f7;color:#171b22;font:14px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}main{width:min(1580px,calc(100% - 32px));margin:auto;padding:48px 0}h1{font-size:38px}section{margin:28px 0;padding:28px;border-radius:22px;background:#fff;box-shadow:0 14px 48px #273f7415}header{display:flex;justify-content:space-between;gap:24px;align-items:end}header p{max-width:52%;color:#687180}small{display:block;color:#00a99d;font-weight:800}h2{margin:4px 0;font-size:26px}.table-scroll{overflow:auto}table{width:100%;min-width:1050px;border-collapse:collapse;margin:16px 0 28px}th,td{padding:12px;border:1px solid #e4e7ec;text-align:left;vertical-align:middle}th{background:#f5f7fa}td img{display:block;width:210px;max-height:260px;object-fit:contain;border-radius:10px}td a{font-size:11px;word-break:break-all}@media(max-width:720px){header{display:block}header p{max-width:none}section{padding:16px}}</style></head><body><main><h1>月更档案 V2 四方复核报告</h1><p>每一项同时展示源区域、结构化行、精准媒体裁切与真实 OCR 坐标。产品演示界面内文字只保留在图片中。</p>${sections.join('')}</main></body></html>`;
const output = path.join(workDir, 'report', 'index.html');
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, html);
console.log(`V2 four-way review report generated: ${output}`);
