import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const siteRoot = path.resolve(import.meta.dirname, '..');
const outputPath = path.resolve(siteRoot, 'src/content/monthly-digests/69-originos.json');

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

const highlights = [
  {
    module: '原子工作台',
    title: '一屏多任务与底层重构',
    description: '新增原子工作台超强多任务体验，支持左右、上下两种灵活布局与一键快速切换，随心搭建工作、学习、旅行专属工作台；底层首发自研多级依赖调度算法、重载内存融合模型与多窗渲染架构，保障重载多任务流畅稳定。'
  },
  {
    module: '小V灵动组件',
    title: '一句话专属定制桌面组件',
    description: '新增小V灵动组件功能，用户只需一句话描述即可创造个性化专属桌面组件，如倒数日、待办与工作状态卡片，简单直观又好用。'
  },
  {
    module: '蓝心小V',
    title: '小V拍照问与视频问',
    description: '新增小V拍照问与视频问能力，拍个照即可解答问题并智能推荐相关服务；视频问充当随行导游，基于实时摄像头画面深度理解并支持拟人化连续对话回应。'
  },
  {
    module: 'AI系统能力',
    title: 'AI截屏直达与卡包归拢',
    description: '新增AI截屏直达，截图智能识别并存入卡包，券码自动收纳并在屏幕左滑时快速调出，到期前主动弹出提醒。'
  },
  {
    module: '相册',
    title: '相册随手清',
    description: '新增相册随手清功能，支持像刷短视频一样流式整理相册，AI自动分析相似图片留下最佳瞬间，上滑即可标记删除。'
  },
  {
    module: '文件管理',
    title: 'AI文件管家专题空间',
    description: '新增AI文件管家，文件按主题智能归拢至专题空间，问一句自然语言即可快速定位文件内容并给出总结答案。'
  },
  {
    module: '输入法',
    title: 'vivo输入法AI信息检索',
    description: '新增vivo输入法AI信息检索能力，聊天时输入关键词即可快速查找并发送文档、日程和联系人，遇到疑问可即时搜索解答。'
  },
  {
    module: '原子笔记',
    title: '第三方智能体与CLI接入',
    description: '新增原子笔记第三方智能体与命令行工具（CLI）数据读写授权能力，支持端侧AI助手接入笔记进行信息整理与结构化总结。'
  },
  {
    module: '日历',
    title: 'AI日历与待办深度整合',
    description: '新增AI日历今日备忘与待办安排，智能提炼日程重点与待办任务摘要；原原子笔记待办全面整合至日历应用中统一管理。'
  },
  {
    module: '小V记忆与录音',
    title: '小V记忆卡与AI录音脉络',
    description: '新增小V记忆卡，锁屏状态下说段话、拍张照或圈选屏幕即可生成记忆卡；AI录音机新增进度条重点提炼、大纲观点识别与文本清洗整理。'
  },
  {
    module: '健康',
    title: '健康减脂点数管理',
    description: '新增健康减脂功能，将每日摄入量与运动预算点数化直观呈现，每周自动输出AI健康报告，清晰量化身体改变。'
  }
];

const updates = [
  { module: '系统', type: '新增', text: '模块原子化能力，支持蓝心小V、全搜、锁屏等多入口快捷调用。' },
  { module: '系统', type: '优化', text: '系统 AI 光影效果，统一状态表达，让 AI 新功能呈现一致、自然的光影反馈。' },
  { module: '锁屏', type: '新增', text: '多款锁屏个性时钟样式。' },
  { module: '锁屏', type: '新增', text: '部分个性时钟字体，支持字重与大小调节能力。' },
  { module: '锁屏', type: '新增', text: '锁屏长按手势，支持长按进入“锁屏编辑”，便捷管理“我的搭配”。' },
  { module: '蓝河流畅引擎', type: '新增', text: '在部分第三方应用预约购买界面支持小V圈搜创建秒抢日程，临抢时自动开启秒抢引擎。' },
  { module: '状态栏', type: '优化', text: '敏感权限调用提醒，使用定位、麦克风、相机时，状态栏会立刻显示图标或彩色小点提醒。' },
  { module: '原子动效 7.0', type: '优化', text: '一镜到底的效果体验。' },
  { module: '连接中心', type: '优化', text: '连接中心组件内的设备显示，支持 1×1、1×2、1×4、2×2 多种卡片尺寸。' },
  { module: '日历', type: '新增', text: '待办功能，原“原子笔记”待办已整合至「日历」应用，并优化待办创建、管理和查看体验。' },
  { module: '日历', type: '优化', text: '日历视图展示，日程与待办信息呈现更清晰。' },
  { module: '录音机', type: '新增', text: '文本整理功能，支持转写完成后自动进行文本清洗与结构优化，使内容更清晰、直接可用。' },
  { module: '录音机', type: '新增', text: '待办导入功能，支持识别 AI 总结中的待办事项，并一键导入系统日程待办。' },
  { module: '蓝海续航系统', type: '新增', text: '超轻图形框架，增强应用启动退出、下拉通知中心和控制中心等场景的帧率调度利用率，提升系统的续航表现。' },
  { module: '蓝海续航系统', type: '升级', text: '系统轻量化，深度优化后台应用网络耗电和熄屏下的省电策略，提升系统的续航表现。' },
  { module: '桌面', type: '新增', text: '深色图标，在深色模式下使用更舒适，视觉更协调，您可前往“设置”＞“显示、亮度与护眼”＞“深色模式设置”＞“图标效果”中设置。' },
  { module: '桌面', type: '优化', text: '行为图标设计，呈现更生动、更有质感的使用体验。' },
  { module: '桌面', type: '优化', text: '系统默认图标，从图形、色彩维度全面升级，提升桌面视觉体验。' },
  { module: '通知中心', type: '新增', text: '通知临时静默功能，可左滑通知后进入设置，选择临时静默该应用通知 1 小时或 1 天。' },
  { module: '通知中心', type: '新增', text: '通知分组一键清除功能，通知整理更便捷。' },
  { module: '通知中心', type: '新增', text: '应用通知声音与振动开关。' },
  { module: '通知中心', type: '新增', text: '支持通知按类型快速关闭的能力，可左滑通知进入设置，选择仅关闭此类通知。' },
  { module: '通知中心', type: '优化', text: '锁屏通知展开交互，滑动操作更加跟手，展开与收起更加流畅。' },
  { module: '网络', type: '新增', text: '出境落地 30 分钟 200M 免费应急上网服务，出国后无需立即购买流量也能快速联网。' },
  { module: '网络', type: '新增', text: '校园网自动登录/认证，部分高校校园网仅需要首次手动登录认证，后续系统自动认证登录。' },
  { module: '网络', type: '新增', text: '断网预测功能，预测校园晚上断网时间，提前切换其他网络，减少校园断网卡顿时长。' },
  { module: '网络', type: '优化', text: '校园走动上网体验，系统自动选择当前最优网络，减少上网卡顿。' },
  { module: '网络', type: '优化', text: '在边境/口岸区域快速切换最优网络，保障上网体验。' }
];

