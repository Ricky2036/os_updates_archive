import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  articleSourceHash, archiveRoot, digestDir, exists, hashFile, loadArticles, negativeDigestPhrases, siteRoot,
} from './monthly-digest-common.mjs';
import { targetMonthlyOrders } from './monthly-digest-seeds.mjs';
import { highlightReviewVersion, reviewedHighlightExpectations, reviewedHighlightsByOrder } from './monthly-highlight-reviews.mjs';
import updateReviewManifest from './monthly-update-reviews.json' with { type: 'json' };
import { reviewedUpdatesFor } from './monthly-update-overrides.mjs';
import { contentReviewVersion, mediaReviewVersion, updateReviewVersion } from './monthly-digest-v2.mjs';

const fail = (message) => { throw new Error(message); };
const intersectionArea = (left, right) => {
  const width = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
  const height = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
  return width * height;
};
const targetSet = new Set(targetMonthlyOrders);
const articles = (await loadArticles()).map(({ data }) => data);
const args = process.argv.slice(2);
const selector = args.includes('--article') ? args[args.indexOf('--article') + 1] : null;
const allTargets = articles.filter((article) => targetSet.has(article.order)).sort((a, b) => a.order - b.order);
const targets = selector
  ? allTargets.filter((article) => article.articleId === selector || article.slug === selector || `${String(article.order).padStart(2, '0')}-${article.brand}` === selector)
  : allTargets;
if (selector && targets.length !== 1) fail(`Expected one monthly article for selector ${selector}, found ${targets.length}`);
const files = (await fs.readdir(digestDir).catch(() => [])).filter((name) => name.endsWith('.json')).sort();
const allDigests = await Promise.all(files.map(async (file) => ({ file, data: JSON.parse(await fs.readFile(path.join(digestDir, file), 'utf8')) })));
const selectedIds = new Set(targets.map((article) => article.articleId));
const digests = selector ? allDigests.filter(({ data }) => selectedIds.has(data.articleId)) : allDigests;

if (!selector && (targets.filter((item) => item.brand === 'coloros').length !== 15 || targets.filter((item) => item.brand === 'originos').length !== 9)) fail('Core monthly article inventory must retain 15 ColorOS and 9 OriginOS entries');
if (digests.length !== targets.length) fail(`Expected ${targets.length} monthly digest files, found ${digests.length}`);
if (new Set(digests.map(({ data }) => data.articleId)).size !== targets.length) fail('Monthly digest article IDs are not unique');
const expectedIds = new Set(targets.map((article) => article.articleId));
for (const { data } of digests) if (!expectedIds.has(data.articleId)) fail(`Unexpected monthly digest: ${data.articleId}`);

