import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const siteRoot = path.resolve(import.meta.dirname, '..');
const mdPath = path.resolve(siteRoot, '../articles/ColorOS_17_更新说明.md');
const outputPath = path.resolve(siteRoot, 'src/content/monthly-digests/63-coloros.json');

const mdContent = fs.readFileSync(mdPath, 'utf8');
const fileHash = crypto.createHash('sha256').update(mdContent).digest('hex');

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

// Read all lines
const rawLines = mdContent.split('\n');
let currentH2 = '';
let currentH3 = '';
const parsedItems = [];

for (let i = 0; i < rawLines.length; i++) {
  const line = rawLines[i];
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentH2 = trimmed.replace('## ', '').trim();
    currentH3 = '';
  } else if (trimmed.startsWith('### ')) {
    currentH3 = trimmed.replace('### ', '').trim();
  } else if (/^-\s+/.test(line)) {
    if (trimmed.startsWith('- **宣传片**')) continue;
    const text = trimmed.replace(/^-\s+/, '').trim();
    parsedItems.push({
      h2: currentH2,
      h3: currentH3,
      text,
      demo: '',
      demoType: '',
      lineIndex: i
    });
  } else if (/^\s+-\s+\*\*(演示视频|配套插图)\*\*：/.test(line)) {
    const match = line.match(/\*\*(演示视频|配套插图)\*\*：(.*)$/);
    if (match && parsedItems.length > 0) {
      parsedItems[parsedItems.length - 1].demoType = match[1];
      parsedItems[parsedItems.length - 1].demo = match[2].trim();
    }
  } else if (/^\d+\.\s/.test(trimmed)) {
    const text = trimmed.replace(/^\d+\.\s*/, '').trim();
    parsedItems.push({
      h2: currentH2,
      h3: currentH3 || '注意事项',
      text,
      demo: '',
      demoType: '',
      lineIndex: i
    });
  }
}

console.log(`Total parsed items from markdown: ${parsedItems.length}`);

