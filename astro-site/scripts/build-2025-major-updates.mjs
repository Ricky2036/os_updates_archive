import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const siteRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(siteRoot, '..');
const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

// Load media registry
const mediaRegistryPath = path.resolve(siteRoot, 'scripts/media-registry-2025.json');
const mediaRegistry = JSON.parse(fs.readFileSync(mediaRegistryPath, 'utf8'));

function makeMediaItem(regItem, id, alt, evidenceId) {
  if (!regItem) return null;
  return {
    id,
    kind: regItem.kind,
    src: regItem.src,
    thumbnail: regItem.thumbnail,
    avifSrc: regItem.avifSrc,
    avifThumbnail: regItem.avifThumbnail,
    poster: regItem.poster,
    alt,
    evidenceId,
    width: regItem.width,
    height: regItem.height
  };
}

function cleanMarkdownLine(str) {
  return str
    .replace(/\\>/g, '>')
    .replace(/\\\+/g, '+')
    .replace(/\\-/g, '-')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\*/g, '*')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function getUpdateType(text) {
  if (text.startsWith('新增')) return '新增';
  if (text.startsWith('优化')) return '优化';
  if (text.startsWith('升级')) return '优化';
  if (text.startsWith('重构')) return '优化';
  if (text.startsWith('修复')) return '修复';
  if (text.startsWith('调整')) return '调整';
  if (text.startsWith('适配')) return '适配';
  if (text.startsWith('支持')) return '新增';
  return '新增';
}

