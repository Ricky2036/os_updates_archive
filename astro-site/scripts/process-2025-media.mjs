import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const siteRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(siteRoot, '..');
const sourceDir = '/Users/jingzhan.chen/Downloads/OS竞品动态跟踪 - 2025/图片和附件';
const outputBaseDir = path.resolve(siteRoot, 'public/assets/digests-2025');
const ffmpegBin = '/Users/jingzhan.chen/homebrew/bin/ffmpeg';

fs.mkdirSync(outputBaseDir, { recursive: true });

export async function processImage(sourceFilename, brand, baseName) {
  const brandDir = path.join(outputBaseDir, brand);
  fs.mkdirSync(brandDir, { recursive: true });

  const inputPath = path.join(sourceDir, sourceFilename);
  if (!fs.existsSync(inputPath)) {
    console.error(`[ERROR] Missing source file: ${inputPath}`);
    return null;
  }

  const meta = await sharp(inputPath).metadata();
  const width = meta.width || 800;
  const height = meta.height || 600;

  const fullWebpRel = `assets/digests-2025/${brand}/${baseName}.webp`;
  const thumbWebpRel = `assets/digests-2025/${brand}/${baseName}-480.webp`;
  const fullAvifRel = `assets/digests-2025/${brand}/${baseName}.avif`;
  const thumbAvifRel = `assets/digests-2025/${brand}/${baseName}-480.avif`;

  const fullWebpPath = path.join(siteRoot, 'public', fullWebpRel);
  const thumbWebpPath = path.join(siteRoot, 'public', thumbWebpRel);
  const fullAvifPath = path.join(siteRoot, 'public', fullAvifRel);
  const thumbAvifPath = path.join(siteRoot, 'public', thumbAvifRel);

  // Full webp & avif (max width 1200)
  await sharp(inputPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(fullWebpPath);

  await sharp(inputPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .avif({ quality: 75 })
    .toFile(fullAvifPath);

  // Thumbnail (480px width)
  await sharp(inputPath)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbWebpPath);

  await sharp(inputPath)
    .resize({ width: 480, withoutEnlargement: true })
    .avif({ quality: 70 })
    .toFile(thumbAvifPath);

  const thumbMeta = await sharp(thumbWebpPath).metadata();

  return {
    kind: 'image',
    src: fullWebpRel,
    thumbnail: thumbWebpRel,
    avifSrc: fullAvifRel,
    avifThumbnail: thumbAvifRel,
    width: thumbMeta.width || 480,
    height: thumbMeta.height || Math.round((480 / width) * height),
    originalWidth: width,
    originalHeight: height,
  };
}

export async function processVideo(sourceFilename, brand, baseName, seekSeconds = 1) {
  const brandDir = path.join(outputBaseDir, brand);
  fs.mkdirSync(brandDir, { recursive: true });

  const inputPath = path.join(sourceDir, sourceFilename);
  if (!fs.existsSync(inputPath)) {
    console.error(`[ERROR] Missing source video: ${inputPath}`);
    return null;
  }

  const videoRel = `assets/digests-2025/${brand}/${baseName}.mp4`;
  const posterWebpRel = `assets/digests-2025/${brand}/${baseName}-poster.webp`;
  const thumbWebpRel = `assets/digests-2025/${brand}/${baseName}-poster-480.webp`;
  const posterAvifRel = `assets/digests-2025/${brand}/${baseName}-poster.avif`;
  const thumbAvifRel = `assets/digests-2025/${brand}/${baseName}-poster-480.avif`;

  const videoOutPath = path.join(siteRoot, 'public', videoRel);
  const posterWebpPath = path.join(siteRoot, 'public', posterWebpRel);
  const thumbWebpPath = path.join(siteRoot, 'public', thumbWebpRel);
  const posterAvifPath = path.join(siteRoot, 'public', posterAvifRel);
  const thumbAvifPath = path.join(siteRoot, 'public', thumbAvifRel);

  const tempPosterJpg = path.join('/tmp', `${brand}-${baseName}-raw.jpg`);

  // 1. Extract poster frame
  try {
    execFileSync(ffmpegBin, [
      '-ss', `00:00:0${seekSeconds}`,
      '-i', inputPath,
      '-vframes', '1',
      '-q:v', '2',
      tempPosterJpg,
      '-y',
    ], { stdio: 'pipe' });
  } catch {
    // If seek failed (e.g. video shorter than seekSeconds), try frame 0
    execFileSync(ffmpegBin, [
      '-ss', '00:00:00',
      '-i', inputPath,
      '-vframes', '1',
      '-q:v', '2',
      tempPosterJpg,
      '-y',
    ], { stdio: 'pipe' });
  }

  // Process poster with sharp
  const posterMeta = await sharp(tempPosterJpg).metadata();
  const width = posterMeta.width || 800;
  const height = posterMeta.height || 450;

  await sharp(tempPosterJpg)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(posterWebpPath);

  await sharp(tempPosterJpg)
    .resize({ width: 1200, withoutEnlargement: true })
    .avif({ quality: 75 })
    .toFile(posterAvifPath);

  await sharp(tempPosterJpg)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbWebpPath);

  await sharp(tempPosterJpg)
    .resize({ width: 480, withoutEnlargement: true })
    .avif({ quality: 70 })
    .toFile(thumbAvifPath);

  fs.rmSync(tempPosterJpg, { force: true });

  // 2. Compress video to web MP4 (CRF 26 fast preset)
  execFileSync(ffmpegBin, [
    '-i', inputPath,
    '-c:v', 'libx264',
    '-crf', '26',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-an',
    '-movflags', '+faststart',
    videoOutPath,
    '-y',
  ], { stdio: 'pipe' });

  const thumbMeta = await sharp(thumbWebpPath).metadata();

  return {
    kind: 'video',
    src: videoRel,
    poster: posterWebpRel,
    thumbnail: thumbWebpRel,
    avifSrc: posterAvifRel,
    avifThumbnail: thumbAvifRel,
    width: thumbMeta.width || 480,
    height: thumbMeta.height || Math.round((480 / width) * height),
    originalWidth: width,
    originalHeight: height,
  };
}
