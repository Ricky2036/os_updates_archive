# 网页代码审查 — 2026-09-18

审查范围：当前实际部署的 `astro-site`、前端交互脚本、官网存档加载与代理、内容导入、依赖锁文件和 GitHub Pages 工作流。根目录旧版页面不是当前工作流的发布入口。本次未修改业务源码，未执行依赖升级或线上部署。

## 已完成的验证

- `npm run test:content`：通过，64 篇文章、18 个交互页面。
- `npm run digest:validate`：通过，25 个已校验摘要。
- `npm run check`：0 errors、0 warnings、4 hints。
- `npm run build`：通过，81 个页面；本地约 2 分 19 秒。
- 随构建运行的预算检查：JS gzip 16.0 KB、CSS gzip 10.5 KB、首页壳体 gzip 29.4 KB；脚本估算首页资源 611.0 KB。这不是浏览器实测流量或 Lighthouse 分数。
- 临时本地服务 + 无头 Chrome 定向复现：导航高亮错位、首次访问 SW 未接管、子框架访问父文档、JSONP 原样回显、404 被判成功。测试阻断了浏览器对外请求；SW 首次下载人为延迟 1.2 秒以验证竞态。
- `npm audit --json`：7 个受影响依赖，1 critical、5 high、1 moderate。结果代表依赖数据库命中，不等于每项在当前网站均可利用。
- 未运行完整 `test:browser`，未执行线上压力测试、全量官网页面交互回归或真实移动设备帧率测试。

## 需要优先修复

### 1. [P1] Astro / Sharp 锁定了已知受影响版本

位置：`astro-site/package-lock.json:2333`、`:4208`；图片处理入口例见 `astro-site/scripts/migrate-legacy.mjs:80`。

锁文件为 Astro 7.2.0、Sharp 0.35.3。审计命中 AVIF 图片处理可能导致代码执行的公告。项目会用 Sharp 解码导入图片，因此需要把不可信图片进入处理链作为风险边界。当前 `output: static`，不能据此断言已上线静态站存在远程图片处理接口。

建议：至少升级至公告修复版本 Astro 7.2.8、Sharp 0.35.4，更新锁文件后复跑内容检查、图片生成和构建。其他受影响包包括 devalue、fast-uri、js-yaml、nanoid、svgo，应一起核实依赖链并升级；不要仅执行破坏性的强制升级。

依据：[Astro 安全公告](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)。

### 2. [P1] 同源存档 iframe 没有形成脚本隔离边界

位置：`astro-site/src/pages/originos/[official].astro:74` 的 sandbox；`astro-site/src/pages/hyperos/[official].astro`、ColorOS/MagicOS 同类模板；`astro-site/src/pages/[brand]/[year]/[slug].astro:59`。

本地存档与主站同源，同时允许 `allow-scripts allow-same-origin`。在 HyperOS 3 存档 iframe 内执行只读验证，成功读取父页标题，并可访问 `frameElement`。因此被导入的脚本具有访问父页面 DOM 和同源存储的能力；任何存档脚本被污染或存在可利用注入点时，风险会扩散到主站。这是确认的隔离缺失，尚未发现现实攻击行为。

建议：把执行脚本的历史存档部署到独立 origin，主站只通过校验来源和来源窗口的 postMessage 通信；无法拆域的页面评估移除 `allow-same-origin`，并验证其脚本兼容性。按功能收紧 forms、popups、downloads 等权限。单纯删除脚本标签的正则清洗也不覆盖事件属性和危险 URL。

依据：[MDN iframe sandbox 说明](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox)。

### 3. [P1] 当前发布产物超过 GitHub Pages 容量限制

位置：`.github/workflows/deploy-astro.yml:50`；`astro-site/scripts/performance-budget.mjs:11`。

Git 跟踪的 public 文件共 21,068 个，总计 4,534,539,987 字节，约 4.22 GiB；并非仅本地未跟踪缓存。工作流直接上传整个 dist。GitHub Pages 已发布站点上限为 1 GB，当前构建策略不符合该限制。

预算脚本直接跳过 official_archives 等目录，打印的 429.1 MB 不代表完整产物大小，也不会拦住此问题。1.6 GB 级的 HyperOS 媒体和约 800 MB 级的 Honor 目录是主要来源。

