(() => {
  function initArchiveUI() {
    window.__osArchiveController?.abort();
    const controller = new AbortController();
    window.__osArchiveController = controller;
    const { signal } = controller;
    const menuButton = document.querySelector('.menu-button');
    const archiveNav = document.querySelector('#archive-nav');
    const backdrop = document.querySelector('[data-nav-backdrop]');
    const closeButton = document.querySelector('[data-nav-close]');
    const colorOSMenu = document.querySelector('[data-coloros-menu]');
    const colorOSTrigger = colorOSMenu?.querySelector('[data-coloros-trigger]');
    const colorOSSubmenu = colorOSMenu?.querySelector('[data-coloros-submenu]');
    const colorOSItems = [...(colorOSSubmenu?.querySelectorAll('[role="menuitem"]') ?? [])];
    const mobileTabs = window.matchMedia('(max-width: 760px)');
    let swipeStartY = null;

    document.documentElement.classList.add('motion-ready');

    const brandSwitcher = document.querySelector('.brand-switcher');
    const activeNavTab = brandSwitcher?.querySelector('.active');
    if (brandSwitcher && activeNavTab && mobileTabs.matches) {
      setTimeout(() => {
        try {
          activeNavTab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        } catch {
          const containerWidth = brandSwitcher.clientWidth;
          const itemLeft = activeNavTab.offsetLeft;
          const itemWidth = activeNavTab.offsetWidth;
          brandSwitcher.scrollTo({
            left: Math.max(0, itemLeft - (containerWidth / 2) + (itemWidth / 2)),
            behavior: 'smooth'
          });
        }
      }, 50);
    }

    const setColorOSMenu = (open, focusFirst = false) => {
      colorOSMenu?.classList.toggle('open', open);
      colorOSTrigger?.setAttribute('aria-expanded', String(open));
      if (open && focusFirst) colorOSItems[0]?.focus();
    };
    const closeColorOSMenu = () => setColorOSMenu(false);

    colorOSMenu?.addEventListener('pointerenter', () => setColorOSMenu(true), { signal });
    colorOSMenu?.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse' && !colorOSMenu.contains(document.activeElement)) closeColorOSMenu();
    }, { signal });
    colorOSMenu?.addEventListener('focusout', (event) => {
      if (!colorOSMenu.contains(event.relatedTarget) && !mobileTabs.matches) closeColorOSMenu();
    }, { signal });
    colorOSTrigger?.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', ' '].includes(event.key)) { event.preventDefault(); setColorOSMenu(true, true); }
      if (event.key === 'Escape') { event.preventDefault(); closeColorOSMenu(); }
    }, { signal });
    colorOSSubmenu?.addEventListener('keydown', (event) => {
      const current = colorOSItems.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') { event.preventDefault(); colorOSItems[(current + 1) % colorOSItems.length]?.focus(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); colorOSItems[(current - 1 + colorOSItems.length) % colorOSItems.length]?.focus(); }
      if (event.key === 'Escape') { event.preventDefault(); closeColorOSMenu(); colorOSTrigger?.focus(); }
    }, { signal });
    colorOSSubmenu?.addEventListener('pointerdown', (event) => { if (mobileTabs.matches) swipeStartY = event.clientY; }, { signal });
    colorOSSubmenu?.addEventListener('pointerup', (event) => {
      if (mobileTabs.matches && swipeStartY !== null && event.clientY - swipeStartY > 36) closeColorOSMenu();
      swipeStartY = null;
    }, { signal });
    colorOSItems.forEach((item) => item.addEventListener('click', closeColorOSMenu, { signal }));
    document.addEventListener('pointerdown', (event) => { if (!colorOSMenu?.contains(event.target)) closeColorOSMenu(); }, { signal });

    const closeMenu = () => {
      archiveNav?.classList.remove('open');
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove('nav-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', '打开文章目录');
    };
    const openMenu = () => {
      if (!archiveNav) return;
      archiveNav.classList.add('open');
      if (backdrop) backdrop.hidden = false;
      document.body.classList.add('nav-open');
      menuButton?.setAttribute('aria-expanded', 'true');
      menuButton?.setAttribute('aria-label', '关闭文章目录');
      archiveNav.focus({ preventScroll: true });
    };

    menuButton?.addEventListener('click', () => archiveNav?.classList.contains('open') ? closeMenu() : openMenu(), { signal });
    closeButton?.addEventListener('click', closeMenu, { signal });
    backdrop?.addEventListener('click', closeMenu, { signal });
    archiveNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu, { signal }));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { closeMenu(); closeColorOSMenu(); }
      if (event.key === 'Tab' && archiveNav?.classList.contains('open')) {
        const focusable = [...archiveNav.querySelectorAll('a,button,input,[tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }, { signal });

    const revealItems = [...document.querySelectorAll('.reveal')];
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), { rootMargin: '120px 0px', threshold: 0.01 });
      revealItems.forEach((item) => observer.observe(item));
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
    } else revealItems.forEach((item) => item.classList.add('is-visible'));

    const prepareGalleryShell = (shell) => {
      const image = shell.querySelector('img');
      const ready = () => shell.classList.add('loaded');
      // The original archive is mounted from a template and starts hidden.
      // Lazy images inside a previously hidden subtree are not guaranteed to
      // begin fetching, so promote only the first image once the user asks for
      // the original view. The remaining long-form images stay lazy.
      if (image) {
        image.loading = 'eager';
        image.fetchPriority = 'high';
      }
      if (!image || (image.complete && image.naturalWidth > 0)) ready();
      else {
        image.addEventListener('load', ready, { signal, once: true });
        image.addEventListener('error', ready, { signal, once: true });
      }
    };

    const mountOriginal = (root) => {
      const mount = root.querySelector('[data-original-mount]');
      const template = root.querySelector('[data-original-template]');
      if (!mount || !template || mount.childElementCount) return;
      mount.append(template.content.cloneNode(true));
      mount.querySelectorAll('[data-gallery-shell]').forEach(prepareGalleryShell);
      mount.querySelectorAll('[data-compat-frame][data-src]').forEach((frame) => {
        frame.src = frame.dataset.src;
        frame.removeAttribute('data-src');
      });
    };

    const setMonthlyView = (root, view, persist = false) => {
      const normalized = view === 'original' ? 'original' : 'digest';
      if (normalized === 'original') mountOriginal(root);
      document.documentElement.dataset.monthlyView = normalized;
      root.querySelectorAll('[data-monthly-panel]').forEach((panel) => { panel.hidden = panel.dataset.monthlyPanel !== normalized; });
      document.querySelectorAll('[data-monthly-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.monthlyView === normalized)));
      if (persist) {
        try { localStorage.setItem('os-archive:monthly-view', normalized); } catch { /* storage is optional */ }
      }
    };

    let isFlipping = false;
    const flipToView = (root, targetView, persist = false) => {
      const normalized = targetView === 'original' ? 'original' : 'digest';
      const current = document.documentElement.dataset.monthlyView;
      if (current === normalized || isFlipping) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setMonthlyView(root, normalized, persist);
        return;
      }

      isFlipping = true;
      const isToOriginal = normalized === 'original';
      const flipDirection = isToOriginal ? 'to-original' : 'to-digest';

      if (isToOriginal) mountOriginal(root);

      root.classList.add('is-flipping', `is-flipping-${flipDirection}-out`);
      document.documentElement.classList.add('is-switching-view');

      setTimeout(() => {
        setMonthlyView(root, normalized, persist);
        root.classList.remove(`is-flipping-${flipDirection}-out`);
        root.classList.add(`is-flipping-${flipDirection}-in`);

        setTimeout(() => {
          root.classList.remove('is-flipping', `is-flipping-${flipDirection}-in`);
          document.documentElement.classList.remove('is-switching-view');
          isFlipping = false;
        }, 280);
      }, 220);
    };

    document.querySelectorAll('[data-monthly-view-root]').forEach((root) => {
      let currentView = document.documentElement.dataset.monthlyView;
      if (!currentView) {
        try {
          currentView = localStorage.getItem('os-archive:monthly-view') === 'original' ? 'original' : 'digest';
        } catch {
          currentView = 'digest';
        }
        document.documentElement.dataset.monthlyView = currentView;
      }
      setMonthlyView(root, currentView);
      document.querySelectorAll('[data-monthly-view]').forEach((button) => button.addEventListener('click', () => {
        flipToView(root, button.dataset.monthlyView, true);
      }, { signal }));
      document.querySelectorAll('[data-monthly-view-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
          const current = document.documentElement.dataset.monthlyView;
          const next = current === 'original' ? 'digest' : 'original';
          flipToView(root, next, true);
        }, { signal });
      });
    });

    document.querySelectorAll('[data-gallery-shell]').forEach(prepareGalleryShell);

    document.querySelectorAll('[data-digest-lightbox]').forEach((dialog) => {
      const stage = dialog.querySelector('[data-lightbox-stage]');
      const caption = dialog.querySelector('[data-lightbox-caption]');
      const nav = dialog.querySelector('[data-lightbox-nav]');
      const count = dialog.querySelector('[data-lightbox-count]');
      let items = [];
      let activeIndex = 0;
      let returnFocus = null;
      const renderMedia = () => {
        const button = items[activeIndex];
        if (!button || !stage) return;
        stage.replaceChildren();
        const media = button.dataset.kind === 'video' ? document.createElement('video') : document.createElement('img');
        if (media instanceof HTMLVideoElement) {
          media.controls = true;
          media.playsInline = true;
          media.preload = 'metadata';
          if (button.dataset.poster) media.poster = button.dataset.poster;
        } else media.alt = button.dataset.alt || '';
        media.src = button.dataset.src;
        stage.append(media);
        if (caption) caption.textContent = button.dataset.alt || '功能演示';
        if (nav) nav.hidden = items.length < 2;
        if (count) count.textContent = `${activeIndex + 1} / ${items.length}`;
      };
      const close = () => dialog.close();
      dialog.parentElement?.querySelectorAll('[data-digest-media]').forEach((button) => button.addEventListener('click', () => {
        items = [...button.closest('.digest-media-list').querySelectorAll('[data-digest-media]')];
        activeIndex = Math.max(0, items.indexOf(button));
        returnFocus = button;
        renderMedia();
        dialog.showModal();
        dialog.querySelector('[data-lightbox-close]')?.focus();
      }, { signal }));
      dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', close, { signal });
      dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => { activeIndex = (activeIndex - 1 + items.length) % items.length; renderMedia(); }, { signal });
      dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => { activeIndex = (activeIndex + 1) % items.length; renderMedia(); }, { signal });
      dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); }, { signal });
      dialog.addEventListener('close', () => {
        stage?.querySelector('video')?.pause();
        stage?.replaceChildren();
        returnFocus?.focus();
      }, { signal });
    });

    window.addEventListener('message', (event) => {
      if (event.data?.type !== 'os-archive:resize' || !event.data.id) return;
      const frame = [...document.querySelectorAll('[data-compat-frame]')].find((item) => item.dataset.compatId === event.data.id && item.contentWindow === event.source);
      if (!frame) return;
      const height = Math.min(60000, Math.max(520, Number(event.data.height) || 620));
      frame.style.height = `${height}px`;
      frame.closest('[data-compat-shell]')?.classList.add('loaded');
    }, { signal });

    document.querySelectorAll('video').forEach((video) => {
      const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && !video.paused) video.pause(); }, { threshold: 0.05 });
      observer.observe(video);
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
    });

    const routeMapElement = document.querySelector('#legacy-route-map');
    if (routeMapElement && location.hash.length > 1) {
      try {
        const routes = JSON.parse(routeMapElement.textContent);
        const key = decodeURIComponent(location.hash.slice(1));
        if (routes[key] && location.pathname !== routes[key]) location.replace(routes[key]);
      } catch { /* invalid historic hash remains on the archive index */ }
    }
  }

  if (!window.__osArchivePageLoadBound) {
    document.addEventListener('astro:page-load', initArchiveUI);
    window.__osArchivePageLoadBound = true;
  }
  initArchiveUI();
})();
