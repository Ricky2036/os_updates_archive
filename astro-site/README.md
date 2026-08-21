# OS 档案馆 · Astro 重构版

这是旧站旁路重构后的生产版本。旧站根目录保持不变，所有实现、生成内容和测试都位于 `astro-site`。

## 已实现

- Astro Content Collections 管理 29 篇文章，schema 校验标题、日期、品牌、路由、封面、媒体和旧地址。
- 13 篇普通图文文章独立静态生成；16 篇富交互文章通过 sandbox 兼容页恢复原 HTML、SVG、横向滚动、脚本和动图。
- 编辑型档案馆首页、ColorOS/OriginOS 双入口、独立 16:9 AVIF/WebP 封面和近期档案卡片。
- ColorOS 导航提供 ColorOS 15、ColorOS 16 官方网站离线存档与月更记录三个入口；桌面支持悬停/键盘菜单，移动端使用底部弹出菜单。
- 两套官方离线站通过沉浸式站内路由加载，按 390/768/桌面视口分别选择 mobile、pad、desktop 入口，不把 1.1GB 资源打入主站。
- 960px 以下无障碍抽屉目录，支持遮罩、焦点循环、Escape、页面滚动锁定、搜索结果统计和 `/` 快捷键。
- ColorOS 16 媒体清单共 59 个视频引用；本地确认 30 个可用、29 个缺失。缺失资源使用明确占位，不再静默黑屏。
- 旧 `articles/*.html` 和首页 hash 地址兼容跳转。
- 页面切换、渐入动画、懒加载、减少动态效果支持，以及逐路由性能预算。
- 内容完整性、29 路由爬行、移动目录、搜索、交互 iframe 和四档响应式自动化测试。

## 开发与验证

```bash
npm install
npm run migrate
npm run dev
```

旧站文章或资源更新后重新运行 `npm run migrate`。迁移不会修改根目录旧站，只会重建 `astro-site` 内的内容、兼容页和媒体清单。

完整验收：

```bash
npm run verify
```

它依次检查内容完整性、Astro 类型、生产构建、性能预算和真实浏览器交互。浏览器测试默认使用 macOS Chrome，也可通过 `PUPPETEER_EXECUTABLE_PATH` 指定浏览器。

## 部署配置

主站保持静态输出。根域部署无需额外配置；GitHub Pages 项目路径部署示例：

```bash
PUBLIC_SITE_URL=https://ricky2036.github.io/os_updates_archive \
PUBLIC_BASE_PATH=/os_updates_archive/ \
npm run build
```

大型视频和完整 ColorOS 16 微站不进入主站产物。配置媒体 CDN 后，文章页会自动开放完整体验和已归档视频：

```bash
PUBLIC_MEDIA_BASE_URL=https://media.example.com/coloros16 npm run build
```

媒体域名应保留 `video/...` 路径和 `coloros16/` 体验入口，并支持 MP4 字节范围请求、正确 MIME、CORS 与不可变缓存。未配置媒体域名时主站保持轻量，同时显示已归档和缺失数量。

## ColorOS 15/16 官方网站存档

原始归档默认从 `/Users/jingzhan.chen/Workbuddy/OS网页存档` 只读导入，也可通过 `OFFICIAL_ARCHIVE_SOURCE` 指定其他位置。整理过程会删除统计脚本、补齐已归档的导航配置、修复 ColorOS 15/16 内部链接，并在忽略目录 `.official-archive-dist` 中生成带 SHA-256 的发布清单：

```bash
npm run archive:prepare
npm run archive:verify
npm run archive:serve
```

开发环境未设置 `PUBLIC_OFFICIAL_ARCHIVE_BASE_URL` 时自动使用 `http://127.0.0.1:8765/v2026-07-30`。生产环境使用：

```bash
PUBLIC_OFFICIAL_ARCHIVE_BASE_URL=https://pub-677d8b9c16d84df684f908214461d60a.r2.dev/v2026-07-30 npm run build
```

R2 桶名为 `os-official-archives`。创建仅允许读取/写入该桶的 S3 API 凭据并设置 `R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY` 后上传：

```bash
npm run archive:upload
```

当前免费部署使用 Bucket 的 `r2.dev` 公共开发地址；允许来自主站的 `GET`、`HEAD` 和 `Range` 请求，并暴露 `Accept-Ranges`、`Content-Range`、`Content-Length`。归档对象自带 MIME 与缓存头，HTML 使用短缓存，其他版本化资源使用一年不可变缓存。`r2.dev` 存在限流，后续如有自定义域名可只替换 `PUBLIC_OFFICIAL_ARCHIVE_BASE_URL`。

迁移中的缺失或零字节资源记录在 `public/manifests/migration-report.json`，不得通过空异常处理忽略。

## 月更精简版

24 篇月更档案（ColorOS 15 篇、OriginOS 9 篇）使用 `src/content/monthly-digests` 中经过审核的结构化数据。候选提取结果和并列复核报告只写入已忽略的 `.monthly-work`，不会直接进入生产内容：

```bash
npm run digest:extract -- --all
npm run digest:media
npm run digest:report
npm run digest:publish
npm run digest:validate
```

也可以用 `npm run digest:extract -- --article <articleId>` 重提单篇。正式数据必须为 `verified`，并通过源文件哈希、证据坐标、媒体路径和防误提取样例校验后才能构建。