建议：扩展已有 R2 存档方案，将官网 HTML/JS/媒体统一放到独立存档 origin；从主站 public 移走不应随站点复制的资源。CI 单独增加完整部署包体积上限，与首屏加载预算分开统计。

依据：[GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)。

### 4. [P1] 存档资源路径没有适配生产子目录

位置：`.github/workflows/deploy-astro.yml:42`；`astro-site/public/official_archives/os3.hyperos.mi.com/index.html:1`；`astro-site/public/sw.js:35`。

部署配置为 `/os_updates_archive/`，但 HyperOS 3 HTML 中有 53 个 src/href 以站点根路径开头。例如 `/official_archives/os3.hyperos.mi.com/_next/static/css/de115189631bb155.css`。资源实际发布在 `/os_updates_archive/official_archives/...` 下；Astro 的 base 不会自动改写 public 中的原始 HTML。SW 也没有处理 `/official_archives/` 这一错误前缀。

结果：在工作流指定的子目录部署下，请求落到错误路径，CSS/JS 可能 404。根路径本地测试无法覆盖。

建议：优先让存档在独立 origin 根路径服务；否则在存档准备阶段统一处理 HTML、CSS 和 JS 中的路径。增加生产 base 的静态服务测试，禁止测试服务器提供生产中不存在的回退。

### 5. [P2] Service Worker 尚未控制页面时就加载存档

位置：`astro-site/src/pages/hyperos/[official].astro:35` 及尾部 `load()`；其他官网模板同类逻辑。

注册调用未等待成功或 controllerchange，页面立即给 iframe 设置 src。冷启动实测 iframe 已有存档地址时 `navigator.serviceWorker.controller === null`。需要 SW 改写的初始请求可能直接到不存在的本地地址或原站，之后 claim 也不会自动重试已经失败的请求。

建议：消除对首次请求代理的依赖，提前改写存档资源地址；确需 SW 时等待当前页面受控后再加载，并处理注册失败/超时。仅等待 `ready` 不能替代确认当前页面的 controller。测试使用全新浏览器上下文。

### 6. [P2] JSONP callback 未验证即拼接为 JavaScript

位置：`astro-site/public/sw.js:84`。

验证请求 `callback=globalThis.__reviewProbe=1;//` 得到 JavaScript 响应 `globalThis.__reviewProbe=1;//({"code":0,"data":{}})`。路径规则未限定域名或请求类型，还使用了宽泛的 `includes('vmonitor')`。

这是确认的代码拼接入口；要变成实际脚本执行，仍需要页面把可控 URL 作为脚本加载，当前未证明公开可达的端到端 XSS 链路，不应宣称任意访客可直接接管网站。

建议：能移除 JSONP 则移除；必须保留时使用明确允许的 callback 名称或严格的标识符/成员访问语法校验，并限定请求 origin、路径、GET 方法和用途。SW 域名匹配另应从 `includes(domain)` 改成精确匹配或受控子域匹配。

### 7. [P2] 版本菜单与高亮逻辑已经不同步

位置：`astro-site/public/scripts/archive-ui.js:103`、`:117`；菜单结构见 `astro-site/src/components/SiteHeader.astro:55`。

ColorOS 菜单新增 17 后，脚本仍把第 0/1/2 项当成 15/16/月更；OriginOS 新增 7 后仍把第 0/1 项当成 6/月更。Chrome 在月更页复现 OriginOS 6 和月更记录同时 active。

此外，首页检测只认 `/` 和特定 index.html，不认生产首页 `/os_updates_archive/`，会清除首页高亮。

建议：每个菜单使用稳定的 section 标识，由同一份数据生成模板和激活规则；路径判断先剥离 base。补充“恰有一个正确菜单项激活”的断言。

### 8. [P2] iframe 404 被当成成功加载

位置：`astro-site/src/pages/coloros/[official].astro:101`；其余三个官网模板同类 load 处理。

所有 iframe load 都直接标记 loaded 并撤掉错误提示。Chrome 将 frame 指向返回 404 的页面后，外壳仍为 `loaded: true, errorHidden: true`。浏览器 load 事件并不证明内容成功加载。

