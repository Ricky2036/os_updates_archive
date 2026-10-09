import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const siteDir = path.resolve(import.meta.dirname, '..');
const articlesDir = path.join(siteDir, 'src/content/articles');
const publicDir = path.join(siteDir, 'public');
const coverDir = path.join(publicDir, 'assets/covers');

await fs.mkdir(coverDir, { recursive: true });

const hash = (value, length = 16) => crypto.createHash('sha1').update(value).digest('hex').slice(0, length);

// Curated specs for prominent articles and flagships
const curatedSpecs = {
  // Order 63: ColorOS 17 正式发布！亮点抢先看
  63: {
    source: 'assets/legacy/interactive/a018709eeac188aa18038e6c46adf9b9.webp',
    mode: 'contain',
    bg: '#0c1117',
    dominantColor: '#0c1117',
    alt: 'ColorOS 17 正式发布 封面'
  },
  // Order 64: 带你一图读懂 OriginOS 7
  64: {
    source: 'assets/legacy/interactive/3685d699063cbb11d899816c7c111f18.webp',
    extract: { left: 40, top: 80, width: 1000, height: 1240 },
    mode: 'contain',
    bg: '#0d0f12',
    dominantColor: '#0d0f12',
    alt: '带你一图读懂 OriginOS 7 封面'
  },
  // Order 69: 更多 OriginOS 7 体验亮点
  69: {
    source: 'assets/legacy/interactive/ceda64b2096f4b422496a7d619a6060c.webp',
    extract: { left: 40, top: 680, width: 1000, height: 1300 },
    mode: 'contain',
    bg: '#0b0e14',
    dominantColor: '#0b0e14',
    alt: '更多 OriginOS 7 体验亮点 封面'
  },
  // Order 62: MagicOS 11正式发布！一图读懂升级亮点
  62: {
    source: 'assets/images/MagicOS_11正式发布！一图读懂升级亮点_(2026)/0.webp',
    extract: { left: 0, top: 180, width: 1080, height: 1400 },
    mode: 'contain',
    bg: '#060a12',
    dominantColor: '#060a12',
    alt: 'MagicOS 11 正式发布 封面'
  },
  // Order 61: OPPO ColorOS 九月系统升级一览
  61: {
    source: 'assets/responsive/dede9087151991ad-960.webp',
    extract: { left: 0, top: 0, width: 960, height: 1050 },
    mode: 'contain',
    bg: '#0e2042',
    dominantColor: '#0e2042',
    alt: 'OPPO ColorOS 九月系统升级一览 封面'
  },
  // Order 59: OPPO ColorOS 八月系统升级一览
  59: {
    source: 'assets/responsive/3ae03d35a4a509d6-960.webp',
    extract: { left: 0, top: 0, width: 960, height: 1050 },
    mode: 'contain',
    bg: '#7a1a1a',
    dominantColor: '#7a1a1a',
    alt: 'OPPO ColorOS 八月系统升级一览 封面'
  },
  // Order 44: 一气呵成看懂小米澎湃OS 4
  44: {
    source: 'assets/images/HyperOS_4/img_001.png',
    mode: 'cover',
    bg: '#0a0e1a',
    dominantColor: '#0a0e1a',
    alt: '一气呵成看懂小米澎湃OS 4 封面'
  },
  // Order 58: 荣耀MagicOS 8月更新一览
  58: {
    source: 'assets/images/MagicOS_8月更新一览_(2026)/0.webp',
    extract: { left: 0, top: 0, width: 1080, height: 1200 },
    mode: 'contain',
    bg: '#0a1526',
    dominantColor: '#0a1526',
    alt: '荣耀MagicOS 8月更新一览 封面'
  },
  // Order 57: 荣耀MagicOS 7月超大杯更新
  57: {
    source: 'assets/images/MagicOS_7月超大杯更新_(2026)/0.webp',
    extract: { left: 0, top: 0, width: 1080, height: 1200 },
    mode: 'contain',
    bg: '#081220',
    dominantColor: '#081220',
    alt: '荣耀MagicOS 7月超大杯更新 封面'
  },
  // Order 56: 荣耀MagicOS 6月更新一览
  56: {
    source: 'assets/images/MagicOS_6月更新一览_(2026)/0.webp',
    extract: { left: 0, top: 0, width: 1080, height: 1200 },
    mode: 'contain',
    bg: '#081220',
    dominantColor: '#081220',
    alt: '荣耀MagicOS 6月更新一览 封面'
  },
  // Order 55: 荣耀MagicOS 5月更新一览
  55: {
    source: 'assets/images/MagicOS_5月更新一览_(2026)/0.webp',
    extract: { left: 0, top: 0, width: 1080, height: 1200 },
    mode: 'contain',
    bg: '#081220',
    dominantColor: '#081220',
    alt: '荣耀MagicOS 5月更新一览 封面'
  },
  // Order 54: 荣耀MagicOS 4月更新一览
  54: {
    source: 'assets/images/MagicOS_4月更新一览_(2026)/0.webp',
    extract: { left: 0, top: 0, width: 1080, height: 1200 },
    mode: 'contain',
    bg: '#081220',
    dominantColor: '#081220',
    alt: '荣耀MagicOS 4月更新一览 封面'
  },
  // Order 65: OriginOS 6 正式发布！亮点抢先看
  65: {
    source: 'assets/digests-2025/originos/originos6-summary.webp',
    mode: 'contain',
    bg: '#0d0f12',
    dominantColor: '#0d0f12',
    alt: 'OriginOS 6 正式发布 封面'
  },
  // Order 66: Xiaomi HyperOS 3 正式发布！亮点抢先看
  66: {
    source: 'assets/digests-2025/hyperos/hyperos3-summary.webp',
    mode: 'contain',
    bg: '#0a0e1a',
    dominantColor: '#0a0e1a',
    alt: 'Xiaomi HyperOS 3 正式发布 封面'
  },
  // Order 67: MagicOS 10 正式发布！升级亮点全景
  67: {
    source: 'assets/digests-2025/magicos/magicos10-summary-1.webp',
    mode: 'contain',
    bg: '#060a12',
    dominantColor: '#060a12',
    alt: 'MagicOS 10 正式发布 封面'
  },
  // Order 68: HarmonyOS 6 正式发布！亮点抢先看
  68: {
    source: 'assets/digests-2025/harmonyos/harmonyos6-summary-1.webp',
    mode: 'contain',
    bg: '#050811',
    dominantColor: '#050811',
    alt: 'HarmonyOS 6 正式发布 封面'
  },
  // Order 8: ColorOS 16 正式发布！亮点抢先看
  8: {
    source: 'assets/legacy/interactive/19203a3f8c6960e9f7c064eb97fda693.webp',
    mode: 'contain',
    bg: '#0a1526',
    dominantColor: '#0a1526',
    alt: 'ColorOS 16 正式发布 封面'
  }
};

