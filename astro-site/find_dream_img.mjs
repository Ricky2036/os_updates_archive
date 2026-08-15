import fs from 'fs';

const html = fs.readFileSync('wechat_article_content.html', 'utf-8');
const idx = html.indexOf('新材质：');
console.log("Snippet around 新材质：");
console.log(html.substring(idx - 200, idx + 2500));