for (const { file, data } of digests) {
  const article = targets.find((item) => item.articleId === data.articleId);
  if (!article) fail(`Digest does not map to an article: ${file}`);
  if (data.schemaVersion !== 3 || data.reviewStatus !== 'verified') fail(`Only verified schema V3 is allowed: ${file}`);
  if (data.contentReviewVersion !== contentReviewVersion || data.mediaReviewVersion !== mediaReviewVersion) fail(`Outdated V4 review version in ${file}`);
  if (data.audit.highlightReviewVersion !== highlightReviewVersion) fail(`Outdated highlight review inventory in ${file}`);
  if (data.audit.updateReviewVersion !== updateReviewVersion) fail(`Outdated update review inventory in ${file}`);
  if (Object.values(data.audit.review ?? {}).some((status) => status !== 'verified') || Object.keys(data.audit.review ?? {}).length !== 4) fail(`Four-way review is incomplete in ${file}`);
  if (data.audit.expectedHighlightCount !== reviewedHighlightExpectations[article.order]
      || data.highlights.length !== reviewedHighlightExpectations[article.order]) fail(`Reviewed highlight count mismatch in ${file}`);
  if (data.sourceHash !== await articleSourceHash(article)) fail(`Source changed; re-review required: ${file}`);
  if (!data.highlights.length || !data.updates.length) fail(`Digest tables must not be empty: ${file}`);

  const evidenceById = new Map();
  for (const evidence of data.evidence) {
    if (evidenceById.has(evidence.id)) fail(`Duplicate evidence ID in ${file}: ${evidence.id}`);
    if (!['body-text', 'demo-region', 'update-list', 'excluded'].includes(evidence.role)) fail(`Missing evidence role in ${file}: ${evidence.id}`);
    const source = path.join(archiveRoot, evidence.source);
    if (!await exists(source)) fail(`Missing evidence source in ${file}: ${evidence.source}`);
    if (evidence.sourceHash !== await hashFile(source)) fail(`Evidence hash changed in ${file}: ${evidence.source}`);
    if (/\[(?:n|\d+)\]/.test(evidence.selector ?? '')) fail(`Virtual evidence selector is forbidden in ${file}: ${evidence.selector}`);
    if (evidence.kind === 'image-region') {
      if (!evidence.region || evidence.region.width <= 0 || evidence.region.height <= 0) fail(`Invalid evidence region in ${file}: ${evidence.id}`);
      const metadata = await sharp(source, { pages: 1 }).metadata();
      if (evidence.region.x + evidence.region.width > (metadata.width ?? 0) + 1 || evidence.region.y + evidence.region.height > (metadata.height ?? 0) + 1) fail(`Evidence region exceeds source bounds in ${file}: ${evidence.id}`);
    }
    evidenceById.set(evidence.id, evidence);
  }

  const sourceItemById = new Map();
  for (const item of data.sourceItems) {
    if (sourceItemById.has(item.id)) fail(`Duplicate source item ID in ${file}: ${item.id}`);
    if (!item.blockIds?.length || !item.sourceHash || item.sourceIndex < 0) fail(`Source item lacks real OCR/DOM evidence in ${file}: ${item.id}`);
    if (item.classification === 'excluded' && (!item.exclusionReason || item.targetIds.length)) fail(`Excluded item is incomplete in ${file}: ${item.id}`);
    if (item.classification !== 'excluded' && !item.targetIds.length) fail(`Included source item is unmapped in ${file}: ${item.id}`);
    sourceItemById.set(item.id, item);
  }

  const referencedSourceItems = new Set();
  const serialized = JSON.stringify({ highlights: data.highlights, updates: data.updates });
  for (const phrase of negativeDigestPhrases) if (serialized.includes(phrase)) fail(`Demonstration or excluded text leaked into ${file}: ${phrase}`);
  const reviewedHighlights = reviewedHighlightsByOrder[article.order] ?? [];
  const demoRegionKeys = new Set();
  for (const [highlightIndex, highlight] of data.highlights.entries()) {
    const reviewed = reviewedHighlights[highlightIndex];
    if (!reviewed || highlight.module !== reviewed.module || highlight.title !== reviewed.title || highlight.description !== reviewed.description) {
      fail(`Highlight diverged from the reviewed inventory in ${file}: row ${highlightIndex + 1}`);
    }
    if (!highlight.module || !highlight.moduleSource || !highlight.title || !highlight.description) fail(`Incomplete highlight in ${file}: ${highlight.id}`);
    for (const id of highlight.sourceItemIds) { if (!sourceItemById.has(id)) fail(`Highlight source item missing in ${file}: ${id}`); referencedSourceItems.add(id); }
    for (const id of highlight.evidenceIds) if (!evidenceById.has(id)) fail(`Highlight evidence missing in ${file}: ${id}`);
    if (highlight.mediaStatus === 'available' && !highlight.media.length) fail(`Available highlight has no media in ${file}: ${highlight.id}`);
    if (highlight.mediaStatus === 'not-provided' && highlight.media.length) fail(`No-media highlight unexpectedly has media in ${file}: ${highlight.id}`);
    for (const media of highlight.media) {
      const mediaEvidence = evidenceById.get(media.evidenceId);
      if (!mediaEvidence || mediaEvidence.role !== 'demo-region') fail(`Highlight media lacks a demo-region in ${file}: ${media.id}`);
      if (path.basename(mediaEvidence.source) !== reviewed.demoSourceRef) fail(`Highlight media uses the wrong reviewed source in ${file}: ${highlight.id}`);
      const demoRegionKey = `${mediaEvidence.source}\0${mediaEvidence.region.x}\0${mediaEvidence.region.y}\0${mediaEvidence.region.width}\0${mediaEvidence.region.height}`;
      if (demoRegionKeys.has(demoRegionKey)) fail(`Two highlights share the same unsplit demo rectangle in ${file}: ${highlight.id}`);
      demoRegionKeys.add(demoRegionKey);
      if (media.kind === 'image' && !media.src.startsWith('assets/digests-v2/')) fail(`Static demo still references an original long image in ${file}: ${media.src}`);
      for (const value of [media.src, media.thumbnail, media.avifSrc, media.avifThumbnail].filter(Boolean)) {
        if (!await exists(path.join(siteRoot, 'public', value))) fail(`Missing digest media in ${file}: ${value}`);
      }
      if (!media.alt) fail(`Media alternative text missing in ${file}: ${media.id}`);
      const source = path.join(archiveRoot, mediaEvidence.source);
      const sourceMetadata = await sharp(source, { pages: 1 }).metadata();
      const sameReviewedSource = path.basename(mediaEvidence.source) === reviewed.sourceRef;
      const reviewedBodyStart = sameReviewedSource && Number.isFinite(reviewed.bodyStart) ? Math.round((sourceMetadata.height ?? 0) * reviewed.bodyStart) : null;
      const reviewedBodyEnd = sameReviewedSource && Number.isFinite(reviewed.bodyEnd) ? Math.round((sourceMetadata.height ?? 0) * reviewed.bodyEnd) : null;
      if (reviewedBodyStart !== null && reviewedBodyEnd !== null) {
        const reviewedBodyRegion = { x: 0, y: reviewedBodyStart, width: sourceMetadata.width ?? 0, height: Math.max(1, reviewedBodyEnd - reviewedBodyStart) };
        if (intersectionArea(reviewedBodyRegion, mediaEvidence.region) > 0) fail(`Demo crop overlaps the reviewed title/description interval in ${file}: ${highlight.id}`);
      }
      if (media.kind === 'image') {
        const areaRate = mediaEvidence.region.width * mediaEvidence.region.height / Math.max(1, (sourceMetadata.width ?? 1) * (sourceMetadata.height ?? 1));
        const sourceAspect = (sourceMetadata.height ?? 1) / Math.max(1, sourceMetadata.width ?? 1);
        const maxAreaRate = sourceAspect > 4 ? .42 : .78;
        const displayAspect = mediaEvidence.region.height / Math.max(1, mediaEvidence.region.width);
        if (areaRate < .005 || areaRate > maxAreaRate || displayAspect < .18) fail(`Reviewed demo crop is implausibly small, thin or large in ${file}: ${highlight.id} (${areaRate.toFixed(3)}, aspect ${displayAspect.toFixed(3)})`);
      }
    }
  }
  const reviewedUpdates = reviewedUpdatesFor(article.order, updateReviewManifest) ?? [];
  if (reviewedUpdates.length !== data.updates.length) fail(`V4 update count diverged in ${file}`);
  for (const [updateIndex, update] of data.updates.entries()) {
    const reviewed = reviewedUpdates[updateIndex];
    if (!reviewed || update.module !== reviewed.module || update.moduleSource !== reviewed.moduleSource
      || update.type !== reviewed.type || update.typeSource !== reviewed.typeSource
      || update.description !== reviewed.description || update.sourceText !== reviewed.sourceText) fail(`Update diverged from V4 reviewed inventory in ${file}: row ${updateIndex + 1}`);
    if (!update.module || !update.moduleSource || !update.type || !update.typeSource || !update.description) fail(`Incomplete update in ${file}: ${update.id}`);
    if (update.module === '未标注') fail(`Unclassified module is forbidden in ${file}: ${update.id}`);
    if (/([\p{Script=Han}])\s+(?=[\p{Script=Han}])/u.test(update.description)) fail(`Abnormal Chinese inter-character spacing in ${file}: ${update.id}`);
    if (/[，、：；（(\/_-]$/.test(update.description) || /[A-Za-z]$/.test(update.description) || /\d{1,2}$/.test(update.description)) {
      fail(`Update appears truncated or contains a trailing OCR footnote in ${file}: ${update.id}`);
    }
    for (const id of update.sourceItemIds) { if (!sourceItemById.has(id)) fail(`Update source item missing in ${file}: ${id}`); referencedSourceItems.add(id); }
    for (const id of update.evidenceIds) if (evidenceById.get(id)?.role !== 'update-list') fail(`Update lacks update-list evidence in ${file}: ${id}`);
  }
  for (const item of data.sourceItems) if (item.classification !== 'excluded' && !referencedSourceItems.has(item.id)) fail(`Non-excluded source item is not used in ${file}: ${item.id}`);

  const included = data.sourceItems.filter((item) => item.classification !== 'excluded').length;
  const excluded = data.sourceItems.length - included;
  const mapped = included + excluded;
  if (data.audit.sourceItemCount !== data.sourceItems.length || data.audit.includedItemCount !== included || data.audit.excludedItemCount !== excluded || data.audit.mappedItemCount !== mapped || data.audit.coverageRate !== 1) fail(`Audit coverage mismatch in ${file}`);
  const allLogicalBlocks = new Set(data.sourceItems.flatMap((item) => item.blockIds.map((blockId) => `${item.source}\0${blockId}`)));
  if (allLogicalBlocks.size === 0) fail(`No auditable source inventory in ${file}`);
  if (data.audit.highlightCount !== data.highlights.length || data.audit.updateCount !== data.updates.length || data.audit.mediaCount !== data.highlights.reduce((sum, item) => sum + item.media.length, 0)) fail(`Audit counts mismatch in ${file}`);
  if (article.order === 12 && (data.updates.length < 40 || data.audit.quantityHint !== 40)) fail(`ColorOS May completeness baseline failed: ${data.updates.length} updates`);
}

if (!selector) {
  const may = digests.find(({ data }) => data.articleId === 'OPPO_手机系统_ColorOS_五月升级一览')?.data;
  for (const title of ['毕业季限定水印', '端午节限定水印', '柔光人像']) if (!may?.highlights.some((item) => item.title === title && item.media.length)) fail(`ColorOS May media mapping missing: ${title}`);
  const november = digests.find(({ data }) => data.articleId === 'OPPO_ColorOS_十一月系统升级一览')?.data;
  for (const title of ['内容传送门', 'AI 同声传译支持声音克隆', '一句话 AI 人像补光', '一句话打开乘车码']) {
    if (!november?.highlights.some((item) => item.title === title && item.media.length)) fail(`ColorOS November highlight/media mapping missing: ${title}`);
  }
  if (november?.highlights.length !== 12) fail(`ColorOS November must contain 12 reviewed visual highlights, found ${november?.highlights.length ?? 0}`);
  const march = articles.find((article) => article.order === 27);
  if (march?.publishedAt !== '2025-03-01') fail(`OriginOS March metadata is incorrect: ${march?.publishedAt}`);
}

console.log(`Monthly digests verified: ${digests.length} schema V3 files, V4 content/media review, source-bound media and exact reviewed update inventories.`);
