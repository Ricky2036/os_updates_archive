import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

const siteDir = path.resolve(import.meta.dirname, '..');
const contentArticlesDir = path.join(siteDir, 'src/content/articles');
const contentDigestsDir = path.join(siteDir, 'src/content/monthly-digests');
const publicDir = path.join(siteDir, 'public');
const distDir = path.join(siteDir, 'dist');
const outputManifestDir = path.join(siteDir, 'public/manifests');
const pagesPublicManifestDir = path.join(siteDir, '.pages-public/manifests');
const androidAssetsManifestPath = path.resolve(
  siteDir,
  '../android-app/app/src/main/assets/app-manifest.json'
);

const BRAND_META = [
  {
    id: 'coloros',
    title: 'ColorOS',
    subtitle: 'OPPO 系统月度更新、正式版计划与体验亮点',
    route: 'coloros/',
    accent: '#00a99d',
    soft: '#dff6f2',
    logo: 'assets/images/logo_coloros.png',
  },
  {
    id: 'originos',
    title: 'OriginOS',
    subtitle: 'vivo 系统体验升级、设计变化与功能档案',
    route: 'originos/',
    accent: '#5267ff',
    soft: '#e7eaff',
    logo: 'assets/images/logo_originos.png',
  },
  {
    id: 'hyperos',
    title: 'HyperOS',
    subtitle: '小米澎湃 OS 升级日志与月度更新详情',
    route: 'hyperos/',
    accent: '#18191c',
    soft: '#eceff4',
    logo: 'assets/images/logo_hyperos.png',
  },
  {
    id: 'magicos',
    title: 'MagicOS',
    subtitle: '荣耀 MagicOS 月度更新与体验升级记录',
    route: 'magicos/',
    accent: '#2563eb',
    soft: '#eff6ff',
    logo: 'assets/images/logo_magicos.png',
  },
  {
    id: 'harmonyos',
    title: 'HarmonyOS',
    subtitle: '华为 HarmonyOS 版本特性与升级记录',
    route: 'harmonyos/',
    accent: '#0a59f7',
    soft: '#e8f0fe',
    logo: 'assets/images/logo_harmonyos.png',
  },
];

