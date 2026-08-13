import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(site, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.gif': 'image/gif', '.mp4': 'video/mp4' };
const server = http.createServer(async (request, response) => {
  try {
    const url = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.join(dist, url.replace(/^\/+/, ''));
    if (url.endsWith('/')) file = path.join(file, 'index.html');
    if (!path.extname(file) && !fsSync.existsSync(file)) file = path.join(file, 'index.html');
    const bytes = await fs.readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(bytes);
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let browser;

try {
  browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname === 'official.osarchive.com') {
      request.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><html><body><main data-official-fixture>ColorOS official archive</main></body></html>' });
    } else request.continue();
  });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? '';
    if (!reason.includes('ERR_ABORTED')) errors.push(`Request failed (${reason}): ${request.url()}`);
  });
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });

  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    const response = await page.goto(`${origin}/`, { waitUntil: 'networkidle0' });
    if (!response?.ok()) throw new Error(`Homepage returned ${response?.status()}`);
    const layout = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: innerWidth, feature: document.querySelector('.editorial-feature')?.getBoundingClientRect().height ?? 0, menu: Boolean(document.querySelector('.menu-button')) }));
    if (layout.body > layout.viewport + 1) throw new Error(`Horizontal overflow at ${width}px: ${layout.body}/${layout.viewport}`);
    if (layout.feature > 760) throw new Error(`Homepage feature is too tall at ${width}px: ${layout.feature}`);
    if (layout.menu) throw new Error('Homepage rendered an orphan archive menu button');
  }

  await page.hover('[data-coloros-trigger]');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-coloros-submenu]')).opacity === '1');
  const desktopHomeTab = await page.$eval('.home-tab', (element) => ({ visible: getComputedStyle(element).display !== 'none', active: element.classList.contains('active'), hoverLine: getComputedStyle(element, '::after').backgroundImage }));
  if (!desktopHomeTab.visible || !desktopHomeTab.active || desktopHomeTab.hoverLine === 'none') throw new Error(`Homepage tab is missing its active or hover treatment: ${JSON.stringify(desktopHomeTab)}`);
  if (await page.$eval('[data-coloros-trigger] i', (element) => getComputedStyle(element).display !== 'none')) throw new Error('ColorOS dropdown arrow is still visible');
  const desktopColorOSMenu = await page.$$eval('[data-coloros-submenu] a', (items) => items.map((item) => ({ text: item.textContent.trim(), path: new URL(item.href).pathname })));
  if (desktopColorOSMenu.map((item) => item.text).join('|') !== 'ColorOS 15|ColorOS 16|月更记录') throw new Error(`Desktop ColorOS menu is incomplete: ${JSON.stringify(desktopColorOSMenu)}`);
  if (!await page.$$eval('[data-coloros-submenu] a', (items) => items.every((item) => getComputedStyle(item).textAlign === 'center'))) throw new Error('ColorOS submenu labels are not centered');
  await page.focus('[data-coloros-trigger]');
  await page.keyboard.press('ArrowDown');
  if (await page.evaluate(() => document.activeElement?.textContent?.trim()) !== 'ColorOS 15') throw new Error('Desktop ColorOS menu did not move focus with ArrowDown');
  await page.keyboard.press('Escape');
  if (await page.$eval('[data-coloros-trigger]', (element) => element.getAttribute('aria-expanded')) !== 'false') throw new Error('Desktop ColorOS menu did not close with Escape');
  await page.click('[data-coloros-trigger]');
  await page.waitForFunction(() => location.pathname.includes('/coloros/2026/01-oppo-coloros-2026/'));
  if (!page.url().includes('/coloros/2026/01-oppo-coloros-2026/')) throw new Error(`Desktop ColorOS tab did not open monthly updates: ${page.url()}`);
  const desktopNavBeforeScroll = await page.$eval('.brand-switcher', (element) => element.getBoundingClientRect().top);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const desktopNavAfterScroll = await page.$eval('.brand-switcher', (element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, visible: rect.top >= 0 && rect.bottom <= innerHeight, position: getComputedStyle(element).position };
  });
  if (desktopNavAfterScroll.position !== 'fixed' || !desktopNavAfterScroll.visible) throw new Error(`Desktop brand tabs do not stay pinned: ${JSON.stringify({ desktopNavBeforeScroll, desktopNavAfterScroll })}`);

  await page.setViewport({ width: 390, height: 820 });
  await page.goto(`${origin}/originos/2026/21-originos-6/`, { waitUntil: 'networkidle0' });
  await page.click('[data-coloros-trigger]');
  await page.waitForFunction(() => location.pathname.includes('/coloros/2026/01-oppo-coloros-2026/'));
  if (!page.url().includes('/coloros/2026/01-oppo-coloros-2026/')) throw new Error(`Mobile ColorOS tab did not open the latest monthly update: ${page.url()}`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const mobileTabs = await page.$eval('.brand-switcher', (element) => ({ bottom: element.getBoundingClientRect().bottom, viewport: innerHeight, position: getComputedStyle(element).position }));
  if (mobileTabs.position !== 'fixed' || mobileTabs.bottom > mobileTabs.viewport || mobileTabs.viewport - mobileTabs.bottom > 40) throw new Error(`Mobile brand tabs do not stay near the viewport bottom: ${JSON.stringify(mobileTabs)}`);
  await page.click('.menu-button');
  if (!await page.$eval('#archive-nav', (element) => element.classList.contains('open'))) throw new Error('Mobile archive drawer did not open');
  await page.keyboard.press('Escape');
  if (await page.$eval('#archive-nav', (element) => element.classList.contains('open'))) throw new Error('Mobile archive drawer did not close with Escape');
  if (await page.$('[data-archive-search]')) throw new Error('Removed archive search is still rendered');

  for (const width of [390, 551, 760]) {
    await page.setViewport({ width, height: 820, deviceScaleFactor: 1 });
    await page.goto(`${origin}/originos/2026/21-originos-6/`, { waitUntil: 'networkidle0' });
    const mobileTabGeometry = await page.evaluate(() => {
      const nav = document.querySelector('.brand-switcher').getBoundingClientRect();
      const tabs = [...document.querySelectorAll('.brand-switcher > a, .brand-switcher > .coloros-menu')].map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, centerY: rect.top + rect.height / 2 };
      });
      const labels = [...document.querySelectorAll('.brand-switcher > a, .brand-switcher > .coloros-menu > .brand-tab')].map((element) => {
        const tab = element.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(element.querySelector('span') ?? element);
        const label = range.getBoundingClientRect();
        return {
          display: getComputedStyle(element).display,
          tabCenterY: tab.top + tab.height / 2,
          labelCenterY: label.top + label.height / 2,
        };
      });
      const active = document.querySelector('.brand-switcher > a.active, .coloros-menu.active .brand-tab').getBoundingClientRect();
      return { nav: { left: nav.left, right: nav.right, top: nav.top, bottom: nav.bottom }, tabs, labels, active: { left: active.left, right: active.right, top: active.top, bottom: active.bottom } };
    });
    const widths = mobileTabGeometry.tabs.map((tab) => tab.width);
    const centers = mobileTabGeometry.tabs.map((tab) => tab.centerY);
    if (Math.max(...widths) - Math.min(...widths) > .5 || Math.max(...centers) - Math.min(...centers) > .5) throw new Error(`Mobile tabs are not equal and aligned at ${width}px: ${JSON.stringify(mobileTabGeometry)}`);
    if (mobileTabGeometry.labels.some((label) => label.display !== 'flex' && label.display !== 'inline-flex') || mobileTabGeometry.labels.some((label) => Math.abs(label.tabCenterY - label.labelCenterY) > 1)) throw new Error(`Mobile tab labels are not vertically centered at ${width}px: ${JSON.stringify(mobileTabGeometry)}`);
    if (mobileTabGeometry.tabs.some((tab) => tab.left < mobileTabGeometry.nav.left || tab.right > mobileTabGeometry.nav.right) || mobileTabGeometry.active.left < mobileTabGeometry.nav.left || mobileTabGeometry.active.right > mobileTabGeometry.nav.right || mobileTabGeometry.active.top < mobileTabGeometry.nav.top || mobileTabGeometry.active.bottom > mobileTabGeometry.nav.bottom) throw new Error(`Mobile tab escapes its container at ${width}px: ${JSON.stringify(mobileTabGeometry)}`);
  }

  for (const width of [768, 840, 960]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${origin}/originos/2026/21-originos-6/`, { waitUntil: 'networkidle0' });
    const tabletHeader = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('.brand-switcher > a, .brand-switcher > .coloros-menu > .brand-tab')];
      const centers = tabs.map((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      const nav = document.querySelector('.brand-switcher').getBoundingClientRect();
      const menu = document.querySelector('.menu-button').getBoundingClientRect();
      return { centers, navRight: nav.right, menuLeft: menu.left, gap: menu.left - nav.right };
    });
    if (Math.max(...tabletHeader.centers) - Math.min(...tabletHeader.centers) > .5) throw new Error(`Brand tabs are vertically misaligned at ${width}px: ${JSON.stringify(tabletHeader)}`);
    if (tabletHeader.gap < 8) throw new Error(`Brand tabs overlap the archive menu at ${width}px: ${JSON.stringify(tabletHeader)}`);
  }

  for (const [width, expectedEntry] of [[390, 'mobile.html'], [768, 'pad.html'], [1440, 'index.html']]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    const response = await page.goto(`${origin}/coloros/15/`, { waitUntil: 'networkidle0' });
    if (!response?.ok()) throw new Error(`ColorOS 15 official route returned ${response?.status()}`);
    await page.waitForSelector('[data-official-shell].loaded');
    const officialState = await page.evaluate(() => ({
      src: document.querySelector('[data-official-frame]')?.src,
      siteHeader: Boolean(document.querySelector('.site-header')),
      returnLink: Boolean(document.querySelector('.official-return')),
      overflow: document.body.scrollWidth - innerWidth,
    }));
    if (!officialState.src?.endsWith(`/coloros15/${expectedEntry}`)) throw new Error(`Official archive selected the wrong ${width}px entry: ${officialState.src}`);
    if (officialState.siteHeader || !officialState.returnLink || officialState.overflow > 1) throw new Error(`Official archive shell is not immersive: ${JSON.stringify(officialState)}`);
  }
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${origin}/coloros/16/`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-official-shell].loaded');
  if (!await page.$eval('[data-official-frame]', (element) => element.src.endsWith('/coloros16/index.html'))) throw new Error('ColorOS 16 official archive route is incorrect');

  const articles = await Promise.all((await fs.readdir(path.join(site, 'src/content/articles'))).filter((name) => name.endsWith('.json')).map(async (name) => JSON.parse(await fs.readFile(path.join(site, 'src/content/articles', name), 'utf8'))));
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${origin}/originos/`, { waitUntil: 'networkidle0' });
  if (!page.url().includes('/originos/2026/21-originos-6/')) throw new Error(`OriginOS entry did not open the latest article: ${page.url()}`);
  const originSurface = await page.$eval('.monthly-digest', (element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, backgroundImage: style.backgroundImage, backdropFilter: style.backdropFilter || style.webkitBackdropFilter, top: style.paddingTop, right: style.paddingRight, bottom: style.paddingBottom, left: style.paddingLeft };
  });
  if ((originSurface.background === 'rgba(0, 0, 0, 0)' && originSurface.backgroundImage === 'none') || originSurface.backdropFilter === 'none' || new Set([originSurface.top, originSurface.right, originSurface.bottom, originSurface.left]).size !== 1) throw new Error(`OriginOS article surface is inconsistent: ${JSON.stringify(originSurface)}`);
  await page.goto(`${origin}/coloros/2026/01-oppo-coloros-2026/`, { waitUntil: 'networkidle0' });
  const ambientState = await page.$$eval('.ambient-blob', (elements) => ({ count: elements.length, animations: elements.map((element) => getComputedStyle(element).animationName) }));
  if (ambientState.count !== 8 || ambientState.animations.some((name) => name === 'none')) throw new Error(`Ambient background motion is missing: ${JSON.stringify(ambientState)}`);
  const timeline = await page.evaluate(() => {
    const textLeft = (element) => {
      if (!element?.firstChild) return 0;
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    };
    const year = document.querySelector('.year-group h2');
    const active = document.querySelector('.year-group a.active span');
    const inactive = document.querySelector('.year-group a:not(.active) span');
    const activeLink = document.querySelector('.year-group a.active');
    const line = document.querySelector('.year-group ul');
    const lineStyle = getComputedStyle(line, '::before');
    const marker = activeLink?.querySelector('.timeline-marker');
    const markerRect = marker?.getBoundingClientRect();
    return {
      year: textLeft(year),
      active: active?.getBoundingClientRect().left ?? 0,
      inactive: inactive?.getBoundingClientRect().left ?? 0,
      line: (line?.getBoundingClientRect().left ?? 0) + Number.parseFloat(lineStyle.left) + Number.parseFloat(lineStyle.width) / 2,
      marker: markerRect ? markerRect.left + markerRect.width / 2 : 0,
      textY: (activeLink?.getBoundingClientRect().top ?? 0) + Number.parseFloat(getComputedStyle(activeLink).paddingTop) + Number.parseFloat(getComputedStyle(activeLink).lineHeight) / 2,
      markerY: markerRect ? markerRect.top + markerRect.height / 2 : 0,
    };
  });
  if (Math.abs(timeline.year - timeline.line) > .5 || Math.abs(timeline.active - timeline.inactive) > .5 || Math.abs(timeline.line - timeline.marker) > .25 || Math.abs(timeline.textY - timeline.markerY) > .5) throw new Error(`Archive timeline is misaligned: ${JSON.stringify(timeline)}`);
  const colorNavTitles = await page.$$eval('.year-group a span', (elements) => elements.map((element) => element.textContent?.trim() ?? ''));
  if (colorNavTitles.some((title) => /^OPPO\s+/i.test(title))) throw new Error(`ColorOS navigation still contains OPPO prefix: ${colorNavTitles.find((title) => /^OPPO\s+/i.test(title))}`);
  if (colorNavTitles.some((title) => /^手机系统\s+/.test(title))) throw new Error(`ColorOS navigation still contains 手机系统 prefix: ${colorNavTitles.find((title) => /^手机系统\s+/.test(title))}`);
  const articleWidth = await page.$eval('.article-layout', (element) => element.getBoundingClientRect().width);
  if (articleWidth < 1165 || articleWidth > 1175) throw new Error(`Desktop digest width is not the expanded V2 layout: ${articleWidth}`);
  const articleGrid = await page.$eval('.article-layout', (element) => {
    const style = getComputedStyle(element);
    return { columns: style.gridTemplateColumns.split(' ').map(Number.parseFloat), gap: Number.parseFloat(style.columnGap) };
  });
  if (Math.abs(articleGrid.columns[0] - 240) > .5 || Math.abs(articleGrid.gap - 10) > .5) throw new Error(`Expanded digest columns are incorrect: ${JSON.stringify(articleGrid)}`);
  const defaultMonthlyState = await page.evaluate(() => ({
    view: document.documentElement.dataset.monthlyView,
    digestVisible: !document.querySelector('[data-monthly-panel="digest"]')?.hidden,
    originalMounted: document.querySelector('[data-original-mount]')?.childElementCount ?? -1,
    tables: document.querySelectorAll('.digest-table').length,
    iframe: Boolean(document.querySelector('[data-original-mount] iframe')),
  }));
  if (defaultMonthlyState.view !== 'digest' || !defaultMonthlyState.digestVisible || defaultMonthlyState.originalMounted !== 0 || defaultMonthlyState.tables !== 2 || defaultMonthlyState.iframe) throw new Error(`Monthly digest did not start deferred and simplified: ${JSON.stringify(defaultMonthlyState)}`);
  const toolbarBeforeScroll = await page.$eval('.monthly-view-toolbar', (element) => ({
    top: element.getBoundingClientRect().top,
    right: innerWidth - element.getBoundingClientRect().right,
    position: getComputedStyle(element).position,
  }));
  await page.evaluate(() => scrollTo(0, Math.min(900, document.documentElement.scrollHeight - innerHeight)));
  await new Promise((resolve) => setTimeout(resolve, 120));
  const toolbarAfterScroll = await page.$eval('.monthly-view-toolbar', (element) => ({
    top: element.getBoundingClientRect().top,
    right: innerWidth - element.getBoundingClientRect().right,
    position: getComputedStyle(element).position,
  }));
  if (toolbarBeforeScroll.position !== 'fixed' || toolbarAfterScroll.position !== 'fixed'
    || Math.abs(toolbarBeforeScroll.top - toolbarAfterScroll.top) > .5
    || Math.abs(toolbarBeforeScroll.right - toolbarAfterScroll.right) > .5) {
    throw new Error(`Monthly view switch is not fixed in the viewport: ${JSON.stringify({ toolbarBeforeScroll, toolbarAfterScroll })}`);
  }
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, 0);
  });
  await page.waitForFunction(() => scrollY < 1);
  await page.click('[data-monthly-view="original"]');
  await page.waitForFunction(() => document.documentElement.dataset.monthlyView === 'original');
  try {
    await page.waitForSelector('[data-original-mount] .gallery-shell.loaded', { timeout: 12000 });
  } catch (error) {
    const state = await page.evaluate(() => {
      const shell = document.querySelector('[data-original-mount] .gallery-shell');
      const image = shell?.querySelector('img');
      return {
        view: document.documentElement.dataset.monthlyView,
        mounted: document.querySelector('[data-original-mount]')?.childElementCount ?? -1,
        shellClass: shell?.className ?? null,
        imageSrc: image?.currentSrc || image?.src || null,
        imageComplete: image?.complete ?? null,
        imageWidth: image?.naturalWidth ?? null,
      };
    });
    throw new Error(`Original gallery did not become ready: ${JSON.stringify(state)}`, { cause: error });
  }
  const originalMonthlyState = await page.evaluate(() => ({ view: document.documentElement.dataset.monthlyView, mounted: document.querySelector('[data-original-mount]')?.childElementCount ?? 0, stored: localStorage.getItem('os-archive:monthly-view') }));
  if (originalMonthlyState.view !== 'original' || originalMonthlyState.mounted !== 1 || originalMonthlyState.stored !== 'original') throw new Error(`Monthly original view did not mount or persist: ${JSON.stringify(originalMonthlyState)}`);
  const originalArticleWidth = await page.$eval('.article-layout', (element) => element.getBoundingClientRect().width);
  if (originalArticleWidth < 995 || originalArticleWidth > 1005) throw new Error(`Original archive width changed with digest V2: ${originalArticleWidth}`);
  const lastGalleryImageMargin = await page.$eval('.gallery-content .image-gallery img:last-child', (element) => getComputedStyle(element).marginBottom);
  if (Number.parseFloat(lastGalleryImageMargin) !== 0) throw new Error(`Gallery bottom spacing is inconsistent: ${lastGalleryImageMargin}`);
  await page.goto(`${origin}/originos/2026/21-originos-6/`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-original-mount] [data-compat-frame]');
  const persistedOriginal = await page.evaluate(() => ({ view: document.documentElement.dataset.monthlyView, digestHidden: document.querySelector('[data-monthly-panel="digest"]')?.hidden, src: document.querySelector('[data-original-mount] [data-compat-frame]')?.getAttribute('src') }));
  if (persistedOriginal.view !== 'original' || !persistedOriginal.digestHidden || !persistedOriginal.src) throw new Error(`Monthly preference did not persist across brands: ${JSON.stringify(persistedOriginal)}`);
  await page.click('[data-monthly-view="digest"]');
  await page.click('[data-digest-media]');
  if (!await page.$eval('[data-digest-lightbox]', (element) => element.open && Boolean(element.querySelector('[data-lightbox-stage] img, [data-lightbox-stage] video')))) throw new Error('Digest media lightbox did not open');
  await page.keyboard.press('Escape');
  if (await page.$eval('[data-digest-lightbox]', (element) => element.open)) throw new Error('Digest media lightbox did not close with Escape');
  for (const width of [390, 768, 1024, 1180, 1440]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${origin}/coloros/2026/01-oppo-coloros-2026/`, { waitUntil: 'networkidle0' });
    const monthlyLayout = await page.evaluate(() => {
      const tables = [...document.querySelectorAll('.digest-table-scroll')].map((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      const aligned = [...document.querySelectorAll('.digest-table th')].every((element) => getComputedStyle(element).textAlign === 'center' && getComputedStyle(element).verticalAlign === 'middle')
        && [...document.querySelectorAll('.digest-table td')].every((element) => getComputedStyle(element).verticalAlign === 'middle')
        && [...document.querySelectorAll('.digest-module,.digest-title,.digest-type-cell,.digest-media-cell')].every((element) => getComputedStyle(element).textAlign === 'center');
      return { page: document.body.scrollWidth, viewport: innerWidth, tables, aligned, originalMounted: document.querySelector('[data-original-mount]')?.childElementCount ?? -1 };
    });
    const desktopTablesFit = width < 1024 || monthlyLayout.tables.every((table) => Math.abs(table.scroll - table.client) <= 1);
    const mobileTableScroll = width !== 390 || monthlyLayout.tables.some((table) => table.scroll > table.client + 8);
    if (monthlyLayout.page > monthlyLayout.viewport + 1 || !desktopTablesFit || !mobileTableScroll || !monthlyLayout.aligned || monthlyLayout.originalMounted !== 0) throw new Error(`Monthly digest layout failed at ${width}px: ${JSON.stringify(monthlyLayout)}`);
  }
  await page.setViewport({ width: 1280, height: 900 });
  let interactiveSurfaceCount = 0;
  let horizontalInteractionCount = 0;
  for (const interactive of articles.filter((article) => article.kind !== 'gallery')) {
    await page.goto(`${origin}/${interactive.brand}/${interactive.year}/${interactive.slug}/`, { waitUntil: 'networkidle0' });
    if (await page.$('[data-monthly-view="original"]')) await page.click('[data-monthly-view="original"]');
    await page.waitForSelector('[data-compat-frame]');
    await page.waitForFunction(() => Boolean(document.querySelector('[data-compat-frame]')?.contentDocument?.querySelector('.compat-root')), { timeout: 10000 });
    const articleText = await page.$eval('.article-content', (element) => element.textContent);
    if (articleText.includes('原始交互已恢复') || articleText.includes('隔离环境') || await page.$('.interactive-toolbar a')) throw new Error(`Implementation copy or standalone link is visible: ${interactive.slug}`);
    const sandbox = await page.$eval('[data-compat-frame]', (element) => element.getAttribute('sandbox') ?? '');
    if (!sandbox.includes('allow-scripts') || !sandbox.includes('allow-same-origin')) throw new Error(`Interactive media sandbox cannot load local assets: ${interactive.slug}`);
    const frame = page.frames().find((item) => item.url().includes(`/compat/${interactive.brand}/${interactive.slug}/index.html`));
    if (!frame) throw new Error(`Interactive compatibility frame did not load: ${interactive.slug}`);
    if (!await frame.$('.compat-root')) throw new Error(`Interactive compatibility content is missing: ${interactive.slug}`);
    const frameState = await frame.evaluate(() => {
      const scroller = [...document.querySelectorAll('*')].find((element) => element.scrollWidth > element.clientWidth + 8 && ['auto', 'scroll'].includes(getComputedStyle(element).overflowX));
      let horizontalMoved = false;
      if (scroller) {
        scroller.scrollLeft = Math.min(100, scroller.scrollWidth - scroller.clientWidth);
        horizontalMoved = scroller.scrollLeft > 0;
      }
      return { height: document.documentElement.scrollHeight, media: document.querySelectorAll('img,svg,video').length, notFound: document.body.textContent.includes('404 / Not found'), interactive: Boolean(document.querySelector('animate,animateTransform,set')) || horizontalMoved, horizontalMoved };
    });
    if (frameState.notFound || frameState.height < 300 || frameState.media < 1) throw new Error(`Interactive compatibility content is invalid: ${interactive.slug}`);
    const embeddedHeight = await page.$eval('[data-compat-frame]', (element) => element.getBoundingClientRect().height);
    if (Math.abs(embeddedHeight - frameState.height) > 3) throw new Error(`Interactive page still uses an inner vertical scroller: ${interactive.slug} (${embeddedHeight}/${frameState.height})`);
    if (frameState.interactive) interactiveSurfaceCount += 1;
    if (frameState.horizontalMoved) horizontalInteractionCount += 1;
  }
  if (interactiveSurfaceCount < 4) throw new Error(`Too few restored interactive surfaces: ${interactiveSurfaceCount}`);
  if (horizontalInteractionCount < 2) throw new Error(`Horizontal interactions did not respond: ${horizontalInteractionCount}`);

  for (const slug of ['02-oppo-coloros', '03-oppo-coloros']) {
    await page.goto(`${origin}/coloros/2026/${slug}/`, { waitUntil: 'networkidle0' });
    await page.click('[data-monthly-view="original"]');
    await page.waitForSelector('[data-gallery-shell].loaded', { timeout: 10000 });
    const opacity = await page.$eval('.gallery-content', (element) => getComputedStyle(element).opacity);
    if (opacity !== '1') throw new Error(`Long gallery remained hidden: ${slug}`);
  }

  for (const article of articles) {
    const response = await page.goto(`${origin}/${article.brand}/${article.year}/${article.slug}/`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Article failed: ${article.slug}`);
  }
  if (errors.length) throw new Error(`Browser console/network errors:\n${errors.slice(0, 12).join('\n')}`);
  console.log(`Browser verified: responsive layout, drawer, compatibility frame and ${articles.length} article routes.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
