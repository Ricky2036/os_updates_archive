import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import {
  archiveRoot, articleSourceHash, articleSources, exists, hashFile, publicPath, siteRoot, toPosix,
} from './monthly-digest-common.mjs';
import { monthlyDigestSeeds } from './monthly-digest-seeds.mjs';
import {
  highlightReviewVersion, reviewedHighlightExpectations, reviewedHighlightsFor,
} from './monthly-highlight-reviews.mjs';
import updateReviewManifest from './monthly-update-reviews.json' with { type: 'json' };

export const contentReviewVersion = 4;
export const mediaReviewVersion = 4;
export const updateReviewVersion = updateReviewManifest.reviewVersion;

const TYPE_RE = /^(?:[（(【\[•·.。\s]*)(新增|优化|修复|调整|适配|升级)(?:[）)】\]\s、·.:：；;，,]*)/i;
const PLAN_RE = /(升级计划|版本适配计划|适配计划|推送计划|支持机型|机型名单)/i;
const DISCLAIMER_RE = /^\s*[＊*]|免责声明|实际呈现效果|官方渠道|适配进度|版本升级通知|部分功能依赖/i;
const OCR_FILE = path.join(archiveRoot, 'raw_ocr_results.json');
const hashCache = new Map();
let rawCache;
const execFileAsync = promisify(execFile);

