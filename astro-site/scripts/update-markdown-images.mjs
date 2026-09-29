import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = path.resolve(import.meta.dirname, '../..');
const articlesDir = path.resolve(workspaceRoot, 'articles');

function updateMarkdown(filename, inserter) {
  const filePath = path.join(articlesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  content = inserter(content);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated images in ${filename}`);
}

// 1. ColorOS 16
updateMarkdown('ColorOS_16_更新说明.md', (content) => {
  // Top image
  content = content.replace(
    /(\*\*更新版本\*\*：[^\n]+\n\n)/,
    `$1![ColorOS 16 发布会全景精华](/assets/digests-2025/coloros/coloros16-summary.webp)\n\n`
  );
  // System section
  content = content.replace(
    /(- 新增 极光引擎光场动效与自然涟漪视效[^\n]+\n)/,
    `$1\n![极光引擎无缝位移动效演示](/assets/digests-2025/coloros/seamless-motion-poster.webp)\n![极光视效高阶粒子与光影视效](/assets/digests-2025/coloros/aurora-visuals-poster.webp)\n`
  );
  // AI section
  content = content.replace(
    /(- 新增 小布记忆全新详情视图[^\n]+\n)/,
    `$1\n![小布建议 AI 晨间简报](/assets/digests-2025/coloros/xiaobu-briefing.webp)\n![打通小布记忆跨服务协同](/assets/digests-2025/coloros/xiaobu-cross.webp)\n![AI 实景对话指哪问哪演示](/assets/digests-2025/coloros/ai-dialog-poster.webp)\n`
  );
  // Design section
  content = content.replace(
    /(- 新增 全新光场设计[^\n]+\n)/,
    `$1\n![全新光场质感设计演示](/assets/digests-2025/coloros/light-design-poster.webp)\n![灵感桌面多变大文件夹演示](/assets/digests-2025/coloros/desktop-folder-poster.webp)\n![AI 实况动态壁纸演示](/assets/digests-2025/coloros/live-wallpaper-poster.webp)\n`
  );
  // Interconnect section
  content = content.replace(
    /(- 新增 跨生态手表互联[^\n]+\n)/,
    `$1\n![Apple Watch 查看流体云信息](/assets/digests-2025/coloros/apple-watch-fluid.webp)\n![跨生态 iOS 备忘录换机搬家](/assets/digests-2025/coloros/memo-migration.webp)\n![碰一碰极速互传](/assets/digests-2025/coloros/touch-share.webp)\n`
  );
  // Pad
  content += `\n\n## 大屏协同\n\n![ColorOS For Pad 大屏生态](/assets/digests-2025/coloros/coloros-pad.webp)\n`;
  return content;
});

// 2. OriginOS 6
updateMarkdown('OriginOS_6_更新说明.md', (content) => {
  content = content.replace(
    /(\*\*更新版本\*\*：[^\n]+\n\n)/,
    `$1![OriginOS 6 发布会全景精华](/assets/digests-2025/originos/originos6-summary.webp)\n\n`
  );
  content = content.replace(
    /(- 新增 边缘光、增强光、弥散光等光效[^\n]+\n)/,
    `$1\n![桌面光影空间设计动效](/assets/digests-2025/originos/ambient-desktop-poster.webp)\n![控制中心渐进模糊效果](/assets/digests-2025/originos/blur-control-poster.webp)\n`
  );
  content = content.replace(
    /(- 新增 锁屏通知显示方式[^\n]+\n)/,
    `$1\n![通知中心与锁屏堆叠效果](/assets/digests-2025/originos/stack-layers.webp)\n`
  );
  content = content.replace(
    /(- 新增 桌面与多任务并行打断动效[^\n]+\n)/,
    `$1\n![原子动效桌面弹性手势演示](/assets/digests-2025/originos/elastic-motion-poster.webp)\n![负一屏一镜到底过渡动效](/assets/digests-2025/originos/shelf-one-shot-poster.webp)\n![充电动效与水波涟漪特效](/assets/digests-2025/originos/ripple-charging-poster.webp)\n`
  );
  content = content.replace(
    /(- 新增 小V圈搜[^\n]+\n)/,
    `$1\n![小V圈搜屏幕服务直达](/assets/digests-2025/originos/v-circle-search.webp)\n![Live Photo 逐帧路人消除](/assets/digests-2025/originos/livephoto-erase-poster.webp)\n`
  );
  content = content.replace(
    /(- 新增 摇一摇群组分享[^\n]+\n)/,
    `$1\n![iPad 跨端投屏与互联演示](/assets/digests-2025/originos/ipad-connect.webp)\n![微电精灵极限续航模式](/assets/digests-2025/originos/micro-power-poster.webp)\n`
  );
  return content;
});