function cleanRelPath(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let s = raw.trim();
  if (
    !s ||
    s.startsWith('data:') ||
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('#') ||
    s.startsWith('javascript:')
  ) {
    return '';
  }
  s = s.split('#')[0].split('?')[0].split(';')[0];
  s = s.replace(/^\/os_updates_archive\//, '');
  s = s.replace(/^(\.\.\/)+/, '');
  s = s.replace(/^\.\//, '');
  s = s.replace(/^\/+/, '');
  return s;
}

function getFileSize(relPath) {
  if (!relPath) return 0;
  const p1 = path.join(publicDir, relPath);
  if (fsSync.existsSync(p1) && fsSync.statSync(p1).isFile()) {
    return fsSync.statSync(p1).size;
  }
  const p2 = path.join(distDir, relPath);
  if (fsSync.existsSync(p2) && fsSync.statSync(p2).isFile()) {
    return fsSync.statSync(p2).size;
  }
  return 0;
}

function extractUrlsFromHtml(htmlText) {
  const results = new Set();
  if (!htmlText) return results;

  // Match src="...", srcset="...", data-src="...", data-lazy-bgimg="...", url(...)
  const attrRegex = /(?:src|srcset|data-src|data-lazy-bgimg|poster)=["']([^"']+)["']/gi;
  for (const match of htmlText.matchAll(attrRegex)) {
    const val = match[1];
    for (const part of val.split(',')) {
      const candidate = part.trim().split(/\s+/)[0];
      const cleaned = cleanRelPath(candidate);
      if (cleaned) results.add(cleaned);
    }
  }

  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  for (const match of htmlText.matchAll(urlRegex)) {
    const cleaned = cleanRelPath(match[1]);
    if (cleaned) results.add(cleaned);
  }

  return results;
}

async function run() {
  await fs.mkdir(outputManifestDir, { recursive: true });
  await fs.mkdir(pagesPublicManifestDir, { recursive: true });

  const articleFiles = (await fs.readdir(contentArticlesDir))
    .filter((name) => name.endsWith('.json'))
    .sort();
  const rawArticles = await Promise.all(
    articleFiles.map(async (name) =>
      JSON.parse(await fs.readFile(path.join(contentArticlesDir, name), 'utf8'))
    )
  );

  const digestsByArticleId = new Map();
  let digestsCount = 0;
  try {
    const digestFiles = (await fs.readdir(contentDigestsDir))
      .filter((name) => name.endsWith('.json'))
      .sort();
    digestsCount = digestFiles.length;
    await Promise.all(
      digestFiles.map(async (name) => {
        const d = JSON.parse(
          await fs.readFile(path.join(contentDigestsDir, name), 'utf8')
        );
        if (d.articleId) {
          digestsByArticleId.set(d.articleId, d);
        }
      })
    );
  } catch {
    // optional digests
  }

  // Discover built _astro assets if available
  const coreAssetsSet = new Set([
    '',
    'coloros/',
    'originos/',
    'hyperos/',
    'magicos/',
    'harmonyos/',
    'favicon.svg',
    'scripts/archive-ui.js',
    'assets/images/archive-mark.svg',
    'assets/images/logo.png',
    'assets/images/logo_coloros.png',
    'assets/images/logo_originos.png',
    'assets/images/logo_hyperos.png',
    'assets/images/logo_magicos.png',
    'assets/images/logo_harmonyos.png',
  ]);

  try {
    const astroBundleDir = path.join(distDir, '_astro');
    if (fsSync.existsSync(astroBundleDir)) {
      const files = await fs.readdir(astroBundleDir);
      for (const f of files) {
        if (f.endsWith('.css') || f.endsWith('.js')) {
          coreAssetsSet.add(`_astro/${f}`);
        }
      }
    }
  } catch {
    // ignore if dist not built yet
  }

  // Sort articles by brand order then order
  rawArticles.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const articles = [];

  for (const art of rawArticles) {
    const route = `${art.brand}/${art.year}/${art.slug}/`;
    const assetSet = new Set();

    const addVerifiedAsset = (rawPath) => {
      const cleaned = cleanRelPath(rawPath);
      if (!cleaned) return;
      if (getFileSize(cleaned) > 0) {
        assetSet.add(cleaned);
      }
    };

    // 1. Cover images (webp + avif + srcset)
    if (art.cover) {
      addVerifiedAsset(art.cover.src);
      for (const field of ['srcset', 'avifSrcset']) {
        if (art.cover[field]) {
          for (const part of art.cover[field].split(',')) {
            addVerifiedAsset(part.trim().split(/\s+/)[0]);
          }
        }
      }
    }

    // 2. Article media list
    for (const m of art.media || []) {
      addVerifiedAsset(m.src);
    }

    // 3. Inline HTML image references (e.g. responsive long-form images)
    if (art.html) {
      for (const ref of extractUrlsFromHtml(art.html)) {
        addVerifiedAsset(ref);
      }
    }

    // 4. Interactive compat iframe HTML and all its embedded assets
    if (art.compatPath) {
      const cleanedCompat = cleanRelPath(art.compatPath);
      addVerifiedAsset(cleanedCompat);
      const compatFullPath = path.join(publicDir, cleanedCompat);
      if (fsSync.existsSync(compatFullPath)) {
        const compatHtml = await fs.readFile(compatFullPath, 'utf8');
        for (const ref of extractUrlsFromHtml(compatHtml)) {
          addVerifiedAsset(ref);
        }
      }
    }

    // 5. Monthly digest highlights media (both thumbnails and full images, webp + avif)
    const digest = digestsByArticleId.get(art.articleId);
    const hasDigest = Boolean(digest);
    if (digest) {
      for (const h of digest.highlights || []) {
        for (const m of h.media || []) {
          addVerifiedAsset(m.src);
          addVerifiedAsset(m.thumbnail);
          addVerifiedAsset(m.avifSrc);
          addVerifiedAsset(m.avifThumbnail);
          addVerifiedAsset(m.poster);
        }
      }
    }

    const assetsList = Array.from(assetSet);
    let estimatedBytes = 28 * 1024; // HTML document baseline
    for (const rel of assetsList) {
      estimatedBytes += getFileSize(rel);
    }

    articles.push({
      id: art.articleId,
      order: art.order ?? 999,
      title: art.title,
      brand: art.brand,
      year: art.year,
      slug: art.slug,
      route,
      publishedAt: art.publishedAt,
      kind: art.kind,
      hasDigest,
      cover: cleanRelPath(art.cover?.src || ''),
      dominantColor: art.cover?.dominantColor || '#181818',
      estimatedBytes,
      assetCount: assetsList.length + 1, // +1 for the article HTML page itself
      assets: assetsList,
    });
  }

  const brands = BRAND_META.map((b) => {
    const brandArticles = articles.filter((a) => a.brand === b.id);
    const totalBytes = brandArticles.reduce((acc, a) => acc + a.estimatedBytes, 0);
    return {
      ...b,
      articleCount: brandArticles.length,
      estimatedBytes: totalBytes,
    };
  });

  const manifest = {
    appName: 'OS档案馆',
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    baseUrl: 'https://ricky2036.github.io/os_updates_archive',
    counts: {
      brands: brands.length,
      articles: articles.length,
      digests: digestsCount,
    },
    coreAssets: Array.from(coreAssetsSet),
    brands,
    articles,
  };

  const jsonStr = JSON.stringify(manifest, null, 2);
  const target1 = path.join(outputManifestDir, 'app-manifest.json');
  const target2 = path.join(pagesPublicManifestDir, 'app-manifest.json');

  await fs.writeFile(target1, jsonStr, 'utf8');
  await fs.writeFile(target2, jsonStr, 'utf8');

  if (fsSync.existsSync(path.dirname(androidAssetsManifestPath))) {
    await fs.writeFile(androidAssetsManifestPath, jsonStr, 'utf8');
    console.log(`Updated Android bundled manifest: ${androidAssetsManifestPath}`);
  }

  console.log(
    `App manifest v2.0 generated: ${brands.length} brands, ${articles.length} articles, ${digestsCount} digests.`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