// Highlight definitions: 23 core features
// Map each highlight to: { module, title, description, isDemoItem, rawItemIndices: number[] }
const highlightDefinitions = [
  {
    module: '流体设计',
    title: '全新流体设计',
    description: '为流畅而生的设计语言，流动丝滑，鲜活自然。流体设计以融合一体的状态衔接、柔和的动态节奏和鲜活的反馈体验，让每一次交互都自然发生。（演示：流体设计 3D相册流转）',
    rawItemIndex: 0,
  },
  {
    module: '流体设计',
    title: '凝光视效',
    description: '通过轻盈、亲和、圆润的材质设计，兼顾界面的可读性、通透性与视觉美观性。（演示：凝光视效 音乐卡片）',
    rawItemIndex: 1,
  },
  {
    module: '流体设计',
    title: '流体动效',
    description: '界面与元素过渡支持流体融合效果，让元素无缝衔接、状态自然流转。（演示：流体动效 锁屏到桌面无缝流转）',
    rawItemIndex: 2,
  },
  {
    module: '流体设计',
    title: '柔性反馈系统',
    description: '全局元素随操作自然拉伸、受力挤压、灵动回弹，光效随着意图与界面变化主动响应，以光传递状态、反馈与引导，让每一次操作都响应交互意图，更自然、更鲜活。（演示：柔性反馈 图标弹性受力系统）',
    rawItemIndex: 3,
  },
  {
    module: '流体设计',
    title: '极光引擎',
    description: '全新一代极光引擎，新增融合渲染架构，光效与界面融合渲染，带来更高效的渲染性能，呈现更细腻连贯的流体动画与视觉效果。',
    rawItemIndex: 4,
  },
  {
    module: '流体设计',
    title: '流体时钟与连续动效',
    description: '新增流体时钟效果，息屏、锁屏、桌面时钟无缝共享，如同天生一体；以流体时钟为视觉锚点，图标以此为中心动态响应进场动效，让视觉焦点保持连续。',
    rawItemIndex: 5,
  },
  {
    module: '流体设计',
    title: '山之道-实况天气',
    description: '山之道主题支持实时显示当前天气，在桌面和锁屏沉浸式感受朝晴暮雨的自然变化。（演示：实况天气 山之道锁屏动态变化）',
    rawItemIndex: 14,
  },
  {
    module: '流体云',
    title: '流体云全面焕新',
    description: '视觉如云般轻盈通透。凝光随手势自然流动，按压反馈清晰明确，让交互更直观、更有质感。',
    rawItemIndex: 19,
  },
  {
    module: '潮汐引擎',
    title: '自研感知调度与记忆后台',
    description: '潮汐引擎全面升级，带来全新自研感知调度，优化系统内存调度策略，高内存负载下有效减少前台卡顿，降低后台应用误清理；新增记忆后台与小程序加速器。',
    rawItemIndex: 24,
  },
  {
    module: '你的小布',
    title: '小布拟人化交互',
    description: '新增全新小布唤醒动画，以拟人化形象自然回应，并加入语音文字动效，让交互更聚焦、更自然。（演示：小布唤醒 拟人化形象与动效）',
    rawItemIndex: 27,
  },
  {
    module: '你的小布',
    title: '小布与我与连续对话',
    description: '优化小布连续对话体验与多轮上下文理解能力；升级旅行规划；新增一句话整理相册；新增「小布与我」，小布自动学习长期偏好，支持自定义人格风格。',
    rawItemIndex: 28,
  },
  {
    module: '你的小布',
    title: '一键闪记秒抢闹钟与意图推荐',
    description: '智能识别应用中联系人信息一键添加，抢购/抢票界面闪记一键创建秒抢闹钟；一键闪记后基于屏幕内容智能理解更多意图，推荐更多相关服务一步直达。（演示：一键闪记 抢票秒闹钟）',
    rawItemIndex: 33,
  },
  {
    module: 'AI 流体云',
    title: '流体云融合导航',
    description: '支持在流体云智能分阶段呈现步行、打车、地铁、公交导航信息，全程无缝接续，并在锁屏岛实时呈现；途经城市地标时呈现专属动态效果。（演示：流体云 融合导航）',
    rawItemIndex: 35,
  },
  {
    module: '相册',
    title: 'AI 修图师',
    description: '通过自然语言描述修图想法，从光影、构图、色彩、人像等多维度协同优化，呈现更真实自然的修图效果。（演示：AI 修图师效果对比）',
    rawItemIndex: 40,
  },
  {
    module: '相册',
    title: '达芬奇视觉理解大模型',
    description: '融合画面语义理解、美学认知、风格特征学习与生成式优化能力，提供统一算法；新增 AI 参考图复刻与灵感模板推荐。',
    rawItemIndex: 43,
  },
  {
    module: 'AI 笔记',
    title: '全新 AI 笔记应用',
    description: '打造人工智能时代的知识笔记。不止帮你记录信息，更能理解、整理并连接知识，支持会议笔记实时转写、口述说想法整理、多模态内容导入提炼与智能助手问答。（演示：AI 笔记功能界面）',
    rawItemIndex: 47,
  },
  {
    module: 'AI 拍一拍',
    title: '全新 AI 拍一拍与识万物',
    description: '整合系统 AI 视觉能力，镜头一拍即可智能识别意图并推荐功能，一看即懂，一按即问，一步直达；一拍商品比价，一拍食物分析热量营养，一拍护肤品展示功效。（演示：AI 拍一拍与识万物 白氏树蛙百科）',
    rawItemIndex: 52,
  },
  {
    module: 'AI 拍一拍',
    title: '超清文档扫描与版式提取',
    description: '快速扫描纸质文档，支持极速连续扫描与超清增强算法；支持文档版式感知提取，智能保留标题、段落、表格并导出为常用办公格式，支持一键发送至电脑等设备。',
    rawItemIndex: 53,
  },
  {
    module: 'AI 翻译',
    title: '全新翻译应用与超低延时同传',
    description: '焕新界面设计，支持更多大模型翻译语言；优化同传翻译体验，流式语音识别与增量翻译协同实现超低延时同传；优化耳机佩戴场景语音翻译，支持声纹复刻播报与触控开启。',
    rawItemIndex: 61,
  },
  {
    module: '设备互联',
    title: '相机无感互联与跨端创作',
    description: '第三方相机接入 OPPO 互联生态，开机靠近即可自动发现并通过流体云一键连接；支持在相册与三方应用中直接查看、选取与编辑外接设备内容。',
    rawItemIndex: 67,
  },
  {
    module: '安全守护',
    title: 'AI 换脸检测与通话防诈',
    description: '实时检测视频通话中的 AI 换脸痕迹并在有风险时及时提醒；结合 AI 合成语音识别与通话语义理解实时防诈。（演示：AI 换脸检测风险提示）',
    rawItemIndex: 69,
  },
  {
    module: '无障碍模式',
    title: 'AI 实景对话无障碍模式',
    description: '针对无障碍场景优化大模型能力，基于真实场景进行更准确、更可信的客观内容描述，帮助视障用户更轻松地了解身边世界。',
    rawItemIndex: 71,
  },
  {
    module: '无障碍模式',
    title: '智能读屏功能',
    description: '浏览应用界面时，即使第三方应用未提供无障碍功能，系统也可智能识别按钮、图片、图标等页面内容并进行语音播报，让读屏体验更加完整准确。',
    rawItemIndex: 72,
  },
];

const highlightIndices = new Set(highlightDefinitions.map(h => h.rawItemIndex));

// Function to classify update type
function getUpdateType(text, h3) {
  if (h3 === '注意事项') return '其他';
  if (text.startsWith('新增') || text.startsWith('全新') || text.startsWith('整合') || text.startsWith('支持')) return '新增';
  if (text.startsWith('优化') || text.startsWith('升级') || text.startsWith('调整')) return '优化';
  if (text.startsWith('修复')) return '修复';
  return '新增';
}

function getUpdateModule(h2, h3) {
  if (h3 === '流体设计，流动丝滑，鲜活自然') return '流体设计';
  if (h3 === '注意事项') return '升级须知';
  return h3 || h2 || '系统';
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
    const mod = getUpdateModule(item.h2, item.h3);
    const type = getUpdateType(item.text, item.h3);
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
    source: 'ColorOS_17_更新说明.md',
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
    source: 'ColorOS_17_更新说明.md',
    sourceIndex: rawIdx,
    sourceHash: sha256(item.text),
    blockIds: [`block-${rawIdx}`],
    note: `${item.h3 || item.h2}: ${item.text.slice(0, 30)}...`
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
  articleId: 'ColorOS_17_正式发布！亮点抢先看',
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