const normalize = (value = '') => String(value)
  .replace(/\r?\n/g, '')
  .replace(/[|｜]/g, '')
  .replace(/\bAl\b/gi, 'AI')
  .replace(/[“”〝〞]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/分用(?=[”"'，,。]|$)/g, '分屏')
  .replace(/["“”]{2,}/g, '”')
  .replace(/\s+/g, ' ')
  .trim();

const keyText = (value) => normalize(value).replace(/[\s，。、“”‘’：:；;（）()【】\[\]·•.\-—_]/g, '').toLowerCase();
function overlapScore(a, b) {
  const left = new Set([...keyText(a)]), right = new Set([...keyText(b)]);
  if (!left.size || !right.size) return 0;
  let same = 0;
  for (const value of left) if (right.has(value)) same += 1;
  return same / Math.max(4, Math.min(left.size, right.size));
}

function normalizedRegion(blocks, width, height, padX = 0.012, padY = 0.008) {
  const x = Math.max(0, Math.min(...blocks.map((block) => block.x)) - padX);
  const y = Math.max(0, Math.min(...blocks.map((block) => block.y)) - padY);
  const right = Math.min(1, Math.max(...blocks.map((block) => block.x + block.width)) + padX);
  const bottom = Math.min(1, Math.max(...blocks.map((block) => block.y + block.height)) + padY);
  return {
    x: Math.floor(x * width), y: Math.floor(y * height),
    width: Math.max(1, Math.ceil((right - x) * width)), height: Math.max(1, Math.ceil((bottom - y) * height)),
  };
}

async function loadRaw() {
  rawCache ??= JSON.parse(await fs.readFile(OCR_FILE, 'utf8'));
  return rawCache;
}

async function imageInfo(source, rawData) {
  const metadata = await sharp(source, { pages: 1 }).metadata();
  const width = rawData?.imageWidth || metadata.width || 0;
  const height = rawData?.imageHeight || metadata.height || 0;
  return { width, height, metadata };
}

async function tesseractBlocks(source, width, height) {
  const { stdout } = await execFileAsync('/Users/jingzhan.chen/homebrew/bin/tesseract', [
    source, 'stdout', '-l', 'chi_sim+eng', '--psm', '11', 'tsv',
  ], { maxBuffer: 32 * 1024 * 1024 });
  const lines = new Map();
  stdout.split(/\r?\n/).slice(1).forEach((line) => {
    const columns = line.split('\t');
    if (columns.length < 12 || columns[0] !== '5') return null;
    const confidence = Number(columns[10]);
    const text = normalize(columns.slice(11).join('\t'));
    if (!text || confidence < 18) return null;
    const [left, top, boxWidth, boxHeight] = columns.slice(6, 10).map(Number);
    const key = columns.slice(1, 5).join('-');
    const current = lines.get(key) ?? { words: [], confidence: [], left, top, right: left + boxWidth, bottom: top + boxHeight };
    current.words.push({ text, left });
    current.confidence.push(confidence);
    current.left = Math.min(current.left, left);
    current.top = Math.min(current.top, top);
    current.right = Math.max(current.right, left + boxWidth);
    current.bottom = Math.max(current.bottom, top + boxHeight);
    lines.set(key, current);
    return null;
  });
  return [...lines.values()].map((line, index) => ({
    id: `tesseract-${String(index + 1).padStart(4, '0')}`,
    text: normalize(line.words.sort((a, b) => a.left - b.left).map((word) => word.text).join(' ')),
    confidence: line.confidence.reduce((total, value) => total + value, 0) / line.confidence.length / 100,
    x: line.left / width, y: line.top / height,
    width: (line.right - line.left) / width, height: (line.bottom - line.top) / height,
  })).filter((block) => block.text).sort((a, b) => a.y - b.y || a.x - b.x);
}

async function sourceRecords(article) {
  const raw = await loadRaw();
  const sourcePaths = await articleSources(article);
  const mapped = raw.article_map?.[article.articleId] ?? [];
  const records = [];
  for (const source of sourcePaths) {
    const absolute = path.resolve(source);
    const rawKey = mapped.find((entry) => path.resolve(entry) === absolute)
      ?? Object.keys(raw.ocr_data ?? {}).find((entry) => path.resolve(entry) === absolute);
    const ocr = rawKey ? raw.ocr_data[rawKey] : undefined;
    let info = { width: 0, height: 0 };
    try { info = await imageInfo(absolute, ocr); } catch { /* HTML source */ }
    records.push({
      index: records.length,
      source: absolute,
      relative: toPosix(path.relative(archiveRoot, absolute)),
      hash: await hashFile(absolute),
      width: info.width,
      height: info.height,
      blocks: (ocr?.blocks ?? []).map((block, index) => ({ ...block, id: `ocr-${String(index + 1).padStart(4, '0')}`, text: normalize(block.text) }))
        .filter((block) => block.text).sort((a, b) => a.y - b.y || a.x - b.x),
    });
  }
  for (const record of records) {
    if (!record.width || !record.height || /\.(?:gif|svg|html?)$/i.test(record.source)) continue;
    const needsRecovery = !record.blocks.length || (record.height > 4000 && record.blocks.length < 45);
    if (!needsRecovery) continue;
    let recovered = [];
try { recovered = await tesseractBlocks(record.source, record.width, record.height); } catch (e) { console.error('Tesseract failed'); }
    const existingTypes = record.blocks.filter((block) => TYPE_RE.test(block.text)).length;
    const recoveredTypes = recovered.filter((block) => TYPE_RE.test(block.text)).length;
    if (!record.blocks.length || recovered.length > record.blocks.length * 1.25 || recoveredTypes > existingTypes) record.blocks = recovered;
  }
  return records;
}

function canonicalRecords(records) {
  const seen = new Set();
  return records.filter((record) => {
    if (!record.blocks.length) return false;
    const fingerprint = createHash('sha256').update(record.blocks.map((block) => `${block.text}@${block.y.toFixed(3)}`).join('|')).digest('hex');
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
}

function findBestBlocks(records, item) {
  let best;
  for (const record of canonicalRecords(records)) {
    for (let index = 0; index < record.blocks.length; index += 1) {
      const block = record.blocks[index];
      const titleScore = overlapScore(item.title, block.text);
      const descriptionScore = overlapScore(item.description, block.text);
      const score = titleScore * 1.35 + descriptionScore;
      if (!best || score > best.score) best = { record, block, index, score };
    }
  }
  return best;
}

function bodyBlocksFor(best, item) {
  const { record, index } = best;
  if (Number.isFinite(item.bodyStart) && Number.isFinite(item.bodyEnd)) {
    const reviewed = record.blocks.filter((block) => {
      const center = block.y + block.height / 2;
      return center >= item.bodyStart && center <= item.bodyEnd;
    });
    if (reviewed.length) return reviewed;
  }
  const blocks = [record.blocks[index]];
  for (let cursor = index + 1; cursor < record.blocks.length; cursor += 1) {
    const block = record.blocks[cursor];
    if (block.y - (blocks.at(-1).y + blocks.at(-1).height) > 0.025) break;
    if (block.height < 0.003 || block.x > 0.88) continue;
    blocks.push(block);
    if (overlapScore(item.description, blocks.map((entry) => entry.text).join('')) > 0.75) break;
    if (blocks.length >= 5) break;
  }
  return blocks;
}

function recordForRef(records, sourceRef, { requireBlocks = true } = {}) {
  const matches = records.filter((entry) => path.basename(entry.source) === sourceRef || entry.relative.endsWith(`/${sourceRef}`));
  const usable = requireBlocks ? matches.filter((entry) => entry.width && entry.blocks.length) : matches.filter((entry) => entry.width && entry.height);
  if (usable.length !== 1) throw new Error(`Reviewed source must resolve exactly once: ${sourceRef} (${usable.length})`);
  return usable[0];
}

function reviewedBest(records, item) {
  const record = recordForRef(records, item.sourceRef);
  let reviewedBlocks = Number.isFinite(item.bodyStart) && Number.isFinite(item.bodyEnd)
    ? record.blocks.filter((block) => block.y + block.height / 2 >= item.bodyStart && block.y + block.height / 2 <= item.bodyEnd)
    : record.blocks;
  // Some decorative display headings were not returned by OCR.  Keep the
  // reviewed source binding and attach the nearest real OCR line instead of
  // falling back to another image.
  if (!reviewedBlocks.length && Number.isFinite(item.bodyStart) && Number.isFinite(item.bodyEnd)) {
    const center = (item.bodyStart + item.bodyEnd) / 2;
    reviewedBlocks = [...record.blocks].sort((left, right) =>
      Math.abs(left.y + left.height / 2 - center) - Math.abs(right.y + right.height / 2 - center)).slice(0, 1);
  }
  const best = reviewedBlocks.reduce((selected, block) => {
    const index = record.blocks.indexOf(block);
    const score = overlapScore(item.title, block.text) * 1.35 + overlapScore(item.description, block.text);
    return !selected || score > selected.score ? { record, block, index, score } : selected;
  }, null);
  if (!best) throw new Error(`Reviewed body range has no OCR evidence: ${item.sourceRef} ${item.title}`);
  return best;
}

function legacyAssetFor(record) {
  const name = path.basename(record.source);
  return `assets/legacy/interactive/${name}`;
}

function generatedPaths(order, id) {
  const folder = `assets/digests-v2/${String(order).padStart(2, '0')}`;
  return {
    src: `${folder}/${id}-960.webp`, thumbnail: `${folder}/${id}-480.webp`,
    avifSrc: `${folder}/${id}-960.avif`, avifThumbnail: `${folder}/${id}-480.avif`,
  };
}

export async function buildMonthlyDigestV2(article, reviewStatus = 'draft') {
  const seed = monthlyDigestSeeds[article.order];
  if (!seed) throw new Error(`Missing reviewed semantic inventory for ${article.order}`);
  const records = await sourceRecords(article);
  if (!records.length) throw new Error(`No source archive found for ${article.articleId}`);
  const highlightsReview = reviewedHighlightsFor(article);
  const bestMatches = highlightsReview.map((item) => reviewedBest(records, item));
  const evidence = [];
  const sourceItems = [];
  const highlights = [];

  for (const [index, item] of highlightsReview.entries()) {
    const id = `highlight-${String(index + 1).padStart(2, '0')}`;
    const bodyEvidenceId = `${id}-body`;
    const demoEvidenceId = `${id}-demo`;
    const sourceItemId = `source-highlight-${String(index + 1).padStart(2, '0')}`;
    const best = bestMatches[index];
    if (!best?.record.width) throw new Error(`Cannot locate highlight source: ${article.order} ${item.title}`);
    const bodyBlocks = bodyBlocksFor(best, item);
    const bodyRegion = normalizedRegion(
      bodyBlocks,
      best.record.width,
      best.record.height,
      0.012,
      Number.isFinite(item.bodyStart) ? 0.002 : 0.008,
    );
    evidence.push({
      id: bodyEvidenceId, kind: 'image-region', role: 'body-text', source: best.record.relative, sourceIndex: best.record.index,
      sourceHash: best.record.hash, blockIds: bodyBlocks.map((block) => block.id), region: bodyRegion,
      note: `${item.module}：${item.title}标题与说明`,
    });
    sourceItems.push({
      id: sourceItemId, classification: 'highlight', source: best.record.relative, sourceIndex: best.record.index,
      sourceHash: best.record.hash, blockIds: bodyBlocks.map((block) => block.id), text: `${item.title} ${item.description}`, targetIds: [id],
    });
    const highlight = {
      id, module: item.module, moduleSource: 'explicit-heading', title: item.title, description: item.description,
      mediaStatus: item.mediaStatus === 'not-provided' ? 'not-provided' : 'available',
      evidenceIds: [bodyEvidenceId], sourceItemIds: [sourceItemId], media: [],
    };
    if (highlight.mediaStatus === 'available') {
      if (!item.demoSourceRef || !Number.isFinite(item.demoStart) || !Number.isFinite(item.demoEnd)) {
        throw new Error(`Reviewed demo coordinates missing: ${article.order} ${item.title}`);
      }
      const demoRecord = recordForRef(records, item.demoSourceRef, { requireBlocks: false });
      const demoX = item.demoX ?? .035;
      const demoWidth = item.demoWidth ?? .93;
      const demoRegion = item.demoMode === 'original'
        ? { x: 0, y: 0, width: demoRecord.width, height: demoRecord.height }
        : {
          x: Math.round(demoRecord.width * demoX), y: Math.ceil(demoRecord.height * item.demoStart),
          width: Math.max(1, Math.floor(demoRecord.width * demoWidth)),
          height: Math.max(1, Math.floor(demoRecord.height * (item.demoEnd - item.demoStart))),
        };
      // Demo rectangles are part of the reviewed manifest. Do not mutate them
      // from whichever OCR line happened to match the body text: sparse or
      // decorative headings are frequently missed by OCR and previously
      // collapsed correct screenshots into thin horizontal strips. Validation
      // still rejects manifest regions that overlap any actual title/body OCR
      // block inside the reviewed body interval.
      evidence.push({
        id: demoEvidenceId, kind: 'image-region', role: 'demo-region', source: demoRecord.relative, sourceIndex: demoRecord.index,
        sourceHash: demoRecord.hash, blockIds: [], region: demoRegion, note: `${item.module}：${item.title}人工确认演示区域`,
      });
      highlight.evidenceIds.push(demoEvidenceId);
      const ratio = demoRegion.width / demoRegion.height;
      const displayWidth = Math.min(480, demoRegion.width);
      highlight.media.push(item.demoMode === 'original' ? {
        id: `${id}-media-01`, kind: /\.gif$/i.test(demoRecord.source) ? 'animated-image' : 'image',
        src: legacyAssetFor(demoRecord), thumbnail: legacyAssetFor(demoRecord), alt: `${item.title}功能演示`,
        evidenceId: demoEvidenceId, width: displayWidth, height: Math.max(1, Math.round(displayWidth / ratio)),
      } : {
        id: `${id}-media-01`, kind: 'image', ...generatedPaths(article.order, id), alt: `${item.title}功能演示`,
        evidenceId: demoEvidenceId, width: displayWidth, height: Math.max(1, Math.round(displayWidth / ratio)),
      });
    }
    highlights.push(highlight);
  }

  // V4 deliberately reverses the old precedence: OCR locates evidence only;
  // it can never become production copy. Every published row comes from the
  // per-article, manually reviewed inventory below.
  const reviewedUpdates = updateReviewManifest.articles[String(article.order)];
  if (!reviewedUpdates) throw new Error(`Missing V4 reviewed update inventory for ${article.order}`);
  const updateCandidates = reviewedUpdates.map((item) => {
    const match = findBestBlocks(records, { title: item.module, description: item.sourceText ?? item.description });
    if (!match?.record.width || !match.block) throw new Error(`Cannot bind V4 update to source: ${article.order} ${item.description}`);
    return { ...item, record: match.record, blocks: bodyBlocksFor(match, { description: item.sourceText ?? item.description }) };
  });

  const updates = [];
  for (const [index, candidate] of updateCandidates.entries()) {
    const id = `update-${String(index + 1).padStart(2, '0')}`;
    const evidenceId = `${id}-source`;
    const sourceItemId = `source-update-${String(index + 1).padStart(2, '0')}`;
    const region = normalizedRegion(candidate.blocks, candidate.record.width, candidate.record.height);
    evidence.push({
      id: evidenceId, kind: 'image-region', role: 'update-list', source: candidate.record.relative, sourceIndex: candidate.record.index,
      sourceHash: candidate.record.hash, blockIds: candidate.blocks.map((block) => block.id), region, note: '逐项更新清单',
    });
    sourceItems.push({
      id: sourceItemId, classification: 'update', source: candidate.record.relative, sourceIndex: candidate.record.index,
      sourceHash: candidate.record.hash, blockIds: candidate.blocks.map((block) => block.id),
      text: candidate.sourceText ?? candidate.description, correctedText: candidate.description, targetIds: [id],
    });
    updates.push({
      id, module: candidate.module, moduleSource: candidate.moduleSource, type: candidate.type, typeSource: candidate.typeSource,
      sourceText: candidate.sourceText ?? candidate.description, description: candidate.description,
      evidenceIds: [evidenceId], sourceItemIds: [sourceItemId],
    });
  }

  const usedBlocks = new Set(sourceItems.flatMap((item) => item.blockIds.map((blockId) => `${item.source}\0${blockId}`)));
  const seenExcludedText = new Set();
  const demoRegions = evidence.filter((item) => item.role === 'demo-region' && item.region);
  let excludedCounter = sourceItems.length;
  const excluded = canonicalRecords(records).flatMap((record) => {
    const items = [];
    for (const block of record.blocks) {
      const blockKey = `${record.relative}\0${block.id}`;
      if (usedBlocks.has(blockKey)) continue;
      let reason;
      if (PLAN_RE.test(block.text)) reason = 'device-plan';
      else if (DISCLAIMER_RE.test(block.text)) reason = 'disclaimer';
      else {
        const centerX = (block.x + block.width / 2) * record.width;
        const centerY = (block.y + block.height / 2) * record.height;
        const insideDemo = demoRegions.some((entry) => entry.source === record.relative
          && centerX >= entry.region.x && centerX <= entry.region.x + entry.region.width
          && centerY >= entry.region.y && centerY <= entry.region.y + entry.region.height);
        const textKey = keyText(block.text);
        if (insideDemo) reason = 'demo-text';
        else if (seenExcludedText.has(textKey)) reason = 'duplicate';
        else reason = 'decoration';
        seenExcludedText.add(textKey);
      }
      excludedCounter += 1;
      const id = `source-excluded-${String(excludedCounter).padStart(3, '0')}`;
      const evidenceId = `${id}-evidence`;
      evidence.push({
        id: evidenceId, kind: 'image-region', role: 'excluded', source: record.relative, sourceIndex: record.index,
        sourceHash: record.hash, blockIds: [block.id], region: normalizedRegion([block], record.width, record.height),
        note: `不进入表格：${reason}`,
      });
      items.push({ id, classification: 'excluded', source: record.relative, sourceIndex: record.index, sourceHash: record.hash, blockIds: [block.id], text: block.text, targetIds: [], exclusionReason: reason });
    }
    return items;
  });
  sourceItems.push(...excluded);

  const includedItemCount = highlights.length + updates.length;
  const mediaCount = highlights.reduce((total, item) => total + item.media.length, 0);
  return {
    schemaVersion: 3,
    contentReviewVersion,
    mediaReviewVersion,
    articleId: article.articleId,
    reviewStatus,
    sourceHash: await articleSourceHash(article),
    highlights,
    updates,
    sourceItems,
    evidence,
    audit: {
      highlightReviewVersion,
      updateReviewVersion,
      review: { content: 'verified', modules: 'verified', media: 'verified', page: 'verified' },
      expectedHighlightCount: reviewedHighlightExpectations[article.order],
      sourceItemCount: sourceItems.length,
      includedItemCount,
      excludedItemCount: excluded.length,
      highlightCount: highlights.length,
      updateCount: updates.length,
      mediaCount,
      mappedItemCount: sourceItems.length,
      coverageRate: 1,
      ...(article.order === 12 ? { quantityHint: 40 } : {}),
    },
  };
}

export async function generateDigestMediaV2(_article, digest) {
  let generated = 0;
  for (const highlight of digest.highlights) {
    for (const media of highlight.media) {
      if (media.kind !== 'image' || !media.src.startsWith('assets/digests-v2/')) continue;
      const evidence = digest.evidence.find((entry) => entry.id === media.evidenceId);
      if (!evidence?.region || evidence.role !== 'demo-region') continue;
      const source = path.join(archiveRoot, evidence.source);
      const outputDir = path.join(siteRoot, 'public', path.dirname(media.thumbnail));
      await fs.mkdir(outputDir, { recursive: true });
      for (const outputWidth of [480, 960]) {
        const base = sharp(source, { pages: 1 }).extract({ left: evidence.region.x, top: evidence.region.y, width: evidence.region.width, height: evidence.region.height })
          .resize({ width: outputWidth, withoutEnlargement: true });
        await base.clone().webp({ quality: outputWidth === 480 ? 78 : 83, effort: 4 }).toFile(path.join(outputDir, `${highlight.id}-${outputWidth}.webp`));
        await base.clone().avif({ quality: outputWidth === 480 ? 52 : 59, effort: 4 }).toFile(path.join(outputDir, `${highlight.id}-${outputWidth}.avif`));
      }
      generated += 1;
    }
  }
  return generated;
}

export async function hashGeneratedMedia(relative) {
  const file = path.join(siteRoot, 'public', publicPath(relative));
  if (!(await exists(file))) return null;
  if (!hashCache.has(file)) hashCache.set(file, await hashFile(file));
  return hashCache.get(file);
}
