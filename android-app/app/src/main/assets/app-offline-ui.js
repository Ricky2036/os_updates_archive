(function () {
  if (window.__osArchiveAppOfflineInjected) {
    if (typeof window.__osArchiveRefreshAllUI === 'function') {
      window.__osArchiveRefreshAllUI();
    }
    return;
  }
  window.__osArchiveAppOfflineInjected = true;

  const BRIDGE = window.OSArchiveApp;
  if (!BRIDGE) return;

  let appState = null;
  let drawerOpen = false;
  let expandedBrandId = null;

  function parseState(raw) {
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  }

  function loadInitialState() {
    try {
      appState = parseState(BRIDGE.getStateJson());
    } catch {
      appState = null;
    }
  }

  function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n <= 0) return '0 MB';
    if (n >= 1024 * 1024 * 1024) {
      return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    if (n >= 1024 * 1024) {
      return (n / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }

  function extractSlugFromHref(href) {
    if (!href) return '';
    const clean = href.split('#')[0].split('?')[0].replace(/\/+$/, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 3) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      if (/^202\d$/.test(prev)) {
        return last;
      }
    }
    return '';
  }

  function getCurrentPageSlug() {
    return extractSlugFromHref(window.location.pathname);
  }

  function getCurrentPageBrand() {
    const p = window.location.pathname.replace(/^\/os_updates_archive/, '');
    const seg = p.split('/').filter(Boolean)[0] || '';
    const known = ['coloros', 'originos', 'hyperos', 'magicos', 'harmonyos'];
    return known.includes(seg) ? seg : '';
  }

  function injectStyles() {
    if (document.getElementById('os-app-offline-styles')) return;
    const style = document.createElement('style');
    style.id = 'os-app-offline-styles';
    style.textContent = `
      /* 修复底部浮动导航栏：安全边距与层级优化，消除遮挡 */
      @media (max-width: 760px) {
        .landing-page, .archive-layout, .article-layout {
          padding-bottom: 96px !important;
        }
      }

      /* 极致性能优化：完全移除背景光斑动画与滤镜层，根除 Chromium 500MB+ GPU 显存过载与切页卡顿 */
      .ambient-layer, .ambient-blob {
        display: none !important;
        animation: none !important;
        will-change: auto !important;
        filter: none !important;
      }

      /* 压缩 View Transitions 转场延迟，实现瞬间切换 */
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation-duration: 0.12s !important;
      }

      /* 顶部栏下载/离线状态按钮（与品牌页 .menu-button 目录按钮风格大小 1:1 一致） */
      .os-app-header-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        color: #606873;
        cursor: pointer;
        border-radius: 50%;
        margin-left: auto;
        -webkit-tap-highlight-color: transparent;
        outline: none;
        transition: color 0.2s cubic-bezier(0.32, 0.72, 0, 1), transform 0.15s cubic-bezier(0.32, 0.72, 0, 1);
      }
      .os-app-header-btn:active {
        transform: scale(0.92);
      }
      .os-app-header-btn svg {
        display: block;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
      .os-app-header-btn .btn-icon-check {
        color: #10b981;
      }
      .os-app-header-btn.is-downloading {
        color: #0071e3;
        animation: osAppSpin 1.4s linear infinite;
      }
      @keyframes osAppSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* 文章卡片离线标识 */
      .article-card, .editorial-feature {
        position: relative;
      }
      .os-app-card-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 4;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        backdrop-filter: blur(14px) saturate(140%);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
        pointer-events: auto;
        cursor: pointer;
        transition: transform 0.15s ease;
      }
      .os-app-card-badge:active {
        transform: scale(0.94);
      }
      .os-app-card-badge.state-ready {
        background: rgba(246, 253, 249, 0.9);
        color: #0d7a5f;
        border-color: rgba(13, 122, 95, 0.25);
      }
      .os-app-card-badge.state-downloading {
        background: rgba(239, 246, 255, 0.92);
        color: #1d4ed8;
      }
      .os-app-card-badge.state-none {
        background: rgba(255, 255, 255, 0.85);
        color: #4b5563;
      }

      /* 文章目录抽屉内部单篇按钮与底部管理栏 */
      .archive-nav-list li {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .archive-nav-list li > a {
        flex: 1;
        min-width: 0;
      }
      .os-app-nav-item-btn {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 26px;
        padding: 0 8px;
        border-radius: 999px;
        border: 1px solid rgba(24, 25, 28, 0.09);
        background: rgba(255, 255, 255, 0.66);
        color: #5b6068;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }
      .os-app-nav-item-btn.is-ready {
        background: rgba(13, 122, 95, 0.1);
        border-color: rgba(13, 122, 95, 0.22);
        color: #0d7a5f;
      }
      .os-app-nav-item-btn.is-downloading {
        background: rgba(37, 99, 235, 0.1);
        border-color: rgba(37, 99, 235, 0.22);
        color: #2563eb;
      }

      .os-app-nav-footer-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .os-app-nav-footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .os-app-nav-manage-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        min-height: 36px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid rgba(24, 25, 28, 0.1);
        background: rgba(255, 255, 255, 0.85);
        color: #18191c;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      }

      /* 离线归档管理抽屉 */
      .os-app-drawer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9998;
        background: rgba(15, 23, 42, 0.32);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .os-app-drawer-backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }
      .os-app-drawer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        background: rgba(246, 248, 252, 0.94);
        backdrop-filter: blur(28px) saturate(150%);
        -webkit-backdrop-filter: blur(28px) saturate(150%);
        border-top: 1px solid rgba(255, 255, 255, 0.9);
        border-radius: 26px 26px 0 0;
        box-shadow: 0 -18px 48px rgba(15, 23, 42, 0.16);
        transform: translateY(104%);
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        color: #18191c;
        font-family: Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      }
      .os-app-drawer.open {
        transform: translateY(0);
      }
      .os-app-drawer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px 14px;
        border-bottom: 1px solid rgba(24, 25, 28, 0.07);
      }
      .os-app-drawer-title-group h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #18191c;
      }
      .os-app-drawer-title-group p {
        margin: 3px 0 0;
        font-size: 12.5px;
        color: #5b6068;
      }
      .os-app-drawer-close {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 1px solid rgba(24, 25, 28, 0.08);
        background: rgba(255, 255, 255, 0.8);
        color: #18191c;
        font-size: 18px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .os-app-drawer-body {
        padding: 16px 18px 36px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      /* 概览卡片 */
      .os-app-summary-card {
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        padding: 16px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
      }
      .os-app-summary-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }
      .os-app-summary-stat {
        font-size: 19px;
        font-weight: 700;
        color: #18191c;
      }
      .os-app-summary-sub {
        font-size: 12.5px;
        color: #5b6068;
      }
      .os-app-progress-track {
        width: 100%;
        height: 7px;
        border-radius: 999px;
        background: rgba(24, 25, 28, 0.07);
        overflow: hidden;
      }
      .os-app-progress-bar {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #00a99d, #2563eb);
        transition: width 0.25s ease;
      }
      .os-app-summary-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 12px;
        color: #5b6068;
      }
      .os-app-summary-actions {
        display: flex;
        gap: 10px;
        margin-top: 14px;
      }
      .os-app-btn-primary {
        flex: 1;
        min-height: 42px;
        padding: 0 16px;
        border-radius: 999px;
        border: none;
        background: #18191c;
        color: #ffffff;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .os-app-btn-secondary {
        min-height: 42px;
        padding: 0 16px;
        border-radius: 999px;
        border: 1px solid rgba(24, 25, 28, 0.12);
        background: rgba(255, 255, 255, 0.85);
        color: #18191c;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* 任务横幅 */
      .os-app-task-banner {
        background: rgba(239, 246, 255, 0.9);
        border: 1px solid rgba(37, 99, 235, 0.2);
        border-radius: 16px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .os-app-task-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 12.5px;
        font-weight: 600;
        color: #1e3a8a;
      }
      .os-app-task-sub {
        font-size: 12px;
        color: #3b82f6;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .os-app-task-cancel {
        padding: 4px 11px;
        border-radius: 999px;
        border: 1px solid rgba(37, 99, 235, 0.25);
        background: #ffffff;
        color: #1d4ed8;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
      }

      /* 5 大品牌卡片 */
      .os-app-section-label {
        font-size: 12px;
        font-weight: 600;
        color: #5b6068;
        padding: 2px 4px 0;
      }
      .os-app-brand-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .os-app-brand-card {
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.95);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
      }
      .os-app-brand-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        gap: 12px;
        cursor: pointer;
      }
      .os-app-brand-info {
        flex: 1;
        min-width: 0;
      }
      .os-app-brand-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .os-app-brand-dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        flex-shrink: 0;
      }
      .os-app-brand-name {
        font-size: 15px;
        font-weight: 700;
        color: #18191c;
      }
      .os-app-brand-count-pill {
        font-size: 11.5px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(24, 25, 28, 0.06);
        color: #4b5563;
      }
      .os-app-brand-count-pill.is-done {
        background: rgba(13, 122, 95, 0.12);
        color: #0d7a5f;
      }
      .os-app-brand-meta {
        margin-top: 5px;
        font-size: 12px;
        color: #5b6068;
      }
      .os-app-brand-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      /* 修复按钮变小与文字居中对齐 */
      .os-app-pill-btn {
        box-sizing: border-box;
        min-width: 82px;
        height: 36px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid rgba(24, 25, 28, 0.12);
        background: #ffffff;
        color: #18191c;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        line-height: 1;
        white-space: nowrap;
        margin: 0;
      }
      .os-app-pill-btn.primary {
        background: #18191c;
        color: #ffffff;
        border-color: #18191c;
      }
      .os-app-pill-btn.done {
        background: rgba(13, 122, 95, 0.1);
        color: #0d7a5f;
        border-color: rgba(13, 122, 95, 0.25);
      }

      /* 精致极简的小灰箭头（置于标题行文字后） */
      .os-app-arrow-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        color: #9ca3af;
        margin-left: 1px;
        flex-shrink: 0;
        transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.18s ease;
      }
      .os-app-brand-card.expanded .os-app-arrow-toggle {
        transform: rotate(180deg);
        color: #4b5563;
      }

      /* 文章明细子列表 */
      .os-app-article-sublist {
        display: none;
        border-top: 1px solid rgba(24, 25, 28, 0.06);
        background: rgba(246, 248, 252, 0.7);
        padding: 6px 12px 10px;
      }
      .os-app-brand-card.expanded .os-app-article-sublist {
        display: block;
      }
      .os-app-article-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 6px;
        border-bottom: 1px solid rgba(24, 25, 28, 0.05);
      }
      .os-app-article-row:last-child {
        border-bottom: none;
      }
      .os-app-article-main {
        flex: 1;
        min-width: 0;
        cursor: pointer;
      }
      .os-app-article-title {
        font-size: 13px;
        font-weight: 600;
        color: #18191c;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .os-app-article-sub {
        margin-top: 2px;
        font-size: 11.5px;
        color: #6b7280;
      }
      .os-app-article-op {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .os-app-mini-btn {
        box-sizing: border-box;
        height: 30px;
        padding: 0 11px;
        border-radius: 999px;
        border: 1px solid rgba(24, 25, 28, 0.1);
        background: #ffffff;
        color: #374151;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .os-app-mini-btn.ready {
        background: rgba(13, 122, 95, 0.1);
        border-color: rgba(13, 122, 95, 0.22);
        color: #0d7a5f;
      }
      .os-app-mini-btn.downloading {
        background: rgba(37, 99, 235, 0.1);
        border-color: rgba(37, 99, 235, 0.22);
        color: #2563eb;
      }
      .os-app-mini-del {
        box-sizing: border-box;
        height: 30px;
        padding: 0 9px;
        border-radius: 999px;
        border: 1px solid rgba(220, 38, 38, 0.18);
        background: rgba(254, 242, 242, 0.85);
        color: #dc2626;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
    `;
    document.head.appendChild(style);
  }

  function getArticleMap() {
    const map = new Map();
    if (appState && Array.isArray(appState.articles)) {
      for (const a of appState.articles) {
        map.set(a.slug, a);
      }
    }
    return map;
  }

  function renderHeaderEntry() {
    const headerInner = document.querySelector('.site-header .header-inner');
    if (!headerInner || !appState) return;

    const hasMenuButton = Boolean(headerInner.querySelector('.menu-button'));
    let btn = headerInner.querySelector('.os-app-header-btn');

    if (hasMenuButton) {
      if (btn) btn.remove();
      return;
    }

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'os-app-header-btn';
      btn.addEventListener('click', () => openDrawer());
      headerInner.appendChild(btn);
    }

    const storage = appState.storage || {};
    const task = appState.activeTask;
    const readyCount = storage.readyArticlesCount || 0;
    const totalCount = storage.totalArticlesCount || 71;
    const isAllReady = totalCount > 0 && readyCount >= totalCount;

    btn.classList.remove('is-downloading');

    if (task && task.isRunning) {
      btn.classList.add('is-downloading');
      btn.setAttribute('aria-label', `离线下载中 ${task.percent}%`);
      btn.setAttribute('title', `离线下载中 ${task.percent}%`);
      // 正在下载：旋转下载环图标
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
      `;
    } else if (isAllReady) {
      btn.setAttribute('aria-label', '全站离线归档已就绪');
      btn.setAttribute('title', '全站离线归档已就绪');
      // 离线完成：下载托盘底座 + 内部翠绿小对勾
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <!-- 经典下载托盘底座保持中性灰色 -->
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#606873"></path>
          <!-- 托盘内部翠绿色完成对勾 -->
          <polyline points="7 10 11 14 17 6" stroke="#10b981" stroke-width="2.4"></polyline>
        </svg>
      `;
    } else {
      btn.setAttribute('aria-label', `离线归档 (${readyCount}/${totalCount})`);
      btn.setAttribute('title', `离线归档 (${readyCount}/${totalCount})`);
      // 默认/未全部完成：极简精致的下载托盘图标
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      `;
    }
  }

  function isHomepage() {
    const p = (window.location.pathname || '').replace(/\/+$/, '') || '/';
    return (
      p === '/' ||
      p === '/os_updates_archive' ||
      p === '/os_updates_archive/index.html' ||
      p === '/index.html'
    );
  }

  function cleanupHomepageBadges() {
    // 首页卡片不需要显示任何离线状态角标，保持原生极简设计
    document.querySelectorAll('.os-app-portal-badge').forEach((el) => el.remove());
    if (isHomepage()) {
      document.querySelectorAll('.os-app-card-badge').forEach((el) => el.remove());
    }
  }

  function renderArticleCardsBadges() {
    // 首页不显示卡片离线角标
    if (isHomepage()) {
      document.querySelectorAll('.os-app-card-badge').forEach((el) => el.remove());
      return;
    }

    if (!appState) return;
    const artMap = getArticleMap();
    const cards = document.querySelectorAll('.article-card, .editorial-feature');

    for (const card of cards) {
      const slug = extractSlugFromHref(card.getAttribute('href') || '');
      const art = artMap.get(slug);
      if (!art) continue;

      let badge = card.querySelector('.os-app-card-badge');
      if (!badge) {
        badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'os-app-card-badge';
        badge.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const current = getArticleMap().get(slug);
          if (!current) return;
          if (current.status === 'ready') {
            openDrawer(current.brand);
          } else if (current.status !== 'downloading') {
            BRIDGE.downloadArticle(slug);
          }
        });
        card.appendChild(badge);
      }

      badge.classList.remove('state-ready', 'state-downloading', 'state-none');
      if (art.status === 'ready') {
        badge.classList.add('state-ready');
        badge.textContent = `已离线 · ${formatBytes(art.downloadedBytes || art.estimatedBytes)}`;
      } else if (art.status === 'downloading') {
        badge.classList.add('state-downloading');
        badge.textContent = `下载中 ${art.progress || 0}%`;
      } else {
        badge.classList.add('state-none');
        badge.textContent = `离线 (${formatBytes(art.estimatedBytes)})`;
      }
    }
  }

  function renderArchiveNavDrawerEnhancements() {
    const archiveNav = document.getElementById('archive-nav');
    if (!archiveNav || !appState) return;

    const artMap = getArticleMap();
    const listItems = archiveNav.querySelectorAll('.archive-nav-list li');

    for (const li of listItems) {
      const link = li.querySelector('a');
      if (!link) continue;
      const slug = extractSlugFromHref(link.getAttribute('href') || '');
      const art = artMap.get(slug);
      if (!art) continue;

      let btn = li.querySelector('.os-app-nav-item-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'os-app-nav-item-btn';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const latest = getArticleMap().get(slug);
          if (!latest) return;
          if (latest.status === 'ready') {
            openDrawer(latest.brand);
          } else if (latest.status !== 'downloading') {
            BRIDGE.downloadArticle(slug);
          }
        });
        li.appendChild(btn);
      }

      btn.classList.remove('is-ready', 'is-downloading');
      if (art.status === 'ready') {
        btn.classList.add('is-ready');
        btn.textContent = '已离线';
      } else if (art.status === 'downloading') {
        btn.classList.add('is-downloading');
        btn.textContent = `${art.progress || 0}%`;
      } else {
        btn.textContent = '离线';
      }
    }

    const countFooter = archiveNav.querySelector('.archive-count');
    if (countFooter) {
      const currentBrandId = getCurrentPageBrand();
      const brandObj = (appState.brands || []).find((b) => b.id === currentBrandId);
      const storage = appState.storage || {};

      let box = countFooter.querySelector('.os-app-nav-footer-box');
      if (!box) {
        countFooter.innerHTML = '';
        box = document.createElement('div');
        box.className = 'os-app-nav-footer-box';
        countFooter.appendChild(box);
      }

      const summaryLabel = brandObj
        ? `${brandObj.title} 已离线 ${brandObj.readyCount}/${brandObj.articleCount} 篇`
        : `全站已离线 ${storage.readyArticlesCount || 0}/${storage.totalArticlesCount || 71} 篇`;

      box.innerHTML = `
        <div class="os-app-nav-footer-row">
          <span>${summaryLabel}</span>
          <span>${formatBytes(storage.totalBytes || 0)}</span>
        </div>
        <button type="button" class="os-app-nav-manage-btn" data-open-offline-drawer>
          <span>离线归档管理</span>
        </button>
      `;
      box.querySelector('[data-open-offline-drawer]')?.addEventListener('click', () => {
        openDrawer(currentBrandId || null);
      });
    }
  }

  function ensureDrawerDom() {
    let backdrop = document.getElementById('os-app-drawer-backdrop');
    let drawer = document.getElementById('os-app-drawer');
    if (backdrop && drawer) return { backdrop, drawer };

    backdrop = document.createElement('div');
    backdrop.id = 'os-app-drawer-backdrop';
    backdrop.className = 'os-app-drawer-backdrop';
    backdrop.addEventListener('click', () => closeDrawer());

    drawer = document.createElement('aside');
    drawer.id = 'os-app-drawer';
    drawer.className = 'os-app-drawer';
    drawer.setAttribute('aria-label', '离线归档管理');
    drawer.innerHTML = `
      <div class="os-app-drawer-head">
        <div class="os-app-drawer-title-group">
          <h2>离线归档管理</h2>
          <p>按品牌或单篇文章保存至手机本地，断网亦可随时查阅</p>
        </div>
        <button type="button" class="os-app-drawer-close" aria-label="关闭">×</button>
      </div>
      <div class="os-app-drawer-body" id="os-app-drawer-body"></div>
    `;
    drawer.querySelector('.os-app-drawer-close')?.addEventListener('click', () => closeDrawer());

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    return { backdrop, drawer };
  }

  function openDrawer(defaultBrandId) {
    const { backdrop, drawer } = ensureDrawerDom();
    if (defaultBrandId) {
      expandedBrandId = defaultBrandId;
    } else if (!expandedBrandId) {
      expandedBrandId = getCurrentPageBrand() || 'coloros';
    }
    drawerOpen = true;
    renderDrawerContent();
    backdrop.classList.add('open');
    drawer.classList.add('open');
  }

  function closeDrawer() {
    const backdrop = document.getElementById('os-app-drawer-backdrop');
    const drawer = document.getElementById('os-app-drawer');
    drawerOpen = false;
    backdrop?.classList.remove('open');
    drawer?.classList.remove('open');
  }

  function renderDrawerContent() {
    if (!drawerOpen || !appState) return;
    const body = document.getElementById('os-app-drawer-body');
    if (!body) return;

    const storage = appState.storage || {};
    const task = appState.activeTask;
    const brands = appState.brands || [];
    const articles = appState.articles || [];

    const totalBytes = storage.totalBytes || 0;
    const maxQuotaBytes = storage.maxQuotaBytes || 2048 * 1024 * 1024;
    const usagePct = Math.min(100, Math.max(1, Math.round((totalBytes * 100) / maxQuotaBytes)));
    const readyArticlesCount = storage.readyArticlesCount || 0;
    const totalArticlesCount = storage.totalArticlesCount || 71;
    const allReady = totalArticlesCount > 0 && readyArticlesCount >= totalArticlesCount;

    let taskHtml = '';
    if (task && task.isRunning) {
      taskHtml = `
        <div class="os-app-task-banner">
          <div class="os-app-task-row">
            <span>${task.label} (${task.percent}%)</span>
            <button type="button" class="os-app-task-cancel" data-action="cancel-task">暂停/取消</button>
          </div>
          <div class="os-app-progress-track">
            <div class="os-app-progress-bar" style="width:${task.percent}%"></div>
          </div>
          <div class="os-app-task-sub">当前正在保存：${task.currentTitle}</div>
        </div>
      `;
    }

    const arrowSvg = `
      <svg class="os-app-arrow-toggle" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    const brandsHtml = brands
      .map((b) => {
        const isExpanded = expandedBrandId === b.id;
        const isDone = b.articleCount > 0 && b.readyCount >= b.articleCount;
        const brandArticles = articles.filter((a) => a.brand === b.id);
        const sizeLabel =
          b.readyCount > 0
            ? `已占用 ${formatBytes(b.downloadedBytes)} / 预计总计 ${formatBytes(b.estimatedBytes)}`
            : `共 ${b.articleCount} 篇档案 · 预计占用 ${formatBytes(b.estimatedBytes)}`;

        const rowsHtml = brandArticles
          .map((art) => {
            let statusBtnHtml = '';
            if (art.status === 'ready') {
              statusBtnHtml = `
                <span class="os-app-mini-btn ready">已离线 · ${formatBytes(art.downloadedBytes || art.estimatedBytes)}</span>
                <button type="button" class="os-app-mini-del" data-action="remove-article" data-slug="${art.slug}">移除</button>
              `;
            } else if (art.status === 'downloading') {
              statusBtnHtml = `<span class="os-app-mini-btn downloading">下载中 ${art.progress || 0}%</span>`;
            } else {
              statusBtnHtml = `<button type="button" class="os-app-mini-btn" data-action="download-article" data-slug="${art.slug}">下载 (${formatBytes(art.estimatedBytes)})</button>`;
            }

            const typeBadge = art.kind === 'gallery' ? '图文长图' : '交互专题';
            return `
              <div class="os-app-article-row">
                <div class="os-app-article-main" data-action="navigate-article" data-route="${art.route}">
                  <div class="os-app-article-title">${art.title}</div>
                  <div class="os-app-article-sub">${art.publishedAt} · ${typeBadge} · ${art.assetCount} 个资源文件</div>
                </div>
                <div class="os-app-article-op">
                  ${statusBtnHtml}
                </div>
              </div>
            `;
          })
          .join('');

        return `
          <div class="os-app-brand-card ${isExpanded ? 'expanded' : ''}" data-brand-card="${b.id}">
            <div class="os-app-brand-header" data-action="toggle-brand" data-brand="${b.id}">
              <div class="os-app-brand-info">
                <div class="os-app-brand-title-row">
                  <span class="os-app-brand-dot" style="background:${b.accent}"></span>
                  <span class="os-app-brand-name">${b.title}</span>
                  ${arrowSvg}
                  <span class="os-app-brand-count-pill ${isDone ? 'is-done' : ''}">
                    ${isDone ? '已全部离线' : `${b.readyCount} / ${b.articleCount} 篇`}
                  </span>
                </div>
                <div class="os-app-brand-meta">${sizeLabel}</div>
              </div>
              <div class="os-app-brand-actions">
                ${
                  isDone
                    ? `<button type="button" class="os-app-pill-btn done" data-action="remove-brand" data-brand="${b.id}">清理品牌</button>`
                    : `<button type="button" class="os-app-pill-btn primary" data-action="download-brand" data-brand="${b.id}">${b.readyCount > 0 ? '继续离线' : '一键离线'}</button>`
                }
              </div>
            </div>
            <div class="os-app-article-sublist">
              ${rowsHtml}
            </div>
          </div>
        `;
      })
      .join('');

    body.innerHTML = `
      <div class="os-app-summary-card">
        <div class="os-app-summary-top">
          <div class="os-app-summary-stat">已离线 ${readyArticlesCount} / ${totalArticlesCount} 篇</div>
          <div class="os-app-summary-sub">${formatBytes(totalBytes)} / 2.00 GB</div>
        </div>
        <div class="os-app-progress-track">
          <div class="os-app-progress-bar" style="width:${usagePct}%"></div>
        </div>
        <div class="os-app-summary-meta">
          <span>离线归档包：${formatBytes(storage.offlineBytes || 0)}</span>
          <span>日常浏览缓存：${formatBytes(storage.tempBytes || 0)}</span>
        </div>
        <div class="os-app-summary-actions">
          <button type="button" class="os-app-btn-primary" data-action="download-all">
            ${allReady ? '重新校验全站离线包' : '全站 5 大品牌一键离线'}
          </button>
          <button type="button" class="os-app-btn-secondary" data-action="clear-all">
            清理缓存
          </button>
        </div>
      </div>
      ${taskHtml}
      <div class="os-app-section-label">按系统品牌或单篇文章精细管理（点击品牌展开文章列表）</div>
      <div class="os-app-brand-list">
        ${brandsHtml}
      </div>
    `;

    body.querySelector('[data-action="download-all"]')?.addEventListener('click', () => {
      BRIDGE.downloadAll();
    });
    body.querySelector('[data-action="clear-all"]')?.addEventListener('click', () => {
      if (window.confirm('确定要清理所有已下载的离线归档与浏览缓存吗？')) {
        BRIDGE.clearAllCache(true);
      }
    });
    body.querySelector('[data-action="cancel-task"]')?.addEventListener('click', () => {
      BRIDGE.cancelDownload();
    });

    body.querySelectorAll('[data-action="toggle-brand"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const bId = el.getAttribute('data-brand');
        expandedBrandId = expandedBrandId === bId ? null : bId;
        renderDrawerContent();
      });
    });

    body.querySelectorAll('[data-action="download-brand"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bId = btn.getAttribute('data-brand');
        expandedBrandId = bId;
        BRIDGE.downloadBrand(bId);
      });
    });

    body.querySelectorAll('[data-action="remove-brand"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bId = btn.getAttribute('data-brand');
        if (window.confirm('确定清理该品牌的离线档案吗？')) {
          BRIDGE.removeBrand(bId);
        }
      });
    });

    body.querySelectorAll('[data-action="download-article"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.getAttribute('data-slug');
        BRIDGE.downloadArticle(slug);
      });
    });

    body.querySelectorAll('[data-action="remove-article"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.getAttribute('data-slug');
        BRIDGE.removeArticle(slug);
      });
    });

    body.querySelectorAll('[data-action="navigate-article"]').forEach((row) => {
      row.addEventListener('click', () => {
        const route = row.getAttribute('data-route');
        if (!route) return;
        closeDrawer();
        const targetUrl = `/os_updates_archive/${route.replace(/^\/+/, '')}`;
        window.location.href = targetUrl;
      });
    });
  }

  function refreshAllUI() {
    injectStyles();
    cleanupHomepageBadges();
    if (!appState) loadInitialState();
    renderHeaderEntry();
    renderArticleCardsBadges();
    renderArchiveNavDrawerEnhancements();
    if (drawerOpen) {
      renderDrawerContent();
    }
  }

  window.__osArchiveRefreshAllUI = refreshAllUI;

  window.__onOSArchiveStateUpdated = function (newState) {
    appState = parseState(newState);
    refreshAllUI();
  };

  window.__closeOSArchiveDrawerIfOpen = function () {
    if (drawerOpen) {
      closeDrawer();
      return true;
    }
    return false;
  };

  document.addEventListener('astro:page-load', () => {
    refreshAllUI();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshAllUI);
  } else {
    refreshAllUI();
  }
})();
