const fs = require('fs');
const articlesDir = './src/content/articles';
const rawOcr = require('../raw_ocr_results.json');

const args = process.argv.slice(2);
const id = args[0];

const articleFile = fs.readFileSync(`${articlesDir}/${id}-hyperos.json`, 'utf8');
const article = JSON.parse(articleFile);

const legacyPath = article.legacyPath.replace('.html', '');
const ocrKeys = rawOcr.article_map[legacyPath];

if (!ocrKeys) {
  console.log('No OCR found for', legacyPath);
  process.exit(1);
}

for (const key of ocrKeys) {
  const ocrData = rawOcr.ocr_data[key];
  console.log(`\n--- IMAGE: ${key.split('/').pop()} ---`);
  
  const blocks = [...ocrData.blocks].sort((a, b) => a.y - b.y);
  
  for (const block of blocks) {
    console.log(`[Y: ${block.y.toFixed(3)}, H: ${block.height.toFixed(3)}] ${block.text.replace(/\n/g, ' ')}`);
  }
}
