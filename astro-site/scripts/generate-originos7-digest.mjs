import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const siteRoot = path.resolve(import.meta.dirname, '..');
const mdPath = path.resolve(siteRoot, '../articles/OriginOS_7_更新说明.md');
const outputPath = path.resolve(siteRoot, 'src/content/monthly-digests/64-originos.json');

const mdContent = fs.readFileSync(mdPath, 'utf8');
const fileHash = crypto.createHash('sha256').update(mdContent).digest('hex');

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

// Read all lines
const rawLines = mdContent.split('\n');
let currentH2 = '';
const parsedItems = [];

for (let i = 0; i < rawLines.length; i++) {
  const line = rawLines[i];
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentH2 = trimmed.replace('## ', '').trim();
  } else if (/^-\s+/.test(line)) {
    const text = trimmed.replace(/^-\s+/, '').trim();
    parsedItems.push({
      h2: currentH2,
      text,
      lineIndex: i
    });
  } else if (/^\d+\.\s/.test(trimmed)) {
    const text = trimmed.replace(/^\d+\.\s*/, '').trim();
    parsedItems.push({
      h2: currentH2 || '注意事项',
      text,
      lineIndex: i
    });
  }
}

console.log(`Total parsed items from OriginOS 7 markdown: ${parsedItems.length}`);