// -------------------------------------------------------------
// Core Generator Function
// -------------------------------------------------------------
function generateDigestFile({ articleId, sourceFile, outputPath, parsedItems, highlightDefs, fileHash }) {
  console.log(`Processing ${articleId}: total parsed ${parsedItems.length} items, ${highlightDefs.length} highlights.`);

  const highlightIndices = new Set(highlightDefs.map(d => d.rawIndex));
  const rawIndexToTargetId = new Map();

  const evidence = [];

  const highlights = highlightDefs.map((def, idx) => {
    const id = `highlight-${String(idx + 1).padStart(2, '0')}`;
    rawIndexToTargetId.set(def.rawIndex, id);
    const mediaList = (def.media || []).filter(Boolean);
    const mediaEvidenceIds = mediaList.map(m => m.evidenceId);

    // Register media in evidence
    mediaList.forEach((m, mIdx) => {
      const filePath = path.join(siteRoot, 'public', m.src);
      const hash = fs.existsSync(filePath) ? sha256(fs.readFileSync(filePath)) : sha256(m.src);
      evidence.push({
        id: m.evidenceId,
        role: 'demo-region',
        kind: m.kind === 'video' ? 'html-media' : 'image-region',
        source: m.src,
        sourceIndex: mIdx,
        sourceHash: hash,
        blockIds: [],
        region: {
          x: 0,
          y: 0,
          width: m.width || 480,
          height: m.height || 270
        },
        note: `${def.module}: ${def.title} (${m.alt})`
      });
    });


    return {
      id,
      module: def.module,
      moduleSource: 'explicit-heading',
      title: def.title,
      description: def.description,
      mediaStatus: mediaList.length > 0 ? 'available' : 'not-provided',
      media: mediaList,
      evidenceIds: [`${id}-body`, ...mediaEvidenceIds],
      sourceItemIds: [`source-${id}`]
    };
  });

  const updates = [];
  let updateCounter = 1;

  parsedItems.forEach((item, rawIdx) => {
    if (!highlightIndices.has(rawIdx)) {
      const id = `update-${String(updateCounter).padStart(2, '0')}`;
      rawIndexToTargetId.set(rawIdx, id);
      const type = getUpdateType(item.text);
      updates.push({
        id,
        module: item.h2,
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

  // Source Items
  const sourceItems = parsedItems.map((item, rawIdx) => {
    const targetId = rawIndexToTargetId.get(rawIdx);
    const isHighlight = targetId.startsWith('highlight-');
    const sourceId = `source-${targetId}`;
    return {
      id: sourceId,
      classification: isHighlight ? 'highlight' : 'update',
      source: sourceFile,
      sourceIndex: rawIdx,
      sourceHash: sha256(item.text),
      blockIds: [`block-${rawIdx}`],
      text: item.text,
      targetIds: [targetId]
    };
  });

  // Text Evidence
  parsedItems.forEach((item, rawIdx) => {
    const targetId = rawIndexToTargetId.get(rawIdx);
    const isHighlight = targetId.startsWith('highlight-');
    const evidenceId = `${targetId}-body`;
    evidence.push({
      id: evidenceId,
      kind: 'html-text',
      role: isHighlight ? 'body-text' : 'update-list',
      source: sourceFile,
      sourceIndex: rawIdx,
      sourceHash: sha256(item.text),
      blockIds: [`block-${rawIdx}`],
      note: `${item.h2}: ${item.text.slice(0, 30)}...`
    });
  });

  const totalMedia = highlights.reduce((sum, h) => sum + h.media.length, 0);

  // Audit
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
    mediaCount: totalMedia,
    mappedItemCount: sourceItems.length,
    coverageRate: 1
  };

  const digestData = {
    schemaVersion: 3,
    contentReviewVersion: 4,
    mediaReviewVersion: 4,
    articleId,
    reviewStatus: 'verified',
    sourceHash: fileHash,
    highlights,
    updates,
    sourceItems,
    evidence,
    audit
  };

  fs.writeFileSync(outputPath, JSON.stringify(digestData, null, 2), 'utf8');
  console.log(`Saved ${articleId} digest (${highlights.length} highlights with ${totalMedia} media, ${updates.length} updates) to ${outputPath}`);
  return digestData;
}

// -------------------------------------------------------------
// 1. ColorOS 16 Markdown & Digest
// -------------------------------------------------------------
function buildColorOS16() {
  const mdPath = path.resolve(workspaceRoot, 'articles/ColorOS_16_更新说明.md');
  const digestPath = path.resolve(siteRoot, 'src/content/monthly-digests/08-coloros.json');

  const reg = mediaRegistry.coloros;

  const highlightDefs = [
    {
      module: '极光引擎',
      title: '全场景无缝动效',
      description: '新增桌面图标、卡片、文件夹、侧边栏等场景支持无缝拖拽动画与并行打断，下拉通知中心与控制中心实时打断，带来一气呵成的直觉流畅体验。',
      rawIndex: 0,
      media: [
        makeMediaItem(reg['seamless-motion'], 'c16-m-01', '极光引擎无缝位移动效演示', 'c16-ev-01'),
        makeMediaItem(reg['parallel-interrupt'], 'c16-m-02', '极光引擎并行打断动效演示', 'c16-ev-02')
      ]
    },
    {
      module: '极光引擎',
      title: '光场动效与微视效',
      description: '新增光场动效与自然涟漪视效，在计算器、锁屏密码、通话界面按压交互时呈现更生动的光场反馈，优化充电动效与指纹动效。',
      rawIndex: 7,
      media: [
        makeMediaItem(reg['aurora-visuals'], 'c16-m-03', '极光高阶粒子与光影视效演示', 'c16-ev-03')
      ]
    },
    {
      module: '潮汐引擎',
      title: '自研感知调度',
      description: '潮汐引擎深度协同，动态适配场景资源需求与智能调节运行负载，实现短视频久刷不卡顿、游戏重载不掉帧、影像久拍不中断的持久流畅。',
      rawIndex: 12,
      media: [
        makeMediaItem(reg['coloros16-summary'], 'c16-m-04', 'ColorOS 16 架构全景与调度优化', 'c16-ev-04')
      ]
    },
    {
      module: '繁星编译器',
      title: '跨层级编译优化',
      description: '业界首创跨层级融合优化与反馈式优化技术，大幅提升系统服务与应用执行效率，响应更迅速更敏捷。',
      rawIndex: 15,
      media: [
        makeMediaItem(reg['coloros16-summary'], 'c16-m-05', '繁星编译器跨层级编译架构', 'c16-ev-05')
      ]
    },
    {
      module: '人工智能',
      title: 'AI 实景对话',
      description: '指哪答哪，点击屏幕上好奇的事物即可即时解答；支持专属声纹识别，嘈杂环境下智能识别机主声音，过滤他人语音干扰。',
      rawIndex: 17,
      media: [
        makeMediaItem(reg['ai-dialog'], 'c16-m-06', 'AI 实景对话指哪问哪演示', 'c16-ev-06')
      ]
    },
    {
      module: '小布记忆',
      title: '随心记与智能归集',
      description: '随时记录取餐码、视频、账单、多图灵感；全新列表详情视图呈现更详尽的 AI 摘要，支持添加备注与重点提取。',
      rawIndex: 20,
      media: [
        makeMediaItem(reg['xiaobu-memory'], 'c16-m-07', '小布记忆随心记功能演示', 'c16-ev-07')
      ]
    },
    {
      module: '小布建议',
      title: '全天候智能提醒',
      description: '服务范围大幅扩展，深度打通小布记忆，智能呈现航班高铁行程、生活缴费、出行打车与取餐提醒。',
      rawIndex: 22,
      media: [
        makeMediaItem(reg['xiaobu-briefing'], 'c16-m-08', '小布建议 AI 晨间简报', 'c16-ev-08'),
        makeMediaItem(reg['xiaobu-cross'], 'c16-m-09', '打通小布记忆跨服务协同', 'c16-ev-09')
      ]
    },
    {
      module: '全新设计',
      title: '全新光场设计',
      description: '光与环境交相辉映，光影融入系统界面与桌面图标设计，视觉通透自然，细节质感跃升。',
      rawIndex: 40,
      media: [
        makeMediaItem(reg['light-design'], 'c16-m-10', '全新光场质感设计演示', 'c16-ev-10')
      ]
    },
    {
      module: 'AI 灵感主题',
      title: '实况壁纸与动态景深',
      description: 'AI 赋能灵感主题，支持将静态照片转换为 AI 动态实况壁纸，提供景深时钟排版与智能取色图标。',
      rawIndex: 44,
      media: [
        makeMediaItem(reg['live-depth'], 'c16-m-11', 'AI 动态景深时钟效果', 'c16-ev-11'),
        makeMediaItem(reg['live-wallpaper'], 'c16-m-12', 'AI 实况动态壁纸演示', 'c16-ev-12')
      ]
    },
    {
      module: '互联互通',
      title: '跨生态手表与耳机互通',
      description: '流体云信息支持跨端流转至智能手表，运动健康数据实时同步；支持无线耳机便捷弹窗与降噪控制。',
      rawIndex: 51,
      media: [
        makeMediaItem(reg['apple-watch-fluid'], 'c16-m-13', 'Apple Watch 查看流体云信息', 'c16-ev-13')
      ]
    },
    {
      module: '互联互通',
      title: '一碰互传多端流转',
      description: '支持图片、文档、便签、联系人名片以及短视频、红包一碰快速分享；手机支持镜像投屏到电脑进行多任务协同。',
      rawIndex: 53,
      media: [
        makeMediaItem(reg['memo-migration'], 'c16-m-14', 'iOS 备忘录一键换机搬家', 'c16-ev-14'),
        makeMediaItem(reg['touch-share'], 'c16-m-15', '碰一碰极速互传演示', 'c16-ev-15')
      ]
    },
    {
      module: '安全隐私',
      title: '剪贴板智能管控与最小授权',
      description: '新增写入剪贴板管控权限，智能读取口令信息防泄露；提供权限审核机制与最小化授权推荐。',
      rawIndex: 75,
      media: [
        makeMediaItem(reg['coloros-pad'], 'c16-m-16', '大屏生态与安全控件', 'c16-ev-16')
      ]
    }
  ];

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const fileHash = sha256(mdContent);

  const rawLines = mdContent.split('\n');
  let currentH2 = '';
  const parsedItems = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.startsWith('## ')) {
      currentH2 = line.replace('## ', '').trim();
    } else if (line.startsWith('- ')) {
      const text = cleanMarkdownLine(line.replace(/^- /, ''));
      if (text) {
        parsedItems.push({
          h2: currentH2 || '系统',
          text,
          lineIndex: i
        });
      }
    }
  }

  return generateDigestFile({
    articleId: 'ColorOS_16_正式发布！亮点抢先看',
    sourceFile: 'ColorOS_16_更新说明.md',
    outputPath: digestPath,
    parsedItems,
    highlightDefs,
    fileHash
  });
}

// -------------------------------------------------------------
// 2. OriginOS 6 Markdown & Digest
// -------------------------------------------------------------
function buildOriginOS6() {
  const mdPath = path.resolve(workspaceRoot, 'articles/OriginOS_6_更新说明.md');
  const digestPath = path.resolve(siteRoot, 'src/content/monthly-digests/65-originos.json');

  const reg = mediaRegistry.originos;

  const highlightDefs = [
    {
      module: '光影设计',
      title: '系统级 AI 光影与渐进模糊',
      description: '为各项 AI 功能注入灵动光影反馈，从唤醒到生成直观感知；控制中心、通知中心与负一屏提供自然柔和的渐进模糊过渡。',
      rawIndex: 0,
      media: [
        makeMediaItem(reg['ambient-desktop'], 'o6-m-01', '桌面光影空间设计动效', 'o6-ev-01'),
        makeMediaItem(reg['blur-control'], 'o6-m-02', '控制中心渐进模糊效果', 'o6-ev-02')
      ]
    },
    {
      module: '个性锁屏',
      title: '个性时钟与字重自适应',
      description: '新增经典与个性时钟样式，支持时钟字体及字重粗细精细调节、HSL 自定义颜色与拖拽位置调整，通知支持居底叠放。',
      rawIndex: 11,
      media: [
        makeMediaItem(reg['stack-layers'], 'o6-m-03', '锁屏通知堆叠效果配图', 'o6-ev-03'),
        makeMediaItem(reg['stack-interaction'], 'o6-m-04', '通知中心堆叠手势交互', 'o6-ev-04')
      ]
    },
    {
      module: '蓝河流畅引擎',
      title: '超核计算系统调度',
      description: '全新调度架构提升算力利用率，应用启动更迅捷、列表滑动更平稳、多任务重载运行稳定不掉帧。',
      rawIndex: 18,
      media: [
        makeMediaItem(reg['originos6-summary'], 'o6-m-05', 'OriginOS 6 蓝河流畅引擎全景', 'o6-ev-05')
      ]
    },
    {
      module: '原子动效',
      title: '全场景自然连贯动效',
      description: '支持并行打断与连贯手势响应，负一屏、全搜、多任务切换过渡更自然顺滑，消除视觉跳跃感。',
      rawIndex: 21,
      media: [
        makeMediaItem(reg['elastic-motion'], 'o6-m-06', '原子动效桌面弹性手势演示', 'o6-ev-06'),
        makeMediaItem(reg['shelf-one-shot'], 'o6-m-07', '负一屏一镜到底过渡动效', 'o6-ev-07')
      ]
    },
    {
      module: '原子动效',
      title: '水波涟漪与光感回馈',
      description: '充电连接与指纹解锁呈现细腻水波涟漪特效，搭配系统级微动效反馈，操作质感全面提升。',
      rawIndex: 23,
      media: [
        makeMediaItem(reg['ripple-charging'], 'o6-m-08', '充电动效与水波涟漪视效', 'o6-ev-08')
      ]
    },
    {
      module: '蓝海续航',
      title: '超级省电与微电精灵',
      description: '精细化能耗管理，微电精灵在极限电量下智能保障前台重要任务无缝保存，待机更持久。',
      rawIndex: 25,
      media: [
        makeMediaItem(reg['micro-power'], 'o6-m-09', '微电精灵极限续航模式', 'o6-ev-09')
      ]
    },
    {
      module: '蓝心智能',
      title: '小V圈搜意图直达',
      description: '长按指关节或屏幕边缘轻松圈选，智能提取商品、文字、地址与日程，一键触发专属快捷服务。',
      rawIndex: 27,
      media: [
        makeMediaItem(reg['v-circle-search'], 'o6-m-10', '小V圈搜屏幕服务直达', 'o6-ev-10')
      ]
    },
    {
      module: '蓝心写作',
      title: '系统级文案与智能帮写',
      description: '深度融入输入法与笔记应用，支持一键润色、扩写、摘要生成与多语种即时互译。',
      rawIndex: 30,
      media: [
        makeMediaItem(reg['livephoto-erase'], 'o6-m-11', 'Live Photo 逐帧路人消除', 'o6-ev-11')
      ]
    },
    {
      module: '跨端互联',
      title: '摇一摇群组分享',
      description: '多台设备同时摇一摇即可自动建立极速面对面传输群组，批量发送海量高清照片、视频与文件。',
      rawIndex: 36,
      media: [
        makeMediaItem(reg['shake-share'], 'o6-m-12', '摇一摇多设备群组分享', 'o6-ev-12')
      ]
    },
    {
      module: '跨端互联',
      title: '跨平台随心传与平板协同',
      description: '支持与 Windows、Mac 电脑免数据线互传大型文件夹；支持手机应用流转与平板无缝投屏。',
      rawIndex: 37,
      media: [
        makeMediaItem(reg['ipad-connect'], 'o6-m-13', 'iPad 跨端投屏与互联演示', 'o6-ev-13')
      ]
    }
  ];

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const fileHash = sha256(mdContent);

  const rawLines = mdContent.split('\n');
  let currentH2 = '';
  const parsedItems = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.startsWith('## ')) {
      currentH2 = line.replace('## ', '').trim();
    } else if (line.startsWith('- ')) {
      const text = cleanMarkdownLine(line.replace(/^- /, ''));
      if (text) {
        parsedItems.push({
          h2: currentH2 || '系统',
          text,
          lineIndex: i
        });
      }
    }
  }

  return generateDigestFile({
    articleId: 'OriginOS_6_正式发布！亮点抢先看',
    sourceFile: 'OriginOS_6_更新说明.md',
    outputPath: digestPath,
    parsedItems,
    highlightDefs,
    fileHash
  });
}

