import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const siteDir = '/Users/jingzhan.chen/Documents/antigravity/OS档案馆/astro-site';
const articlesDir = path.join(siteDir, 'src/content/articles');
const publicDir = path.join(siteDir, 'public');
const coverDir = path.join(publicDir, 'assets/covers');

const hash = (value, length = 16) => createHash('sha1').update(value).digest('hex').slice(0, length);

async function generateCoverForArticle(articleFile) {
  const filePath = path.join(articlesDir, articleFile);
  const raw = await fs.readFile(filePath, 'utf-8');
  const json = JSON.parse(raw);

  if (json.cover) {
    // Already has cover
    return;
  }

  // Find first image reference in html or derive from article
  let imgRef = null;
  const match = json.html?.match(/assets\/images\/([^" ]+)/);
  if (match) {
    imgRef = match[1];
  }

  if (!imgRef) {
    console.warn(`[WARN] No image found in ${articleFile}`);
    return;
  }

  const inputPath = path.join(publicDir, 'assets/images', imgRef);
  try {
    await fs.access(inputPath);
  } catch {
    console.error(`[ERROR] Image file does not exist: ${inputPath}`);
    return;
  }

  const key = hash(`cover:${imgRef}`);
  const widths = [480, 800, 1200];
  const webp = [];
  const avif = [];

  for (const width of widths) {
    const height = Math.round((width * 9) / 16);
    const pipeline = () =>
      sharp(inputPath, { pages: 1 })
        .flatten({ background: '#f2f4f7' })
        .resize(width, height, { fit: 'cover', position: 'top' });

    const webpName = `${key}-${width}.webp`;
    const avifName = `${key}-${width}.avif`;

    await pipeline().webp({ quality: 80, effort: 4 }).toFile(path.join(coverDir, webpName));
    await pipeline().avif({ quality: 58, effort: 4 }).toFile(path.join(coverDir, avifName));

    webp.push({ width, src: `assets/covers/${webpName}` });
    avif.push({ width, src: `assets/covers/${avifName}` });
  }

  let dominantColor = '#20252b';
  try {
    const { dominant } = await sharp(inputPath, { pages: 1 })
      .resize(64, 64, { fit: 'cover', position: 'top' })
      .stats();
    dominantColor = `#${[dominant.r, dominant.g, dominant.b].map((p) => p.toString(16).padStart(2, '0')).join('')}`;
  } catch (err) {
    // fallback
  }

  const cover = {
    src: webp.at(-1).src,
    srcset: webp.map((item) => `${item.src} ${item.width}w`).join(', '),
    avifSrcset: avif.map((item) => `${item.src} ${item.width}w`).join(', '),
    width: 1200,
    height: 675,
    alt: `${json.title} 封面`,
    dominantColor,
    focalPoint: '50% 0%',
  };

  json.cover = cover;
  await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  console.log(`✅ Generated cover for ${json.title} (${articleFile})`);
}

async function main() {
  await fs.mkdir(coverDir, { recursive: true });
  const files = await fs.readdir(articlesDir);
  for (const f of files) {
    if (f.endsWith('.json')) {
      await generateCoverForArticle(f);
    }
  }
  console.log('🎉 All missing covers generated successfully!');
}

main().catch(console.error);