// 3. HyperOS 3
updateMarkdown('HyperOS_3_更新说明.md', (content) => {
  content = content.replace(
    /(\*\*软件版本\*\*：[^\n]+\n\n)/,
    `$1![小米澎湃OS 3 发布会全景精华](/assets/digests-2025/hyperos/hyperos3-summary.webp)\n\n`
  );
  content = content.replace(
    /(- 性能优化从OS2的聚焦调度策略优化深入到OS3的编译级优化\n)/,
    `$1\n![应用启动响应时延量化对比](/assets/digests-2025/hyperos/launch-latency.webp)\n![重载游戏运行帧率曲线提升](/assets/digests-2025/hyperos/fps-curve.webp)\n![热点函数底层编译优化](/assets/digests-2025/hyperos/compile-opt.webp)\n![渲染负载与能效优化](/assets/digests-2025/hyperos/render-load.webp)\n`
  );
  content = content.replace(
    /(- 动画在全场景跟手顺滑[^\n]+\n)/,
    `$1\n![负一屏打开多任务丝滑跟手](/assets/digests-2025/hyperos/multitask-smooth-poster.webp)\n![文件管理一镜到底打开动效](/assets/digests-2025/hyperos/file-one-shot-poster.webp)\n`
  );
  content = content.replace(
    /(- 灵动细节动效丰富[^\n]+\n)/,
    `$1\n![类 iOS 主副岛形态设计](/assets/digests-2025/hyperos/island-design.webp)\n![主副岛切换丝滑流畅可打断](/assets/digests-2025/hyperos/island-switch-poster.webp)\n![超级岛系统与三方服务矩阵](/assets/digests-2025/hyperos/island-services.webp)\n`
  );
  content = content.replace(
    /(- 电影感锁屏动态效果能力进一步提升[^\n]+\n)/,
    `$1\n![电影感锁屏动态效果与景深](/assets/digests-2025/hyperos/cinema-lockscreen-poster.webp)\n![高度可变字体与左右布局时钟](/assets/digests-2025/hyperos/variable-clock.webp)\n![AI 风格化动态壁纸生成](/assets/digests-2025/hyperos/ai-wallpaper.webp)\n![桌面图标细节设计跟进](/assets/digests-2025/hyperos/desktop-icons.webp)\n`
  );
  content = content.replace(
    /(- 支持手机应用在电脑端使用大屏版本[^\n]+\n)/,
    `$1\n![iPhone 双持跨设备消息通知](/assets/digests-2025/hyperos/iphone-notify.webp)\n![Mac 与小米跨生态协同界面](/assets/digests-2025/hyperos/mac-collab.webp)\n`
  );
  content = content.replace(
    /(- 根据圈选的内容给出结果[^\n]+\n)/,
    `$1\n![大模型语义理解一步直达](/assets/digests-2025/hyperos/xiaoai-direct.webp)\n![小爱圈屏智能识别与百科搜索](/assets/digests-2025/hyperos/xiaoai-circle-poster.webp)\n`
  );
  content = content.replace(
    /(- 手机离线也能通过广播[^\n]+\n)/,
    `$1\n![照片文件选择性分享安全控件](/assets/digests-2025/hyperos/safe-access.webp)\n![关机离线广播定位查找](/assets/digests-2025/hyperos/poweroff-find.webp)\n`
  );
  return content;
});

