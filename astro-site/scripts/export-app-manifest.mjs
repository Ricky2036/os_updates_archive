import fs from 'node:fs/promises';
import path from 'node:path';

const siteDir = path.resolve(import.meta.dirname, '..');
const contentArticlesDir = path.join(siteDir, 'src/content/articles');
const contentDigestsDir = path.join(siteDir, 'src/content/monthly-digests');
const outputManifestDir = path.join(siteDir, 'public/manifests');
const pagesPublicManifestDir = path.join(siteDir, '.pages-public/manifests');

async function run() {
  await fs.mkdir(outputManifestDir, { recursive: true });
  await fs.mkdir(pagesPublicManifestDir, { recursive: true });

  const articleFiles = (await fs.readdir(contentArticlesDir)).filter((name) => name.endsWith('.json')).sort();
  const rawArticles = await Promise.all(
    articleFiles.map(async (name) => JSON.parse(await fs.readFile(path.join(contentArticlesDir, name), 'utf8')))
  );

  const articles = rawArticles.map((art) => ({
    id: art.articleId,
    title: art.title,
    brand: art.brand,
    year: art.year,
    slug: art.slug,
    route: `${art.brand}/${art.year}/${art.slug}`,
    publishedAt: art.publishedAt,
    kind: art.kind,
    cover: art.cover?.src || '',
    dominantColor: art.cover?.dominantColor || '#181818',
  }));

  let digests = [];
  try {
    const digestFiles = (await fs.readdir(contentDigestsDir)).filter((name) => name.endsWith('.json')).sort();
    digests = await Promise.all(
      digestFiles.map(async (name) => {
        const d = JSON.parse(await fs.readFile(path.join(contentDigestsDir, name), 'utf8'));
        return {
          id: d.id || name.replace('.json', ''),
          title: d.title || d.month || '',
          brand: d.brand || '',
          year: d.year || 2026,
        };
      })
    );
  } catch (e) {
    // optional digests
  }

  const manifest = {
    appName: 'OS档案馆',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    baseUrl: 'https://ricky2036.github.io/os_updates_archive',
    counts: {
      articles: articles.length,
      digests: digests.length,
    },
    sections: [
      { id: 'all', title: '全量档案', route: '' },
      { id: 'coloros', title: 'ColorOS', route: 'coloros/' },
      { id: 'originos', title: 'OriginOS', route: 'originos/' },
    ],
    articles,
    digests,
  };

  const jsonStr = JSON.stringify(manifest, null, 2);
  const target1 = path.join(outputManifestDir, 'app-manifest.json');
  const target2 = path.join(pagesPublicManifestDir, 'app-manifest.json');

  await fs.writeFile(target1, jsonStr, 'utf8');
  await fs.writeFile(target2, jsonStr, 'utf8');

  console.log(`App manifest generated: ${articles.length} articles, ${digests.length} digests.`);
  console.log(`Saved to ${target1} and ${target2}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
