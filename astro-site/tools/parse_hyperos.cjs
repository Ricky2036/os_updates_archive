const fs = require('fs');
const rawOcr = require('../../raw_ocr_results.json');
const articlesDir = './src/content/articles';

const ids = process.argv.slice(2).map(Number);
let seedsCode = '';
let highlightReviewsCode = '';
let v4InventoryCode = '';

for (const id of ids) {
  const articleFile = fs.readFileSync(`${articlesDir}/${id}-hyperos.json`, 'utf8');
  const article = JSON.parse(articleFile);
  const legacyPath = article.legacyPath.replace('.html', '');
  const ocrKeys = rawOcr.article_map[legacyPath];
  
  if (!ocrKeys) continue;
  
  let updates = [];
  let highlights = [];
  let currentHighlight = null;

  for (const key of ocrKeys) {
    const ocrData = rawOcr.ocr_data[key];
    const sourceRef = key.split('/').pop();
    
    const blocks = [...ocrData.blocks].sort((a, b) => a.y - b.y);
    
    for (const block of blocks) {
      const text = block.text.replace(/\n/g, ' ').trim();
      if (text.startsWith('温馨提示') || text.startsWith('以下机型不晚于')) break;
      
      const isUpdate = text.startsWith('•新增') || text.startsWith('•优化') || text.startsWith('•修复') || text.startsWith('• 修复') || text.startsWith('• 新增') || text.startsWith('• 优化');
      
      if (isUpdate) {
        if (currentHighlight) {
          highlights.push(currentHighlight);
          currentHighlight = null;
        }
        
        let type = '未标注';
        if (text.includes('新增')) type = '新增';
        else if (text.includes('优化')) type = '优化';
        else if (text.includes('修复')) type = '修复';
        
        let desc = text.replace(/•\s?(新增|优化|修复)\s?/, '').trim();
        updates.push(`    row('系统', '${type}', '${desc}'),`);
      } else {
        if (!text.startsWith('*') && text.length > 3 && !text.includes('Xiaomi') && !text.includes('小米澎湃') && !text.match(/^[0-9:\.]+$/)) {
          if (!currentHighlight) currentHighlight = { texts: [], y: block.y, endY: block.y + block.height, source: sourceRef };
          currentHighlight.texts.push(text);
          currentHighlight.endY = Math.max(currentHighlight.endY, block.y + block.height);
        }
      }
    }
    if (currentHighlight) {
      highlights.push(currentHighlight);
      currentHighlight = null;
    }
  }

  let hCode = '';
  for (const h of highlights) {
    if (h.texts.length < 2) continue;
    const title = h.texts[0].substring(0, 15);
    const desc = h.texts.slice(1).join(' ').substring(0, 50);
    hCode += `    h('模块', '${title}', '${desc}', '${h.source}', ${h.y.toFixed(3)}, ${h.endY.toFixed(3)}, ${h.y.toFixed(3)}, ${(h.endY + 0.1).toFixed(3)}),\n`;
  }
  
  highlightReviewsCode += `  ${id}: [\n${hCode}  ],\n`;
  v4InventoryCode += `  ${id}: [\n${updates.join('\n')}\n  ],\n`;
}

console.log('--- HIGHLIGHT REVIEWS ---\n' + highlightReviewsCode);
console.log('--- V4 INVENTORY ---\n' + v4InventoryCode);