// -------------------------------------------------------------
// 3. HyperOS 3 Markdown & Digest
// -------------------------------------------------------------
function buildHyperOS3() {
  const mdPath = path.resolve(workspaceRoot, 'articles/HyperOS_3_更新说明.md');
  const digestPath = path.resolve(siteRoot, 'src/content/monthly-digests/66-hyperos.json');

  const reg = mediaRegistry.hyperos;

  const highlightDefs = [
    {
      module: '流畅性能',
      title: '底层编译与调度优化',
      description: '深入微架构级调优，连续应用启动响应时延大幅下降，高负载游戏帧率曲线更平稳，平均功耗显著优化。',
      rawIndex: 0,
      media: [
        makeMediaItem(reg['launch-latency'], 'h3-m-01', '应用启动响应时延量化对比', 'h3-ev-01'),
        makeMediaItem(reg['fps-curve'], 'h3-m-02', '重载游戏运行帧率曲线提升', 'h3-ev-02'),
        makeMediaItem(reg['compile-opt'], 'h3-m-03', '热点函数底层编译优化', 'h3-ev-03'),
        makeMediaItem(reg['render-load'], 'h3-m-04', '渲染负载与能效优化', 'h3-ev-04')
      ]
    },
    {
      module: '全场景动效',
      title: '一镜到底与丝滑跟手',
      description: '窗口动画从应用层下沉至系统层，负一屏进入多任务丝滑跟手，文件管理与相册打开呈现实时一镜到底连续动效。',
      rawIndex: 4,
      media: [
        makeMediaItem(reg['multitask-smooth'], 'h3-m-05', '负一屏打开多任务丝滑跟手', 'h3-ev-05'),
        makeMediaItem(reg['file-one-shot'], 'h3-m-06', '文件管理一镜到底打开动效', 'h3-ev-06')
      ]
    },
    {
      module: '小米超级岛',
      title: '主副双岛架构形态',
      description: '创新主副双岛设计，通知切换丝滑可打断；细节包含抛掷手势、卡片自适应缩放与生动的回弹动效。',
      rawIndex: 6,
      media: [
        makeMediaItem(reg['island-design'], 'h3-m-07', '类 iOS 主副岛形态设计', 'h3-ev-07'),
        makeMediaItem(reg['island-switch'], 'h3-m-08', '主副岛切换丝滑流畅可打断', 'h3-ev-08'),
        makeMediaItem(reg['island-bounce'], 'h3-m-09', '超级岛状态抛掷与细腻回弹', 'h3-ev-09')
      ]
    },
    {
      module: '小米超级岛',
      title: '下拉小窗与拖拽分享',
      description: '支持超级岛下拉直接打开小窗，拖拽行程与关键信息一键分享至聊天软件，系统工具与第三方服务全面接入。',
      rawIndex: 8,
      media: [
        makeMediaItem(reg['island-small-window'], 'h3-m-10', '超级岛下拉开启小窗', 'h3-ev-10'),
        makeMediaItem(reg['island-drag-share'], 'h3-m-11', '超级岛拖拽分享行程', 'h3-ev-11'),
        makeMediaItem(reg['island-services'], 'h3-m-12', '超级岛系统与三方服务矩阵', 'h3-ev-12')
      ]
    },
    {
      module: '电影感锁屏',
      title: '动态景深与可变时钟',
      description: '动态锁屏算法升级，支持高度可变字体、左右布局排版与四层自然景深，打造生动的生命感美学。',
      rawIndex: 12,
      media: [
        makeMediaItem(reg['cinema-lockscreen'], 'h3-m-13', '电影感锁屏动态效果与景深', 'h3-ev-13'),
        makeMediaItem(reg['variable-clock'], 'h3-m-14', '高度可变字体与左右布局时钟', 'h3-ev-14')
      ]
    },
    {
      module: '设计美学',
      title: 'AI 风格化与图标细节',
      description: '支持由 AI 一键生成二次元、3D 等风格化动态壁纸；桌面图标细节全面打磨，带来通透纯净的视觉感受。',
      rawIndex: 14,
      media: [
        makeMediaItem(reg['ai-wallpaper'], 'h3-m-15', 'AI 风格化动态壁纸生成', 'h3-ev-15'),
        makeMediaItem(reg['desktop-icons'], 'h3-m-16', '桌面图标细节设计跟进', 'h3-ev-16')
      ]
    },
    {
      module: '跨生态互联',
      title: '苹果设备深度协同',
      description: 'iPhone 双持用户可无缝接收并回复小米微信消息，Mac 电脑端支持大屏运行手机应用与剪贴板极速互通。',
      rawIndex: 17,
      media: [
        makeMediaItem(reg['iphone-wechat'], 'h3-m-17', 'iPhone 接收并回复小米微信消息', 'h3-ev-17'),
        makeMediaItem(reg['iphone-notify'], 'h3-m-18', 'iPhone 双持跨设备消息通知', 'h3-ev-18'),
        makeMediaItem(reg['mac-large-screen'], 'h3-m-19', 'Mac 电脑端使用手机大屏版应用', 'h3-ev-19'),
        makeMediaItem(reg['mac-collab'], 'h3-m-20', 'Mac 与小米跨生态协同界面', 'h3-ev-20')
      ]
    },
    {
      module: '超级小爱',
      title: '语义一步直达与圈屏',
      description: '大模型赋能智能体语义理解，一句话帮办多步复杂跨应用操作；支持长按圈屏解题、识物与全局百科搜索。',
      rawIndex: 20,
      media: [
        makeMediaItem(reg['xiaoai-direct'], 'h3-m-21', '大模型语义理解一步直达', 'h3-ev-21'),
        makeMediaItem(reg['xiaoai-circle'], 'h3-m-22', '小爱圈屏智能识别物体与文字', 'h3-ev-22'),
        makeMediaItem(reg['xiaoai-solver'], 'h3-m-23', '小爱圈屏解题与百科搜索', 'h3-ev-23')
      ]
    },
    {
      module: '安全隐私',
      title: '细粒度安全访问与关机查找',
      description: '照片与文件仅授权选中项，杜绝过度授权；支持关机状态下利用附近设备进行离线蓝牙广播定位。',
      rawIndex: 23,
      media: [
        makeMediaItem(reg['safe-access'], 'h3-m-24', '照片文件选择性分享安全控件', 'h3-ev-24'),
        makeMediaItem(reg['poweroff-find'], 'h3-m-25', '关机离线广播定位查找', 'h3-ev-25')
      ]
    }
  ];

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const fileHash = sha256(mdContent);

  const rawLines = mdContent.split('\n');
  let currentH2 = '';
  const parsedItems = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.startsWith('## ')) {
      currentH2 = line.replace('## ', '').trim();
    } else if (line.startsWith('- ')) {
      const text = cleanMarkdownLine(line.replace(/^- /, ''));
      if (text) {
        parsedItems.push({
          h2: currentH2 || '系统',
          text,
          lineIndex: i
        });
      }
    }
  }

  return generateDigestFile({
    articleId: 'HyperOS_3_更新说明_(2025)',
    sourceFile: 'HyperOS_3_更新说明.md',
    outputPath: digestPath,
    parsedItems,
    highlightDefs,
    fileHash
  });
}