async function findSourceImageForArticle(article) {
  if (curatedSpecs[article.order]) {
    const spec = curatedSpecs[article.order];
    const specPath = path.join(publicDir, spec.source);
    try {
      await fs.access(specPath);
      return { relative: spec.source, abs: specPath, spec };
    } catch {
      console.warn(`[WARN] Curated source not found: ${specPath}`);
    }
  }

  // Check article media array
  if (article.media?.length) {
    for (const m of article.media) {
      if (m.src && (m.src.endsWith('.webp') || m.src.endsWith('.png') || m.src.endsWith('.jpg'))) {
        const abs = path.join(publicDir, m.src.replace(/^\//, ''));
        try {
          await fs.access(abs);
          return { relative: m.src.replace(/^\//, ''), abs };
        } catch {}
      }
    }
  }

  // Check html for images
  if (article.html) {
    const matches = [...article.html.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1]);
    for (const rawSrc of matches) {
      let cleaned = rawSrc.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
      const abs = path.join(publicDir, cleaned);
      try {
        await fs.access(abs);
        return { relative: cleaned, abs };
      } catch {}
    }
  }

  // Check images directory
  const imgDir = path.join(publicDir, 'assets/images', article.articleId);
  try {
    const files = await fs.readdir(imgDir);
    for (const f of ['0.webp', '0.png', '0.jpg', 'img_001.png', 'img_001.jpg']) {
      if (files.includes(f)) {
        const rel = `assets/images/${article.articleId}/${f}`;
        return { relative: rel, abs: path.join(imgDir, f) };
      }
    }
    if (files.length > 0) {
      const rel = `assets/images/${article.articleId}/${files[0]}`;
      return { relative: rel, abs: path.join(imgDir, files[0]) };
    }
  } catch {}

  // Fallback to existing cover source
  if (article.cover?.src) {
    const abs = path.join(publicDir, article.cover.src);
    try {
      await fs.access(abs);
      return { relative: article.cover.src, abs };
    } catch {}
  }

  return null;
}

async function processArticleCover(file) {
  const filePath = path.join(articlesDir, file);
  const json = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const found = await findSourceImageForArticle(json);

  if (!found) {
    console.warn(`[SKIP] No source image found for Order ${json.order}: ${json.title}`);
    return;
  }

  const spec = curatedSpecs[json.order] || {};
  const inputPath = found.abs;
  const key = hash(`refined-cover:${json.order}:${found.relative}`);
  const widths = [480, 800, 1200];
  const webp = [];
  const avif = [];

  const meta = await sharp(inputPath, { pages: 1 }).metadata();
  const width = meta.width || 1200;
  const height = meta.height || 675;

  let dominantColor = spec.dominantColor;
  if (!dominantColor) {
    try {
      const stats = await sharp(inputPath, { pages: 1 }).stats();
      const d = stats.dominant;
      dominantColor = `#${[d.r, d.g, d.b].map((p) => p.toString(16).padStart(2, '0')).join('')}`;
    } catch {
      dominantColor = '#12171d';
    }
  }

  const bg = spec.bg || dominantColor || '#12171d';

  for (const w of widths) {
    const h = Math.round((w * 9) / 16);
    let pipeline = sharp(inputPath, { pages: 1 });

    if (spec.extract) {
      const left = Math.max(0, Math.min(spec.extract.left, width - 10));
      const top = Math.max(0, Math.min(spec.extract.top, height - 10));
      const extractWidth = Math.min(spec.extract.width, width - left);
      const extractHeight = Math.min(spec.extract.height, height - top);
      pipeline = pipeline.extract({ left, top, width: extractWidth, height: extractHeight });
    }

    if (spec.mode === 'cover') {
      pipeline = pipeline.resize(w, h, { fit: 'cover', position: 'center' });
    } else {
      // Use contain with matching background to prevent any text clipping
      pipeline = pipeline.resize(w, h, { fit: 'contain', background: bg });
    }

    const webpQuality = w === 1200 ? 78 : w === 800 ? 74 : 72;
    const avifQuality = w === 1200 ? 52 : w === 800 ? 48 : 45;
    const webpName = `${key}-${w}.webp`;
    const avifName = `${key}-${w}.avif`;

    await pipeline.clone().webp({ quality: webpQuality, effort: 5 }).toFile(path.join(coverDir, webpName));
    await pipeline.clone().avif({ quality: avifQuality, effort: 5 }).toFile(path.join(coverDir, avifName));

    webp.push({ width: w, src: `assets/covers/${webpName}` });
    avif.push({ width: w, src: `assets/covers/${avifName}` });
  }

  const cover = {
    src: webp.at(-1).src,
    srcset: webp.map((item) => `${item.src} ${item.width}w`).join(', '),
    avifSrcset: avif.map((item) => `${item.src} ${item.width}w`).join(', '),
    width: 1200,
    height: 675,
    alt: spec.alt || `${json.title} 封面`,
    dominantColor,
    focalPoint: '50% 50%'
  };

  json.cover = cover;
  await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  console.log(`✅ Refined cover for Order ${String(json.order).padStart(2)}: ${json.title} (${key})`);
}

const files = (await fs.readdir(articlesDir)).filter((f) => f.endsWith('.json')).sort();
for (const f of files) {
  await processArticleCover(f);
}

console.log(`\n🎉 All ${files.length} article covers successfully refined!`);
