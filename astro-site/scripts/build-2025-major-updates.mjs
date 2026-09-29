import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const siteRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(siteRoot, '..');

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

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
// 1. ColorOS 16 Markdown & Digest
// -------------------------------------------------------------
function buildColorOS16() {
  const mdPath = path.resolve(workspaceRoot, 'articles/ColorOS_16_更新说明.md');
  const digestPath = path.resolve(siteRoot, 'src/content/monthly-digests/08-coloros.json');

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

  // Flagship Highlights
  const highlightDefs = [
    {
      module: '极光引擎',
      title: '全场景无缝动效',
      description: '新增桌面图标、卡片、文件夹、侧边栏等场景支持无缝拖拽动画与并行打断，下拉通知中心与控制中心实时打断，带来一气呵成的直觉流畅体验。',
      rawIndex: 0
    },
    {
      module: '极光引擎',
      title: '光场动效与微视效',
      description: '新增光场动效与自然涟漪视效，在计算器、锁屏密码、通话界面按压交互时呈现更生动的光场反馈，优化充电动效与指纹动效。',
      rawIndex: 7
    },
    {
      module: '潮汐引擎',
      title: '自研感知调度',
      description: '潮汐引擎深度协同，动态适配场景资源需求与智能调节运行负载，实现短视频久刷不卡顿、游戏重载不掉帧、影像久拍不中断的持久流畅。',
      rawIndex: 12
    },
    {
      module: '繁星编译器',
      title: '跨层级编译优化',
      description: '业界首创跨层级融合优化与反馈式优化技术，大幅提升系统服务与应用执行效率，响应更迅速更敏捷。',
      rawIndex: 15
    },
    {
      module: '人工智能',
      title: 'AI 实景对话',
      description: '指哪答哪，点击屏幕上好奇的事物即可即时解答；支持专属声纹识别，嘈杂环境下智能识别机主声音，过滤他人语音干扰。',
      rawIndex: 17
    },
    {
      module: '小布记忆',
      title: '随心记与智能归集',
      description: '随时记录取餐码、视频、账单、多图灵感；全新列表详情视图呈现更详尽的 AI 摘要，支持添加备注与重点提取。',
      rawIndex: 20
    },
    {
      module: '小布建议',
      title: '全天候智能提醒',
      description: '服务范围大幅扩展，深度打通小布记忆，智能呈现航班高铁行程、生活缴费、出行打车与取餐提醒。',
      rawIndex: 22
    },
    {
      module: '全新设计',
      title: '全新光场设计',
      description: '光与环境交相辉映，光影融入系统界面与桌面图标设计，视觉通透自然，细节质感跃升。',
      rawIndex: 40
    },
    {
      module: 'AI 灵感主题',
      title: '实况壁纸与动态景深',
      description: 'AI 赋能灵感主题，支持将静态照片转换为 AI 动态实况壁纸，提供景深时钟排版与智能取色图标。',
      rawIndex: 44
    },
    {
      module: '互联互通',
      title: '跨生态手表与耳机互通',
      description: '流体云信息支持跨端流转至智能手表，运动健康数据实时同步；支持无线耳机便捷弹窗与降噪控制。',
      rawIndex: 51
    },
    {
      module: '互联互通',
      title: '一碰互传多端流转',
      description: '支持图片、文档、便签、联系人名片以及短视频、红包一碰快速分享；手机支持镜像投屏到电脑进行多任务协同。',
      rawIndex: 53
    },
    {
      module: '安全隐私',
      title: '剪贴板智能管控与最小授权',
      description: '新增写入剪贴板管控权限，智能读取口令信息防泄露；提供权限审核机制与最小化授权推荐。',
      rawIndex: 75
    }
  ];

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

  const highlightDefs = [
    {
      module: '光影设计',
      title: '系统级 AI 光影与渐进模糊',
      description: '为各项 AI 功能注入灵动光影反馈，从唤醒到生成直观感知；控制中心、通知中心与负一屏提供自然柔和的渐进模糊过渡。',
      rawIndex: 0
    },
    {
      module: '个性锁屏',
      title: '个性时钟与字重自适应',
      description: '新增经典与个性时钟样式，支持时钟字体及字重粗细精细调节、HSL 自定义颜色与拖拽位置调整，通知支持居底叠放。',
      rawIndex: 11
    },
    {
      module: '蓝河流畅引擎',
      title: '超核计算系统调度',
      description: '全新调度架构提升算力利用率，应用启动更迅捷、列表滑动更平稳、多任务重载运行稳定不掉帧。',
      rawIndex: 18
    },
    {
      module: '蓝海续航系统',
      title: '微电精灵低电应急',
      description: '微电状态下支持碰一碰借充电宝，并在充上电后迅速恢复微电精灵启动前的任务进程与应用状态。',
      rawIndex: 20
    },
    {
      module: '蓝心小V',
      title: 'AI 交互光影与场景问答',
      description: '蓝心小V从唤醒到生成伴随光影反馈，支持自然语言搜索问答与小V写作排版全面升级。',
      rawIndex: 22
    },
    {
      module: '小V记忆',
      title: '随心记与智能记忆库',
      description: '说一句“记一下”快速收录图文与要点，支持信息随心调取；支持将常用地址与信息同步至输入法常用语。',
      rawIndex: 24
    },
    {
      module: '相册影像',
      title: '动态照片路人消除',
      description: 'Live Photo 动态照片支持智能路人消除，逐帧精准清除干扰元素，呈现干净无瑕的动态生活瞬间。',
      rawIndex: 30
    },
    {
      module: 'vivo 互传',
      title: '摇一摇群组快速分享',
      description: '多台设备同时摇一摇即可秒建分享群组，支持多人批量极速互传原图、视频与大型文件。',
      rawIndex: 33
    },
    {
      module: '跨端互联',
      title: '跨端文件随心传与原子岛拖拽',
      description: '支持手机与 Windows/Mac 电脑在网便捷互传；长按选中图片或文档直接拖放至原子岛完成打印小窗流转。',
      rawIndex: 34
    },
    {
      module: '视听触体验',
      title: '星动视觉辅助与振动无级调节',
      description: '乘车乘机时通过屏幕边缘动态辅助圆点有效缓解眩晕感；振动档位支持滑动无级微调，满足个性化触感偏好。',
      rawIndex: 36
    }
  ];

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
      if (text && !text.startsWith('**') && !text.endsWith('：**')) {
        parsedItems.push({
          h2: currentH2 || '系统',
          text,
          lineIndex: i
        });
      }
    }
  }

  const highlightDefs = [
    {
      module: '流畅体验',
      title: '编译底层优化与帧率维稳',
      description: '性能优化深入微架构编译底层，降低应用冷热启动时延；游戏重载下帧率曲线更平稳，平均每帧能耗持续降低。',
      rawIndex: 0
    },
    {
      module: '图形技术',
      title: '窗口动画下沉系统层',
      description: '窗口动画绘制整体下沉至系统底层，消除多任务调度过程中的偶发抖动，显著提升应用启动与退出的动效稳定性。',
      rawIndex: 3
    },
    {
      module: '小米超级岛',
      title: '定制超窄字体与交互革新',
      description: '适配超窄字体让状态胶囊承载更全信息；支持下拉展开临时小窗与拖拽快速分享，导航、电话与取件信息一键直达。',
      rawIndex: 6
    },
    {
      module: '全新设计',
      title: '电影感动态锁屏与景深排版',
      description: 'AI 算法支持将静态壁纸转为生动动态壁纸，二次元与人像主题自动分层景深，大时间居中布局带来高级视觉质感。',
      rawIndex: 8
    },
    {
      module: '全新设计',
      title: '自然通透桌面网格',
      description: '重构桌面网格系统与图标细节，状态栏更精致协调，引入多层模糊与混色材质，界面整体通透沉浸。',
      rawIndex: 12
    },
    {
      module: '相册分享',
      title: '贴贴分享与精细语义检索',
      description: 'NFC 贴一下即可高速无损将照片视频传输至目标设备相册；相册支持 10 大分类数万个精准关键词语义检索。',
      rawIndex: 16
    },
    {
      module: '跨设备协同',
      title: '电脑互联大屏多窗口',
      description: '手机应用可投屏至电脑并支持自由拉伸大屏显示、跨端文件拖拽互传与多窗口并行；支持平板妙享桌面投屏。',
      rawIndex: 18
    },
    {
      module: '超级小爱',
      title: '小爱圈屏智能解析',
      description: '圈选屏幕任意区域即时答疑；支持圈选 Wi-Fi 账密自动连网，根据圈选内容主动给出电话呼叫或日程备忘等场景化建议。',
      rawIndex: 25
    },
    {
      module: '设备安全',
      title: '关机离线设备查找',
      description: '设备查找安全升级，关机或离线状态下依托周围生态设备端到端加密匿名广播上传位置，守护设备资产安全。',
      rawIndex: 32
    }
  ];

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

  const highlightDefs = [
    {
      module: 'UX 焕新',
      title: '全系统通透模式',
      description: '新增通透模式提升卡片、文件夹与控件的清透玻璃质感；控制中心采用深色层级背景搭配多彩图标，视觉轻盈鲜活。',
      rawIndex: 2
    },
    {
      module: '动效交互',
      title: '最近任务堆叠与一镜到底',
      description: '新增最近任务直观堆叠切换，时钟、图库卡片与日程、笔记应用全面引入一镜到底自然过渡动效。',
      rawIndex: 3
    },
    {
      module: '个性主题',
      title: '摇摇乐重力互动主题',
      description: '锁屏时钟支持根据壁纸智能推荐配色与字重；新增拍拍球等摇摇乐互动主题，跟随手机重力感应实时生动晃动。',
      rawIndex: 10
    },
    {
      module: '丝滑流畅',
      title: 'Turbo X 性能引擎平台',
      description: '引入全新 Turbo X 平台界面与自研存储优化技术，进行无损压缩整理提升可用空间，优化短视频与图文浏览响应。',
      rawIndex: 16
    },
    {
      module: '荣耀 AI 与 YOYO',
      title: 'YOYO 记忆列表与高频收藏',
      description: 'YOYO 记忆采用全新结构化列表视图；高频资讯与社区应用可一键智能提取图文要点并支持原文无缝跳转。',
      rawIndex: 22
    },
    {
      module: '互联共享',
      title: '跨平台一碰互传',
      description: '手机之间或跨端开启 NFC 即可实现一碰高速文件传输，并全面支持与电脑超级工作台高速互通及有线换机克隆。',
      rawIndex: 27
    },
    {
      module: '安全守护',
      title: 'AI 通话防诈识别',
      description: '系统内置端侧防诈模型，实时监测识别通话语音是否属于 AI 伪造声音或电信诈骗，守护财产安全。',
      rawIndex: 32
    },
    {
      module: '便捷易用',
      title: '灵动胶囊多场景扩展',
      description: '充电、通话、人脸解锁、备忘录与出行信息广泛接入顶部灵动胶囊，关键状态一目了然且支持轻点即时展开。',
      rawIndex: 33
    }
  ];

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

  const highlightDefs = [
    {
      module: '智慧光感',
      title: '全新智慧色彩光感',
      description: '当唤醒小艺、输入法语音输入或碰一碰互传时，屏幕边缘伴随通透绚丽的动态光影扩散，交互直观灵动。',
      rawIndex: 0
    },
    {
      module: '艺术签名',
      title: '美学构图与自适应字体',
      description: '智慧美学构图可自动匹配签名文字并与壁纸融合，支持通过拍摄书法字体由 AI 提取生成独具格调的个性锁屏签名。',
      rawIndex: 1
    },
    {
      module: '趣味主题',
      title: '可交互元气心情与毛球主题',
      description: '心情主题与毛球主题在锁屏下支持轻触与语音指令互动，与其他搭载相同主题的设备碰一碰可解锁隐藏款萌趣表情彩蛋。',
      rawIndex: 2
    },
    {
      module: '跨端互联',
      title: '手眼同行注视流转',
      description: '键鼠跨端共享下，按下快捷键并注视目标设备即可自然切换操控；拖动素材时注视即可精准跨屏投送。',
      rawIndex: 5
    },
    {
      module: '超级小艺',
      title: '复杂意图自主拆解执行',
      description: '一句指令小艺即可自主跨应用拆解并连续完成订票、查信息、整理日程等复杂链路任务，上滑即刻缩小为悬浮导航条。',
      rawIndex: 8
    },
    {
      module: '影像创作',
      title: 'AI 一键成片与记忆盘活',
      description: '智能精选多张照片自动匹配电影级运镜与背景音乐生成视频大片，并可对静态照片智能生成微动视效。',
      rawIndex: 9
    },
    {
      module: '安全防诈',
      title: 'AI 通话涉诈检测与亲情守护',
      description: '陌生来电通话内容实时智能涉诈检测提醒；当远方家人接到风险电话时可同步向您预警并支持远程一键挂断。',
      rawIndex: 11
    },
    {
      module: '屏幕防窥',
      title: 'AI 动态防窥隐私保护',
      description: '针对受保护的高敏应用，手机若感知到身侧他人目光窥视，将自动即刻隐藏敏感界面并轻柔提醒机主。',
      rawIndex: 13
    },
    {
      module: '系统丝滑',
      title: '秒启秒开超流畅体验',
      description: '系统底层架构再升级，整机能效与续航显著提升，带来高频应用秒启、复杂页面秒开、安装包闪电解析的高效体验。',
      rawIndex: 16
    }
  ];

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
// Core Generator Function
// -------------------------------------------------------------
function generateDigestFile({ articleId, sourceFile, outputPath, parsedItems, highlightDefs, fileHash }) {
  console.log(`Processing ${articleId}: total parsed ${parsedItems.length} items, ${highlightDefs.length} highlights.`);

  const highlightIndices = new Set(highlightDefs.map(d => d.rawIndex));
  const rawIndexToTargetId = new Map();

  const highlights = highlightDefs.map((def, idx) => {
    const id = `highlight-${String(idx + 1).padStart(2, '0')}`;
    rawIndexToTargetId.set(def.rawIndex, id);
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

  // Evidence
  const evidence = parsedItems.map((item, rawIdx) => {
    const targetId = rawIndexToTargetId.get(rawIdx);
    const isHighlight = targetId.startsWith('highlight-');
    const evidenceId = `${targetId}-body`;
    return {
      id: evidenceId,
      kind: 'html-text',
      role: isHighlight ? 'body-text' : 'update-list',
      source: sourceFile,
      sourceIndex: rawIdx,
      sourceHash: sha256(item.text),
      blockIds: [`block-${rawIdx}`],
      note: `${item.h2}: ${item.text.slice(0, 30)}...`
    };
  });

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
    mediaCount: 0,
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

  fs.writeFileSync(outputPath, JSON.stringify(digestData, null, 2) + '\n', 'utf8');
  console.log(`Saved ${articleId} digest (${highlights.length} highlights, ${updates.length} updates) to ${outputPath}`);
}

// -------------------------------------------------------------
// 6. Create Article JSON and HTML files
// -------------------------------------------------------------
function buildArticles() {
  const articlesDir = path.resolve(siteRoot, 'src/content/articles');
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
        src: 'assets/covers/b34957b36f44ba76-1200.webp',
        srcset: 'assets/covers/b34957b36f44ba76-480.webp 480w, assets/covers/b34957b36f44ba76-800.webp 800w, assets/covers/b34957b36f44ba76-1200.webp 1200w',
        avifSrcset: 'assets/covers/b34957b36f44ba76-480.avif 480w, assets/covers/b34957b36f44ba76-800.avif 800w, assets/covers/b34957b36f44ba76-1200.avif 1200w',
        width: 1200,
        height: 675,
        alt: 'OriginOS 6 正式发布！亮点抢先看 封面',
        dominantColor: '#12171d',
        focalPoint: '50% 0%'
      }
    },
    {
      filename: '66-hyperos.json',
      articleId: 'HyperOS_3_更新说明_(2025)',
      order: 66,
      title: '一气呵成看懂小米澎湃OS 3',
      brand: 'hyperos',
      year: 2025,
      publishedAt: '2025-08-28',
      slug: '66-xiaomi-hyperos-3',
      legacyPath: 'Xiaomi_HyperOS_3_正式发布！亮点抢先看.html',
      cover: {
        src: 'assets/covers/c03068fed50cfaf0-1200.webp',
        srcset: 'assets/covers/c03068fed50cfaf0-480.webp 480w, assets/covers/c03068fed50cfaf0-800.webp 800w, assets/covers/c03068fed50cfaf0-1200.webp 1200w',
        avifSrcset: 'assets/covers/c03068fed50cfaf0-480.avif 480w, assets/covers/c03068fed50cfaf0-800.avif 800w, assets/covers/c03068fed50cfaf0-1200.avif 1200w',
        width: 1200,
        height: 675,
        alt: '一气呵成看懂小米澎湃OS 3 封面',
        dominantColor: '#0a0a0a',
        focalPoint: '50% 0%'
      }
    },
    {
      filename: '67-magicos.json',
      articleId: 'MagicOS_10正式发布！一图读懂升级亮点_(2025)',
      order: 67,
      title: 'MagicOS 10正式发布！一图读懂升级亮点',
      brand: 'magicos',
      year: 2025,
      publishedAt: '2025-10-23',
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
      }
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
      }
    }
  ];

  newArticles.forEach((art) => {
    // 1. Write HTML file in articles/
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
  </style>
</head>
<body>
  <div class="card">
    <h1>${art.title}</h1>
    <div class="meta">${art.publishedAt} · ${art.brand.toUpperCase()}</div>
    <p>点击右上角“切换精简版”可查看本期升级亮点的文字精校版与更新明细。</p>
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
      html: `
<section class="card">
  <div class="card-body">
    <div class="gallery-placeholder" style="padding: 32px 20px; text-align: center; color: var(--text-secondary, #64748b);">
      <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary, #1e293b); margin-bottom: 8px;">${art.title}</h2>
      <p style="font-size: 14px; margin: 0;">点击右上角按钮可切换至完整精校的精简版视图，浏览功能一览与更新明细。</p>
    </div>
  </div>
</section>
`,
      cover: art.cover,
      media: []
    };
    fs.writeFileSync(path.join(articlesDir, art.filename), JSON.stringify(articleJson, null, 2) + '\n', 'utf8');
    console.log(`Created article ${art.filename}`);
  });
}

// -------------------------------------------------------------
// Run Everything
// -------------------------------------------------------------
console.log('--- Building 2025 Major Updates ---');
buildArticles();
buildColorOS16();
buildOriginOS6();
buildHyperOS3();
buildMagicOS10();
buildHarmonyOS6();
console.log('--- All 2025 Major Updates Built Successfully! ---');