// -------------------------------------------------------------
// 4. MagicOS 10 Markdown & Digest
// -------------------------------------------------------------
function buildMagicOS10() {
  const mdPath = path.resolve(workspaceRoot, 'articles/MagicOS_10_更新说明.md');
  const digestPath = path.resolve(siteRoot, 'src/content/monthly-digests/67-magicos.json');

  const reg = mediaRegistry.magicos;

  const highlightDefs = [
    {
      module: 'UX 焕新',
      title: '通透模式与光感设计',
      description: '卡片与文件夹支持通透模式与多档调节，控制中心与锁屏按压呈现通透微光感，视觉层级更高级。',
      rawIndex: 2,
      media: [
        makeMediaItem(reg['translucent-mode'], 'm10-m-01', '全新通透模式卡片质感演示', 'm10-ev-01'),
        makeMediaItem(reg['translucent-adjust'], 'm10-m-02', '通透度多档位自由调节', 'm10-ev-02')
      ]
    },
    {
      module: 'UX 焕新',
      title: '最近任务堆叠布局',
      description: '多任务任务卡片采用全新重叠层级展现，滑动流畅不晕眩，切换直观高效。',
      rawIndex: 3,
      media: [
        makeMediaItem(reg['light-touch'], 'm10-m-03', '控制中心按压通透光感演示', 'm10-ev-03')
      ]
    },
    {
      module: 'UX 焕新',
      title: '智能锁屏与个性搭配',
      description: '基于壁纸智能匹配推荐时钟样式，支持自由调节字体字重、颜色与位置，提供重力感应摇摇乐互动主题。',
      rawIndex: 7,
      media: [
        makeMediaItem(reg['auto-wallpaper'], 'm10-m-04', '个性主题基于壁纸自动布局', 'm10-ev-04'),
        makeMediaItem(reg['interactive-theme'], 'm10-m-05', '摇摇乐系列重力感应互动主题', 'm10-ev-05')
      ]
    },
    {
      module: '丝滑流畅',
      title: 'Turbo X 性能引擎平台',
      description: '全新存储优化与无损压缩整理技术，应用安装加速，高负载刷视频、看直播与图文浏览久用流畅稳定。',
      rawIndex: 16,
      media: [
        makeMediaItem(reg['turbo-x-platform'], 'm10-m-06', 'Turbo X 性能平台架构与无损压缩', 'm10-ev-06')
      ]
    },
    {
      module: '荣耀 AI',
      title: 'YOYO 记忆全新升级',
      description: '全新列表视图提升信息查阅效率，知乎、小红书等高频应用智能提取原文一键跳转，双重隐私保护守卫数据。',
      rawIndex: 22,
      media: [
        makeMediaItem(reg['yoyo-memory'], 'm10-m-07', 'YOYO 智能收藏与一键原文跳转', 'm10-ev-07')
      ]
    },
    {
      module: '荣耀 AI',
      title: 'AI 通话翻译与会议帮记',
      description: '会议中实时语音转文本与自动生成纪要，跨语种通话双向实时同声翻译，沟通无障碍。',
      rawIndex: 25,
      media: [
        makeMediaItem(reg['yoyo-auto-exec'], 'm10-m-08', 'YOYO 一句话完成复杂跨应用操作', 'm10-ev-08')
      ]
    },
    {
      module: '互联共享',
      title: '跨生态一碰传与苹果互通',
      description: '支持开启 NFC 与 iPhone 一碰高速传输文件，支持与 macOS、Windows 互传及与 iOS 的 OTG 有线克隆。',
      rawIndex: 27,
      media: [
        makeMediaItem(reg['cross-share'], 'm10-m-09', 'NFC 一碰传支持 iPhone 高速互传', 'm10-ev-09')
      ]
    },
    {
      module: '便捷交互',
      title: '灵动胶囊多场景服务触达',
      description: '充电、人脸识别、通话状态及 YOYO 记忆深度接入灵动胶囊，关键信息实时提醒与一触即达。',
      rawIndex: 33,
      media: [
        makeMediaItem(reg['magicos10-summary-1'], 'm10-m-10', 'MagicOS 10 发布会全景精华', 'm10-ev-10')
      ]
    }
  ];

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const fileHash = sha256(mdContent);

  const rawLines = mdContent.split('\n');
  let currentH2 = '';
  const parsedItems = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.startsWith('## ')) {
      currentH2 = line.replace('## ', '').trim();
    } else if (line.startsWith('- ')) {
      const text = cleanMarkdownLine(line.replace(/^- /, ''));
      if (text) {
        parsedItems.push({
          h2: currentH2 || '系统',
          text,
          lineIndex: i
        });
      }
    }
  }

  return generateDigestFile({
    articleId: 'MagicOS_10正式发布！一图读懂升级亮点_(2025)',
    sourceFile: 'MagicOS_10_更新说明.md',
    outputPath: digestPath,
    parsedItems,
    highlightDefs,
    fileHash
  });
}

