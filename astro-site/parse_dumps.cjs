const fs = require('fs');
const files = ['dump_31.txt', 'dump_32.txt', 'dump_33.txt', 'dump_34.txt', 'dump_35.txt'];

for (const file of files) {
  const id = file.match(/\d+/)[0];
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n').filter(l => l.includes('[Y:'));
  
  let currentModule = '';
  let highlights = [];
  let updates = [];
  
  // We need basic heuristic
  // In HyperOS, Highlights usually have big titles before the bullet points.
  // Updates are under "更多体验优化" or module names like "笔记", "录音机"
  
  console.log(`\n// ID: ${id}`);
  for (const line of lines) {
    const match = line.match(/\[Y: ([\d\.]+), H: ([\d\.]+)\] (.*)/);
    if (!match) continue;
    const [_, y, h, text] = match;
    
    if (text.startsWith('温馨提示')) break;
    
    // Updates
    if (text.startsWith('•新增') || text.startsWith('•优化') || text.startsWith('• 修复') || text.startsWith('•修复')) {
       let type = '未标注';
       if (text.includes('新增')) type = '新增';
       else if (text.includes('优化')) type = '优化';
       else if (text.includes('修复')) type = '修复';
       
       let desc = text.replace(/•\s?(新增|优化|修复)\s?/, '').trim();
       updates.push(`      u('${currentModule || '系统'}', '${type}', '${desc}'),`);
    } 
    else if (!text.startsWith('*') && text.length < 15 && !text.includes('Xiaomi')) {
       // Might be a module title
       currentModule = text;
    }
  }
  
  console.log(`  ${id}: {`);
  console.log(`    highlights: [\n      // TODO: manually add highlights\n    ],`);
  console.log(`    updates: [\n${updates.join('\n')}\n    ]`);
  console.log(`  },`);
}
