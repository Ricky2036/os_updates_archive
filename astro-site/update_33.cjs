const fs = require('fs');
let content = fs.readFileSync('scripts/monthly-highlight-reviews.mjs', 'utf8');

const targetStr = "    h('超级小爱', '超级小爱版本升级', '手势快捷记忆上线小米超级岛，支持记忆进度查看。', '0.webp', 0.022, 0.999, 0.022, 0.999),";
const newHighlights = `    h('超级小爱', '超级小爱记忆', '三指上滑，手势快捷记忆。', '0.webp', 0.06, 0.24, 0.06, 0.24),
    h('超级小爱', '超级小爱日程', '可创建地址信息，自定义提醒时间。', '0.webp', 0.24, 0.43, 0.24, 0.43),
    h('超级小爱', '超级小爱发现页', '新增小爱指南，聚合实用功能。', '0.webp', 0.43, 0.60, 0.43, 0.60),
    h('超级小爱', '超级小爱翻译', '词句用法精解。', '0.webp', 0.60, 0.77, 0.60, 0.77),
    h('超级小爱', '超级小爱深度研究', '支持生成网页报告，提炼要点。', '0.webp', 0.77, 0.95, 0.77, 0.95),`;

content = content.replace(targetStr, newHighlights);
fs.writeFileSync('scripts/monthly-highlight-reviews.mjs', content);