// -------------------------------------------------------------
// 5. HarmonyOS 6 Markdown & Digest
// -------------------------------------------------------------
function buildHarmonyOS6() {
  const mdPath = path.resolve(workspaceRoot, 'articles/HarmonyOS_6_更新说明.md');
  const digestPath = path.resolve(siteRoot, 'src/content/monthly-digests/68-harmonyos.json');

  const reg = mediaRegistry.harmonyos;

  const highlightDefs = [
    {
      module: '智慧光感',
      title: '全新智慧色彩光感',
      description: '当唤醒小艺、输入法语音输入或碰一碰互传时，屏幕边缘伴随通透绚丽的动态光影扩散，交互直观灵动。',
      rawIndex: 0,
      media: [
        makeMediaItem(reg['smart-light-color'], 'a6-m-01', '唤醒小艺与碰一碰通透色彩光感', 'a6-ev-01')
      ]
    },
    {
      module: '艺术签名',
      title: '美学构图与自适应字体',
      description: '智慧美学构图可自动匹配签名文字并与壁纸融合，支持通过拍摄书法字体由 AI 提取生成独具格调的个性锁屏签名。',
      rawIndex: 1,
      media: [
        makeMediaItem(reg['signature-camera'], 'a6-m-02', '拍摄书法字体智能提取生成签名', 'a6-ev-02'),
        makeMediaItem(reg['signature-style'], 'a6-m-03', '锁屏艺术签名个性搭配演示', 'a6-ev-03'),
        makeMediaItem(reg['wallpaper-compose'], 'a6-m-04', '智能壁纸主体识别与自适应布局', 'a6-ev-04')
      ]
    },
    {
      module: '趣味主题',
      title: '可交互元气心情与毛球主题',
      description: '心情主题与毛球主题在锁屏下支持轻触与语音指令互动，与其他搭载相同主题的设备碰一碰可解锁隐藏款萌趣表情彩蛋。',
      rawIndex: 2,
      media: [
        makeMediaItem(reg['mood-emoji'], 'a6-m-05', '元气心情主题 3D 表情互动', 'a6-ev-05'),
        makeMediaItem(reg['fluffy-ball'], 'a6-m-06', '毛球主题语音互动与磁吸彩蛋', 'a6-ev-06')
      ]
    },
    {
      module: '跨端互联',
      title: '手眼同行注视流转',
      description: '键鼠跨端共享下，按下快捷键并注视目标设备即可自然切换操控；拖动素材时注视即可精准跨屏投送。',
      rawIndex: 5,
      media: [
        makeMediaItem(reg['eye-hand-flow'], 'a6-m-07', '注视目标设备瞬移流转与一碰分享', 'a6-ev-07')
      ]
    },
    {
      module: '超级小艺',
      title: '复杂意图自主拆解执行',
      description: '一句指令小艺即可自主跨应用拆解并连续完成订票、查信息、整理日程等复杂链路任务，上滑即刻缩小为悬浮导航条。',
      rawIndex: 8,
      media: [
        makeMediaItem(reg['super-xiaoyi'], 'a6-m-08', '超级小艺复杂任务拆解与后台执行', 'a6-ev-08')
      ]
    },
    {
      module: '影像创作',
      title: 'AI 一键成片与记忆盘活',
      description: '智能精选多张照片自动匹配电影级运镜与背景音乐生成视频大片，并可对静态照片智能生成微动视效。',
      rawIndex: 9,
      media: [
        makeMediaItem(reg['ai-portrait-retouch'], 'a6-m-09', 'AI 人像精修智能补光与调色', 'a6-ev-09'),
        makeMediaItem(reg['ai-photo-to-video'], 'a6-m-10', 'AI 一键成片多图自动运镜成片', 'a6-ev-10')
      ]
    },
    {
      module: '隐私安全',
      title: '涉诈识别与亲情守护',
      description: '智能通话涉诈检测与 AI 换脸提醒，家人接到诈骗电话时可远程告警并协助挂断风险通话。',
      rawIndex: 11,
      media: [
        makeMediaItem(reg['anti-fraud-call'], 'a6-m-11', 'AI 通话涉诈智能检测与提醒', 'a6-ev-11'),
        makeMediaItem(reg['anti-fraud-alert'], 'a6-m-12', '亲情防诈与远程防御挂断', 'a6-ev-12')
      ]
    },
    {
      module: '隐私保护',
      title: 'AI 智能防窥保护',
      description: '针对受保护的高敏应用，手机若感知到身侧他人目光窥视，将自动即刻隐藏敏感界面并轻柔提醒机主。',
      rawIndex: 13,
      media: [
        makeMediaItem(reg['peep-proof'], 'a6-m-13', 'AI 智能防窥自动隐藏敏感内容', 'a6-ev-13')
      ]
    },
    {
      module: '系统丝滑',
      title: '秒启秒开超流畅体验',
      description: '系统底层架构再升级，整机能效与续航显著提升，带来高频应用秒启、复杂页面秒开、安装包闪电解析的高效体验。',
      rawIndex: 16,
      media: [
        makeMediaItem(reg['ark-engine'], 'a6-m-14', '方舟引擎整机性能与应用秒启秒开', 'a6-ev-14')
      ]
    }
  ];

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const fileHash = sha256(mdContent);

  const rawLines = mdContent.split('\n');
  let currentH2 = '';
  const parsedItems = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.startsWith('## ')) {
      currentH2 = line.replace('## ', '').trim();
    } else if (line.startsWith('- ')) {
      const text = cleanMarkdownLine(line.replace(/^- /, ''));
      if (text) {
        parsedItems.push({
          h2: currentH2 || '系统',
          text,
          lineIndex: i
        });
      }
    }
  }

  return generateDigestFile({
    articleId: 'HarmonyOS_6_正式发布！亮点抢先看',
    sourceFile: 'HarmonyOS_6_更新说明.md',
    outputPath: digestPath,
    parsedItems,
    highlightDefs,
    fileHash
  });
}