// 4. MagicOS 10
updateMarkdown('MagicOS_10_更新说明.md', (content) => {
  content = content.replace(
    /(\*\*软件版本\*\*：[^\n]+\n\n)/,
    `$1![MagicOS 10 发布会全景精华](/assets/digests-2025/magicos/magicos10-summary-1.webp)\n![MagicOS 10 核心升级全景](/assets/digests-2025/magicos/magicos10-summary-2.webp)\n![MagicOS 10 架构全景](/assets/digests-2025/magicos/magicos10-summary-3.webp)\n\n`
  );
  content = content.replace(
    /(- 新增密码解锁、控制中心等按压通透光感效果。\n)/,
    `$1\n![全新通透模式卡片质感演示](/assets/digests-2025/magicos/translucent-mode-poster.webp)\n![控制中心按压通透光感演示](/assets/digests-2025/magicos/light-touch-poster.webp)\n![个性主题基于壁纸自动布局](/assets/digests-2025/magicos/auto-wallpaper-poster.webp)\n![摇摇乐系列重力感应互动主题](/assets/digests-2025/magicos/interactive-theme-poster.webp)\n`
  );
  content = content.replace(
    /(- 优化应用安装速度。\n)/,
    `$1\n![Turbo X 性能平台架构与无损压缩](/assets/digests-2025/magicos/turbo-x-platform.webp)\n`
  );
  content = content.replace(
    /(- 新增 AI 帮记功能[^\n]+\n)/,
    `$1\n![YOYO 智能收藏与一键原文跳转](/assets/digests-2025/magicos/yoyo-memory-poster.webp)\n![YOYO 一句话完成复杂跨应用操作](/assets/digests-2025/magicos/yoyo-auto-exec-poster.webp)\n`
  );
  content = content.replace(
    /(- 新增与 macOS、Windows 互传功能[^\n]+\n)/,
    `$1\n![NFC 一碰传支持 iPhone 高速互传](/assets/digests-2025/magicos/cross-share.webp)\n`
  );
  return content;
});

// 5. HarmonyOS 6
updateMarkdown('HarmonyOS_6_更新说明.md', (content) => {
  content = content.replace(
    /(\*\*软件版本\*\*：[^\n]+\n\n)/,
    `$1![HarmonyOS 6 发布会全景精华](/assets/digests-2025/harmonyos/harmonyos6-summary-1.webp)\n![HarmonyOS 6 亮点全景图](/assets/digests-2025/harmonyos/harmonyos6-summary-2.webp)\n\n`
  );
  content = content.replace(
    /(- 当唤醒小艺、使用小艺输入法或华为分享碰一碰等操作时[^\n]+\n)/,
    `$1\n![唤醒小艺与碰一碰通透色彩光感](/assets/digests-2025/harmonyos/smart-light-color.webp)\n`
  );
  content = content.replace(
    /(- 智慧美学构图可为您自动匹配签名文字并融合壁纸风格[^\n]+\n)/,
    `$1\n![拍摄书法字体智能提取生成签名](/assets/digests-2025/harmonyos/signature-camera-poster.webp)\n![锁屏艺术签名个性搭配演示](/assets/digests-2025/harmonyos/signature-style-poster.webp)\n![智能壁纸主体识别与自适应布局](/assets/digests-2025/harmonyos/wallpaper-compose-poster.webp)\n`
  );
  content = content.replace(
    /(- 使用“精致毛球的一天”主题[^\n]+\n)/,
    `$1\n![元气心情主题 3D 表情互动](/assets/digests-2025/harmonyos/mood-emoji-poster.webp)\n![毛球主题语音互动与磁吸彩蛋](/assets/digests-2025/harmonyos/fluffy-ball-poster.webp)\n`
  );
  content = content.replace(
    /(- 在键鼠共享状态下，只需按下 Ctrl 键并注视目标设备[^\n]+\n)/,
    `$1\n![注视目标设备瞬移流转与一碰分享](/assets/digests-2025/harmonyos/eye-hand-flow-poster.webp)\n`
  );
  content = content.replace(
    /(- 1\. 小艺帮帮忙[^\n]+\n)/,
    `$1\n![超级小艺复杂任务拆解与后台执行](/assets/digests-2025/harmonyos/super-xiaoyi.webp)\n`
  );
  content = content.replace(
    /(- 1\. AI 一键成片可选择多张图片智能搭配运镜[^\n]+\n)/,
    `$1\n![AI 人像精修智能补光与调色](/assets/digests-2025/harmonyos/ai-portrait-retouch.webp)\n![AI 一键成片多图自动运镜成片](/assets/digests-2025/harmonyos/ai-photo-to-video.webp)\n`
  );
  content = content.replace(
    /(- 1\. 与陌生人通话时[^\n]+\n)/,
    `$1\n![AI 通话涉诈智能检测与提醒](/assets/digests-2025/harmonyos/anti-fraud-call.webp)\n![亲情防诈与远程防御挂断](/assets/digests-2025/harmonyos/anti-fraud-alert.webp)\n![AI 智能防窥自动隐藏敏感内容](/assets/digests-2025/harmonyos/peep-proof-poster.webp)\n`
  );
  content = content.replace(
    /(- 3\. 华为方舟引擎针对部分头部游戏进行深度优化[^\n]+\n)/,
    `$1\n![方舟引擎整机性能与应用秒启秒开](/assets/digests-2025/harmonyos/ark-engine.webp)\n`
  );
  return content;
});

console.log('--- All Markdown Files Updated with Images! ---');