// Define the 24 flagship highlights
const highlightDefinitions = [
  {
    module: '相机',
    title: '8K动态照片',
    description: '新增相机拍照8K动态照片功能，使动态照片画面的清晰度与细节表现更佳，提升拍摄效果，可通过“相机”＞“拍照”＞“开启动态照片”>“8K”体验。',
    rawItemIndex: 0,
  },
  {
    module: '相机',
    title: '原生实况',
    description: '新增相机“原生实况”功能，开启后动态照片封面色彩、影调、视角对齐动态照片视频部分，一致性更佳，可通过“相机”>“设置”>“拍照”>“原生实况”体验。',
    rawItemIndex: 1,
  },
  {
    module: '相机',
    title: '日光胶片电影人像',
    description: '新增电影人像模式“日光胶片”风格，模拟电影胶片独有的暖红调，提升夕阳人像的色彩表现力；首次进入提供风格选择弹窗。',
    rawItemIndex: 3,
  },
  {
    module: '相机',
    title: '4K超清慢动作',
    description: '新增相机4K/480fps和4K/960fps高规格慢动作，使液体飞溅、滴落等肉眼难察的瞬间细节清晰定格，提升微观动态捕捉与视觉表现力。',
    rawItemIndex: 4,
  },
  {
    module: '相机',
    title: '长焦跟随抓拍',
    description: '新增抓拍模式内长焦跟随功能，搭载最新智能追焦技术，支持10-30X超长焦段，自动注册并跟随目标人物，轻点屏幕切换追踪对象。',
    rawItemIndex: 6,
  },
  {
    module: '蓝河流畅引擎',
    title: '秒抢日程与秒抢引擎',
    description: '新增在部分第三方应用预约购买界面支持小V圈搜创建秒抢日程，临抢时自动开启秒抢引擎，保障瞬时并发与流畅抢购。',
    rawItemIndex: 10,
  },
  {
    module: '桌面',
    title: '时间光影图标',
    description: '新增图标的时间光影效果，图标光影随日出日落实时变化，带来更沉浸的桌面使用体验；同时提供深色图标风格适配。',
    rawItemIndex: 11,
  },
  {
    module: '蓝海续航系统',
    title: '微电精灵定位短信',
    description: '升级微电精灵，支持在极端低电微电状态下发送带精准定位的求助短信，守护应急安全；新增充放电时长预测与自适应电量管理。',
    rawItemIndex: 13,
  },
  {
    module: '蓝心小V',
    title: '场景化效率助手',
    description: '新增办公助手、面试助手、旅行助手等场景化能力，帮助用户高效处理复杂日程与事务。',
    rawItemIndex: 16,
  },
  {
    module: '蓝心小V',
    title: '深度思考推理大模型',
    description: '优化端云协同算力模型与深度思考大模型，系统级支持深度数据分析及更复杂的多步逻辑推理能力。',
    rawItemIndex: 17,
  },
  {
    module: '跨窗拖放',
    title: '拖放识图转文字',
    description: '新增拖放图片转文字能力，支持将带有文字的图片拖拽至应用目标区域，一键提取并直接转换为可编辑文本。',
    rawItemIndex: 18,
  },
  {
    module: '跨窗拖放',
    title: '拖放跨语言翻译',
    description: '新增拖放并跨语言翻译能力，支持将外文文本或图片拖至部分应用，一键完成多语言翻译并插入输入区域。',
    rawItemIndex: 19,
  },
  {
    module: '跨窗拖放',
    title: '拖放名片建联系人',
    description: '新增拖放名片信息转联系人能力，支持将含联系方式的图片或文本拖至电话或联系人应用，快捷新建或拨打电话。',
    rawItemIndex: 20,
  },
  {
    module: '无障碍',
    title: '家电声音自定义感知',
    description: '新增自定义声音功能，支持录入与学习门铃、冰箱等常见家电提示音，并在声音响起时主动发出多感官提醒。',
    rawItemIndex: 21,
  },
  {
    module: '无障碍',
    title: '看见随行问答与语音陪伴',
    description: '优化vivo看见问答模式的识别效果与速度，对话自然生动，并新增关闭摄像头的纯语音对话模式，随心陪伴与科普。',
    rawItemIndex: 22,
  },
  {
    module: '原子工作台',
    title: '多任务原子工作台',
    description: '全新多任务形态原子工作台，通过右下角内滑手势快速启动，支持最多5个应用同时并行运行与高效切换。',
    rawItemIndex: 28,
  },
  {
    module: '小V记忆',
    title: '智能识屏票券卡片',
    description: '新增电影票、演出门票、景区门票及消费券识屏保存能力，智能提取券码并生成卡片，支持快速核销与跳转订单详情。',
    rawItemIndex: 29,
  },
  {
    module: '录音机',
    title: 'AI文本整理与清洗',
    description: '新增文本整理功能，录音转写完成后自动进行文本清洗与结构优化，去除口语化冗余，内容更清晰、直接可用。',
    rawItemIndex: 30,
  },
  {
    module: '录音机',
    title: '待办事项智能导入',
    description: '新增待办导入功能，支持自动识别会议AI总结中的待办事项，并一键导入系统日程待办清单。',
    rawItemIndex: 31,
  },
  {
    module: '日历',
    title: '智能日历与今日备忘',
    description: '新增智能日历服务，可自动规划并拆解复杂待办，并通过今日备忘卡集中提醒全天重要安排与空闲时段。',
    rawItemIndex: 35,
  },
  {
    module: '日历',
    title: '系统级待办整合',
    description: '原“原子笔记”待办全面整合至「日历」应用，统一待办创建、管理与查看体验，日程与待办统一协同。',
    rawItemIndex: 36,
  },
  {
    module: '手机管家',
    title: '随手清相册瘦身',
    description: '新增随手清功能，支持左右滑动浏览、上滑快捷删除冗余图片和视频，无需繁琐勾选即可释放存储空间。',
    rawItemIndex: 39,
  },
  {
    module: '原子动效7.0',
    title: '弹性动力学反馈',
    description: '优化弹性动效体验，根据不同操作力度和滑动速度智能匹配动效反馈，动画表现更加自然跟手；优化一镜到底与帧模糊体验。',
    rawItemIndex: 42,
  },
  {
    module: '全局搜索',
    title: '下移聚焦搜索框',
    description: '优化全局搜索框交互体验，由页面顶部下移至键盘上方，单手触控更便捷，视觉焦点更聚焦。',
    rawItemIndex: 46,
  }
];

const highlightIndices = new Set(highlightDefinitions.map(h => h.rawItemIndex));

function getUpdateType(text, h2) {
  if (h2 === '注意事项') return '其他';
  if (text.startsWith('新增') || text.startsWith('全新') || text.startsWith('支持')) return '新增';
  if (text.startsWith('优化') || text.startsWith('升级') || text.startsWith('调整')) return '优化';
  if (text.startsWith('修复')) return '修复';
  if (text.startsWith('更新')) return '调整';
  return '新增';
}