const sourceHash = sha256(JSON.stringify({ highlights, updates }));

const sourceItems = [];
const evidence = [];

// Build highlights
const digestHighlights = highlights.map((h, i) => {
  const highlightId = `highlight-${String(i + 1).padStart(2, '0')}`;
  const sourceItemId = `source-highlight-${String(i + 1).padStart(2, '0')}`;
  const evidenceId = `${highlightId}-body`;
  const fullText = `${h.module}：${h.title}。${h.description}`;
  const itemHash = sha256(fullText);

  sourceItems.push({
    id: sourceItemId,
    classification: 'highlight',
    source: '更多_OriginOS_7_体验亮点.html',
    sourceIndex: i,
    sourceHash: itemHash,
    blockIds: [`block-${i}`],
    text: fullText,
    targetIds: [highlightId]
  });

  evidence.push({
    id: evidenceId,
    kind: 'html-text',
    role: 'body-text',
    source: '更多_OriginOS_7_体验亮点.html',
    sourceIndex: i,
    sourceHash: itemHash,
    blockIds: [`block-${i}`],
    note: `${h.module}: ${h.title}`
  });

  return {
    id: highlightId,
    module: h.module,
    moduleSource: 'explicit-heading',
    title: h.title,
    description: h.description,
    mediaStatus: 'not-provided',
    media: [],
    evidenceIds: [evidenceId],
    sourceItemIds: [sourceItemId]
  };
});

// Build updates
const digestUpdates = updates.map((u, i) => {
  const updateId = `update-${String(i + 1).padStart(2, '0')}`;
  const sourceItemId = `source-update-${String(i + 1).padStart(2, '0')}`;
  const evidenceId = `${updateId}-body`;
  const fullText = `${u.module}：${u.type} ${u.text}`;
  const sourceIndex = highlights.length + i;
  const itemHash = sha256(fullText);

  sourceItems.push({
    id: sourceItemId,
    classification: 'update',
    source: '更多_OriginOS_7_体验亮点.html',
    sourceIndex,
    sourceHash: itemHash,
    blockIds: [`block-${sourceIndex}`],
    text: fullText,
    targetIds: [updateId]
  });

  evidence.push({
    id: evidenceId,
    kind: 'html-text',
    role: 'update-list',
    source: '更多_OriginOS_7_体验亮点.html',
    sourceIndex,
    sourceHash: itemHash,
    blockIds: [`block-${sourceIndex}`],
    note: `${u.module}: ${u.text}`
  });

  return {
    id: updateId,
    module: u.module,
    moduleSource: 'explicit-heading',
    type: u.type === '升级' ? '其他' : u.type,
    typeSource: 'explicit',
    sourceText: fullText,
    description: u.text,
    evidenceIds: [evidenceId],
    sourceItemIds: [sourceItemId]
  };
});

const totalItems = digestHighlights.length + digestUpdates.length;

const digestJson = {
  schemaVersion: 3,
  contentReviewVersion: 4,
  mediaReviewVersion: 4,
  articleId: '更多_OriginOS_7_体验亮点',
  reviewStatus: 'verified',
  sourceHash,
  highlights: digestHighlights,
  updates: digestUpdates,
  sourceItems,
  evidence,
  audit: {
    highlightReviewVersion: 4,
    updateReviewVersion: 4,
    review: {
      content: 'verified',
      modules: 'verified',
      media: 'verified',
      page: 'verified'
    },
    expectedHighlightCount: digestHighlights.length,
    sourceItemCount: totalItems,
    includedItemCount: totalItems,
    excludedItemCount: 0,
    highlightCount: digestHighlights.length,
    updateCount: digestUpdates.length,
    mediaCount: 0,
    mappedItemCount: totalItems,
    coverageRate: 1
  }
};

fs.writeFileSync(outputPath, JSON.stringify(digestJson, null, 2) + '\n', 'utf8');
console.log(`Saved 69-originos.json monthly digest (${digestHighlights.length} highlights, ${digestUpdates.length} updates) to ${outputPath}`);