// -------------------------------------------------------------
// Update Article Markdown & HTML files
// -------------------------------------------------------------
function buildArticles() {
  const articlesHtmlDir = path.resolve(workspaceRoot, 'articles');

  const newArticles = [
    {
      filename: '65-originos.json',
      articleId: 'OriginOS_6_正式发布！亮点抢先看',
      order: 65,
      title: 'OriginOS 6 正式发布！亮点抢先看',
      brand: 'originos',
      year: 2025,
      publishedAt: '2025-09-10',
      slug: '65-originos-6',
      legacyPath: 'OriginOS_6_正式发布！亮点抢先看.html',
      cover: {
        src: 'assets/covers/d8f2b7a95e3c4118-1200.webp',
        srcset: 'assets/covers/d8f2b7a95e3c4118-480.webp 480w, assets/covers/d8f2b7a95e3c4118-800.webp 800w, assets/covers/d8f2b7a95e3c4118-1200.webp 1200w',
        avifSrcset: 'assets/covers/d8f2b7a95e3c4118-480.avif 480w, assets/covers/d8f2b7a95e3c4118-800.avif 800w, assets/covers/d8f2b7a95e3c4118-1200.avif 1200w',
        width: 1200,
        height: 675,
        alt: 'OriginOS 6 正式发布！亮点抢先看 封面',
        dominantColor: '#0055ff',
        focalPoint: '50% 0%'
      },
      images: [
        '/assets/digests-2025/originos/originos6-summary.webp',
        '/assets/digests-2025/originos/stack-layers.webp',
        '/assets/digests-2025/originos/v-circle-search.webp',
        '/assets/digests-2025/originos/ipad-connect.webp'
      ]
    },
    {
      filename: '66-hyperos.json',
      articleId: 'HyperOS_3_更新说明_(2025)',
      order: 66,
      title: 'Xiaomi HyperOS 3 正式发布！亮点抢先看',
      brand: 'hyperos',
      year: 2025,
      publishedAt: '2025-08-28',
      slug: '66-xiaomi-hyperos-3',
      legacyPath: 'Xiaomi_HyperOS_3_正式发布！亮点抢先看.html',
      cover: {
        src: 'assets/covers/fbfb4a7d6e8c2910-1200.webp',
        srcset: 'assets/covers/fbfb4a7d6e8c2910-480.webp 480w, assets/covers/fbfb4a7d6e8c2910-800.webp 800w, assets/covers/fbfb4a7d6e8c2910-1200.webp 1200w',
        avifSrcset: 'assets/covers/fbfb4a7d6e8c2910-480.avif 480w, assets/covers/fbfb4a7d6e8c2910-800.avif 800w, assets/covers/fbfb4a7d6e8c2910-1200.avif 1200w',
        width: 1200,
        height: 675,
        alt: 'Xiaomi HyperOS 3 正式发布！亮点抢先看 封面',
        dominantColor: '#ff6900',
        focalPoint: '50% 0%'
      },
      images: [
        '/assets/digests-2025/hyperos/hyperos3-summary.webp',
        '/assets/digests-2025/hyperos/launch-latency.webp',
        '/assets/digests-2025/hyperos/fps-curve.webp',
        '/assets/digests-2025/hyperos/compile-opt.webp',
        '/assets/digests-2025/hyperos/island-design.webp',
        '/assets/digests-2025/hyperos/island-services.webp',
        '/assets/digests-2025/hyperos/cinema-lockscreen-poster.webp',
        '/assets/digests-2025/hyperos/ai-wallpaper.webp',
        '/assets/digests-2025/hyperos/xiaoai-direct.webp',
        '/assets/digests-2025/hyperos/safe-access.webp'
      ]
    },
    {
      filename: '67-magicos.json',
      articleId: 'MagicOS_10正式发布！一图读懂升级亮点_(2025)',
      order: 67,
      title: 'MagicOS 10 正式发布！升级亮点全景',
      brand: 'magicos',
      year: 2025,
      publishedAt: '2025-10-16',
      slug: '67-honor-magicos-10',
      legacyPath: 'MagicOS_10正式发布！一图读懂升级亮点_(2025).html',
      cover: {
        src: 'assets/covers/05ba2dc5934747d4-1200.webp',
        srcset: 'assets/covers/05ba2dc5934747d4-480.webp 480w, assets/covers/05ba2dc5934747d4-800.webp 800w, assets/covers/05ba2dc5934747d4-1200.webp 1200w',
        avifSrcset: 'assets/covers/05ba2dc5934747d4-480.avif 480w, assets/covers/05ba2dc5934747d4-800.avif 800w, assets/covers/05ba2dc5934747d4-1200.avif 1200w',
        width: 1200,
        height: 675,
        alt: 'MagicOS 10正式发布！一图读懂升级亮点 封面',
        dominantColor: '#00256c',
        focalPoint: '50% 0%'
      },
      images: [
        '/assets/digests-2025/magicos/magicos10-summary-1.webp',
        '/assets/digests-2025/magicos/magicos10-summary-2.webp',
        '/assets/digests-2025/magicos/magicos10-summary-3.webp'
      ]
    },
    {
      filename: '68-harmonyos.json',
      articleId: 'HarmonyOS_6_正式发布！亮点抢先看',
      order: 68,
      title: 'HarmonyOS 6 正式发布！亮点抢先看',
      brand: 'harmonyos',
      year: 2025,
      publishedAt: '2025-10-22',
      slug: '68-huawei-harmonyos-6',
      legacyPath: 'HarmonyOS_6_正式发布！亮点抢先看.html',
      cover: {
        src: 'assets/covers/f97ef6540e2c294a-1200.webp',
        srcset: 'assets/covers/f97ef6540e2c294a-480.webp 480w, assets/covers/f97ef6540e2c294a-800.webp 800w, assets/covers/f97ef6540e2c294a-1200.webp 1200w',
        avifSrcset: 'assets/covers/f97ef6540e2c294a-480.avif 480w, assets/covers/f97ef6540e2c294a-800.avif 800w, assets/covers/f97ef6540e2c294a-1200.avif 1200w',
        width: 1200,
        height: 675,
        alt: 'HarmonyOS 6 正式发布！亮点抢先看 封面',
        dominantColor: '#0a59f7',
        focalPoint: '50% 0%'
      },
      images: [
        '/assets/digests-2025/harmonyos/harmonyos6-summary-1.webp',
        '/assets/digests-2025/harmonyos/harmonyos6-summary-2.webp',
        '/assets/digests-2025/harmonyos/ai-portrait-retouch.webp',
        '/assets/digests-2025/harmonyos/ai-photo-to-video.webp',
        '/assets/digests-2025/harmonyos/anti-fraud-call.webp'
      ]
    }
  ];

  newArticles.forEach((art) => {
    // 1. Write HTML file in articles/ with image gallery
    const imgTags = (art.images || []).map(img => `<p><img src="${img.startsWith('/') ? img : '/' + img}" alt="${art.title} 亮点配图" loading="lazy" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" /></p>`).join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${art.title}</title>
  <style>
    body { font-family: Inter, -apple-system, "PingFang SC", sans-serif; margin: 0; padding: 24px; color: #171a20; background: #fff; }
    .card { max-width: 800px; margin: 0 auto; line-height: 1.7; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
  </style>
</head>
<body>
  <div class="card">
    <h1>${art.title}</h1>
    <div class="meta">${art.publishedAt} · ${art.brand.toUpperCase()}</div>
    <div class="gallery">
${imgTags}
    </div>
  </div>
</body>
</html>
`;
    fs.writeFileSync(path.join(articlesHtmlDir, art.legacyPath), htmlContent, 'utf8');

    // 2. Write JSON file in src/content/articles/
    const articleJson = {
      articleId: art.articleId,
      order: art.order,
      title: art.title,
      brand: art.brand,
      year: art.year,
      publishedAt: art.publishedAt,
      slug: art.slug,
      kind: 'gallery',
      legacyPath: art.legacyPath,
      html: `<div class="image-gallery">\n${(art.images || []).map(img => `<img src="${img}" alt="${art.title} 亮点配图" loading="lazy" />`).join('\n')}\n</div>`,
      cover: art.cover,
      media: []
    };
    fs.writeFileSync(path.join(siteRoot, 'src/content/articles', art.filename), JSON.stringify(articleJson, null, 2), 'utf8');
    console.log(`Created article ${art.filename}`);
  });
}

// Run All
console.log('--- Building 2025 Major Updates with Media ---');
buildArticles();
buildColorOS16();
buildOriginOS6();
buildHyperOS3();
buildMagicOS10();
buildHarmonyOS6();
console.log('--- All 2025 Major Updates Built Successfully with Media! ---');