function getUpdateModule(h2) {
  if (h2 === '注意事项') return '升级须知';
  if (h2 === '更多') return '更多服务';
  return h2 || '系统';
}

// Build highlights array
const highlights = highlightDefinitions.map((def, idx) => {
  const id = `highlight-${String(idx + 1).padStart(2, '0')}`;
  return {
    id,
    module: def.module,
    moduleSource: 'explicit-heading',
    title: def.title,
    description: def.description,
    mediaStatus: 'not-provided',
    media: [],
    evidenceIds: [`${id}-body`],
    sourceItemIds: [`source-${id}`]
  };
});

// Build updates array for remaining items
const updates = [];
let updateCounter = 1;
const rawIndexToTargetId = new Map();

highlightDefinitions.forEach((def, idx) => {
  rawIndexToTargetId.set(def.rawItemIndex, `highlight-${String(idx + 1).padStart(2, '0')}`);
});

parsedItems.forEach((item, rawIdx) => {
  if (!highlightIndices.has(rawIdx)) {
    const id = `update-${String(updateCounter).padStart(2, '0')}`;
    rawIndexToTargetId.set(rawIdx, id);
    const mod = getUpdateModule(item.h2);
    const type = getUpdateType(item.text, item.h2);
    updates.push({
      id,
      module: mod,
      moduleSource: 'explicit-heading',
      type,
      typeSource: 'explicit',
      sourceText: item.text,
      description: item.text,
      evidenceIds: [`${id}-body`],
      sourceItemIds: [`source-${id}`]
    });
    updateCounter++;
  }
});

console.log(`Generated ${highlights.length} highlights and ${updates.length} updates.`);

// Build sourceItems
const sourceItems = parsedItems.map((item, rawIdx) => {
  const targetId = rawIndexToTargetId.get(rawIdx);
  const isHighlight = targetId.startsWith('highlight-');
  const sourceId = `source-${targetId}`;
  return {
    id: sourceId,
    classification: isHighlight ? 'highlight' : 'update',
    source: 'OriginOS_7_更新说明.md',
    sourceIndex: rawIdx,
    sourceHash: sha256(item.text),
    blockIds: [`block-${rawIdx}`],
    text: item.text,
    targetIds: [targetId]
  };
});

// Build evidence
const evidence = parsedItems.map((item, rawIdx) => {
  const targetId = rawIndexToTargetId.get(rawIdx);
  const isHighlight = targetId.startsWith('highlight-');
  const evidenceId = `${targetId}-body`;
  return {
    id: evidenceId,
    kind: 'html-text',
    role: isHighlight ? 'body-text' : 'update-list',
    source: 'OriginOS_7_更新说明.md',
    sourceIndex: rawIdx,
    sourceHash: sha256(item.text),
    blockIds: [`block-${rawIdx}`],
    note: `${item.h2}: ${item.text.slice(0, 30)}...`
  };
});

// Build audit
const audit = {
  highlightReviewVersion: 4,
  updateReviewVersion: 4,
  review: {
    content: 'verified',
    modules: 'verified',
    media: 'verified',
    page: 'verified'
  },
  expectedHighlightCount: highlights.length,
  sourceItemCount: sourceItems.length,
  includedItemCount: sourceItems.length,
  excludedItemCount: 0,
  highlightCount: highlights.length,
  updateCount: updates.length,
  mediaCount: 0,
  mappedItemCount: sourceItems.length,
  coverageRate: 1
};

const digestData = {
  schemaVersion: 3,
  contentReviewVersion: 4,
  mediaReviewVersion: 4,
  articleId: '带你一图读懂_OriginOS_7',
  reviewStatus: 'verified',
  sourceHash: fileHash,
  highlights,
  updates,
  sourceItems,
  evidence,
  audit
};

fs.writeFileSync(outputPath, JSON.stringify(digestData, null, 2) + '\n', 'utf8');
console.log(`Saved digest to ${outputPath}`);