建议：存档页面初始化成功后发出 ready 消息，父页面验证 source、origin 和消息格式再显示成功；404 或脚本初始化失败维持可重试状态。

依据：[MDN iframe load 行为](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#error_and_load_event_behavior)。

### 9. [P2] SPA 页面切换未清理延迟导航和动画回调

位置：`astro-site/public/scripts/archive-ui.js:70`、`:848`、`:1007`。

AbortController 仅取消带 signal 的监听器和显式清理的 observer；上拉导航的 wheelEndTimeout、180ms 跳转计时器及翻转动画计时器没有注册清理。若在旧页计时器执行前切换页面，旧闭包仍可能发起 nextUrl 跳转或修改新页面全局 class。此项由生命周期代码确认，尚未做自动化竞态复现。

建议：在 astro:before-swap/abort 时统一清除 timer、RAF；所有异步回调先判断 signal.aborted。把初始化、销毁作为对称生命周期管理。

### 10. [P2，条件性] 未版本化脚本配置一年 immutable 缓存

位置：`astro-site/public/_headers:7`；`astro-site/src/layouts/BaseLayout.astro` 的 archive-ui.js 引用。

脚本固定名为 `/scripts/archive-ui.js`，但规则配置一年 immutable。若部署平台应用此文件，HTML 更新后仍可能配旧脚本，导航或交互修复不能及时抵达已有用户。当前工作流本身没有把该文件转成 HTTP 响应头的步骤，本次也未验证线上实际响应头；因此不能宣称 GitHub Pages 当前已经使用一年缓存。

建议：通过 Astro/Vite 导入并生成带内容哈希的脚本；只有哈希资源使用 immutable，固定名入口使用重验证。验证部署后的实际 Cache-Control，而不是只看配置文件。

### 11. [P2] 生产分享图片 URL 会重复 base

位置：`astro-site/src/layouts/BaseLayout.astro:31`。

生产 siteUrl 已包含 `/os_updates_archive`，assetPath 又返回 `/os_updates_archive/assets/...`，去掉前导斜杠后再以 siteUrl 拼接，形成 `/os_updates_archive/os_updates_archive/assets/...`。影响 og:image 和 JSON-LD image。

建议：已含 base 的绝对路径相对站点 origin 解析；外部图片 URL 保持原样。另将 site.webmanifest 的 start_url、icons.src 从固定 `/` 改为适配 base 的地址。

## 性能与工程改进（需要测量后决定投入）

- 主站 JS/CSS 体积目前合理，优先解决部署体积与存档资源，不需要为了体积重写框架。
- `CoverPicture.astro:10` 对所有用途使用桌面 720px 的 sizes，小卡片也如此，可能在高 DPR 下选到过大资源。按实际网格宽度传入 sizes，再测选中资源和传输字节。
- `global.css:14` 起的八个长期动画光斑，叠加 blur、多个 backdrop-filter 及长文章上的 will-change，可能增加移动端合成开销。尚无帧率/显存测量，不能断言已经卡顿；建议低端设备录制 Performance trace 后减少装饰层。
- `archive-ui.js:240` 打开菜单后持续 RAF 读布局并写样式，可改为 scroll/resize 事件驱动并在 abort 时取消。
- 性能预算只扫描首页 src/href，没有覆盖 srcset 实际选择、运行时请求或存档首屏，建议增加按路由的真实资源统计。
- CI 使用 npm install，且只运行 build；应改为 npm ci，接入内容校验、检查、生产 base 浏览器测试和依赖审计。现有浏览器测试为 R2/API 和部分缺失路径提供 mock/fallback，不宜当成生产官网存档可用性的证明。
- `set:html` 的数据均来自仓库构建内容，本次未发现公开写入入口，不把它直接报成可利用 XSS；但未来扩大内容导入来源时，应使用 HTML 解析器和允许列表清洗，JSON-LD 序列化转义 `<`。

推荐实施顺序：修补依赖 → 存档独立 origin 与部署减重 → 修复 base 路径 → 修复 SW/iframe 就绪判断 → 导航和生命周期 → 缓存与精细性能优化。
