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
    const mobileTabs = window.matchMedia('(max-width: 760px)');
    let swipeStartY = null;

    document.documentElement.classList.add('motion-ready');

    const updatePersistedNav = () => {
      const path = window.location.pathname;
      const isHome = path === '/' || path === '' || (path.endsWith('/index.html') && !path.includes('/coloros') && !path.includes('/originos') && !path.includes('/hyperos') && !path.includes('/magicos'));
      const isColorOS = path.includes('/coloros');
      const isOriginOS = path.includes('/originos');
      const isHyperOS = path.includes('/hyperos');
      const isMagicOS = path.includes('/magicos');

      const homeTab = document.querySelector('.home-tab');
      if (homeTab) {
        homeTab.classList.toggle('active', isHome);
        let hl = homeTab.querySelector('.nav-highlight');
        if (isHome && !hl) {
          hl = document.createElement('div');
          hl.className = 'nav-highlight';
          homeTab.prepend(hl);
        } else if (!isHome && hl) {
          hl.remove();
        }
      }

      const colorOSMenu = document.querySelector('.brand-menu:nth-child(2)');
      if (colorOSMenu) {
        colorOSMenu.classList.toggle('active', isColorOS);
        const trigger = colorOSMenu.querySelector('.brand-trigger');
        let hl = trigger?.querySelector('.nav-highlight');
        if (isColorOS && !hl && trigger) {
          hl = document.createElement('div');
          hl.className = 'nav-highlight';
          trigger.prepend(hl);
        } else if (!isColorOS && hl) {
          hl.remove();
        }
        const is15 = /\/coloros\/15(\/|$)/.test(path);
        const is16 = /\/coloros\/16(\/|$)/.test(path);
        const isMonthly = isColorOS && !is15 && !is16;
        const subLinks = colorOSMenu.querySelectorAll('.brand-submenu a');
        if (subLinks && subLinks.length >= 3) {
          subLinks[0].classList.toggle('active', is15);
          subLinks[1].classList.toggle('active', is16);
          subLinks[2].classList.toggle('active', isMonthly);
        }
      }

      const originOSMenu = document.querySelector('.brand-menu:nth-child(3)');
      if (originOSMenu) {
        originOSMenu.classList.toggle('active', isOriginOS);
        const trigger = originOSMenu.querySelector('.brand-trigger');
        let hl = trigger?.querySelector('.nav-highlight');
        if (isOriginOS && !hl && trigger) {
          hl = document.createElement('div');
          hl.className = 'nav-highlight';
          trigger.prepend(hl);
        } else if (!isOriginOS && hl) {
          hl.remove();
        }
        const is6 = /\/originos\/6(\/|$)/.test(path);
        const isMonthly = isOriginOS && !is6;
        const subLinks = originOSMenu.querySelectorAll('.brand-submenu a');
        if (subLinks && subLinks.length >= 2) {
          subLinks[0].classList.toggle('active', is6);
          subLinks[1].classList.toggle('active', isMonthly);
        }
      }

      const hyperOSMenu = document.querySelector('.brand-menu:nth-child(4)');
      if (hyperOSMenu) {
        hyperOSMenu.classList.toggle('active', isHyperOS);
        const trigger = hyperOSMenu.querySelector('.brand-trigger');
        let hl = trigger?.querySelector('.nav-highlight');
        if (isHyperOS && !hl && trigger) {
          hl = document.createElement('div');
          hl.className = 'nav-highlight';
          trigger.prepend(hl);
        } else if (!isHyperOS && hl) {
          hl.remove();
        }
        const is4 = /\/hyperos\/4(\/|$)/.test(path);
        const is3 = /\/hyperos\/3(\/|$)/.test(path);
        const is2 = /\/hyperos\/2(\/|$)/.test(path);
        const is1 = /\/hyperos\/1(\/|$)/.test(path);
        const isMonthly = isHyperOS && !is4 && !is3 && !is2 && !is1;
        const subLinks = hyperOSMenu.querySelectorAll('.brand-submenu a');
        if (subLinks && subLinks.length >= 5) {
          subLinks[0].classList.toggle('active', is4);
          subLinks[1].classList.toggle('active', is3);
          subLinks[2].classList.toggle('active', is2);
          subLinks[3].classList.toggle('active', is1);
          subLinks[4].classList.toggle('active', isMonthly);
        }
      }

      const magicOSTab = document.querySelector('.brand-tab[href*="magicos"]');
      if (magicOSTab) {
        magicOSTab.classList.toggle('active', isMagicOS);
        let hl = magicOSTab.querySelector('.nav-highlight');
        if (isMagicOS && !hl) {
          hl = document.createElement('div');
          hl.className = 'nav-highlight';
          magicOSTab.prepend(hl);
        } else if (!isMagicOS && hl) {
          hl.remove();
        }
      }
    };

    updatePersistedNav();

    const brandSwitcher = document.querySelector('.brand-switcher');
    const activeNavTab = brandSwitcher?.querySelector('.active');
    
    let mobilePopover = document.querySelector('.mobile-brand-popover');
    if (!mobilePopover) {
      mobilePopover = document.createElement('div');
      mobilePopover.className = 'mobile-brand-popover';
      mobilePopover.setAttribute('role', 'menu');
      document.body.appendChild(mobilePopover);
    }
    
    let currentOpenMenu = null;

    const updatePopoverPosition = () => {
      if (!currentOpenMenu || !mobilePopover || !mobilePopover.classList.contains('open')) return;
      const trigger = currentOpenMenu.querySelector('.brand-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const popoverWidth = mobilePopover.offsetWidth || 150;
        const halfW = popoverWidth / 2 + 10;
        const centerX = Math.max(halfW, Math.min(window.innerWidth - halfW, rect.left + rect.width / 2));
        mobilePopover.style.setProperty('--popover-x', `${centerX}px`);
      }
    };

    if (brandSwitcher && mobileTabs.matches) {
      const updateScrollMask = () => {
        const isLeft = brandSwitcher.scrollLeft <= 2;
        const isRight = brandSwitcher.scrollLeft + brandSwitcher.clientWidth >= brandSwitcher.scrollWidth - 2;
        brandSwitcher.dataset.maskLeft = String(!isLeft);
        brandSwitcher.dataset.maskRight = String(!isRight);
      };

      brandSwitcher.addEventListener('scroll', () => {
        updateScrollMask();
        updatePopoverPosition();
      }, { passive: true, signal });

      window.addEventListener('resize', updatePopoverPosition, { passive: true, signal });

      if (activeNavTab) {
        const isFirst = activeNavTab === brandSwitcher.firstElementChild;
        const isLast = !activeNavTab.nextElementSibling || activeNavTab === brandSwitcher.lastElementChild;
        if (isFirst) {
          brandSwitcher.scrollLeft = 0;
        } else if (isLast) {
          brandSwitcher.scrollLeft = brandSwitcher.scrollWidth;
        } else {
          const containerWidth = brandSwitcher.clientWidth;
          const itemLeft = activeNavTab.offsetLeft;
          const itemWidth = activeNavTab.offsetWidth;
          brandSwitcher.scrollLeft = Math.max(0, itemLeft - (containerWidth / 2) + (itemWidth / 2));
        }
        updateScrollMask();
      } else {
        updateScrollMask();
      }
    }

    const brandMenus = document.querySelectorAll('.brand-menu');

    const closeAllBrandMenus = () => {
      brandMenus.forEach(m => {
        m.classList.remove('open');
        m.querySelector('.brand-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (mobilePopover) {
        mobilePopover.classList.remove('open');
      }
      currentOpenMenu = null;
    };

    brandMenus.forEach(menu => {
      const trigger = menu.querySelector('.brand-trigger');
      const submenu = menu.querySelector('.brand-submenu');
      const items = [...(submenu?.querySelectorAll('[role="menuitem"]') ?? [])];

      const openBrandMenu = (focusFirst = false) => {
        closeAllBrandMenus();
        currentOpenMenu = menu;

        if (mobileTabs.matches && trigger && submenu && items.length > 0) {
          mobilePopover.innerHTML = submenu.innerHTML;
          mobilePopover.classList.add('open');
          updatePopoverPosition();

          mobilePopover.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
              mobilePopover.classList.remove('open');
              currentOpenMenu = null;
            }, { signal });
          });
        }

        menu.classList.add('open');
        trigger?.setAttribute('aria-expanded', 'true');
        if (focusFirst && items[0]) items[0].focus();
      };

      const closeBrandMenu = () => {
        menu.classList.remove('open');
        trigger?.setAttribute('aria-expanded', 'false');
        if (mobilePopover) {
          mobilePopover.classList.remove('open');
        }
        currentOpenMenu = null;
      };

      menu.addEventListener('pointerenter', () => {
        if (!mobileTabs.matches) openBrandMenu();
      }, { signal });

      menu.addEventListener('pointerleave', (event) => {
        if (!mobileTabs.matches && event.pointerType === 'mouse' && !menu.contains(document.activeElement)) {
          closeBrandMenu();
        }
      }, { signal });

      menu.addEventListener('focusout', (event) => {
        if (!menu.contains(event.relatedTarget) && !mobileTabs.matches) {
          closeBrandMenu();
        }
      }, { signal });

      // Mobile tap on tab
      trigger?.addEventListener('click', (event) => {
        if (mobileTabs.matches && items.length > 1) {
          if (menu.classList.contains('active')) {
            event.preventDefault();
            if (currentOpenMenu === menu && mobilePopover.classList.contains('open')) {
              closeBrandMenu();
            } else {
              openBrandMenu();
            }
          } else {
            try {
              const brandText = trigger.querySelector('span')?.getAttribute('data-text') || '';
              sessionStorage.setItem('openBrandMenuOnLoad', brandText.toLowerCase());
            } catch {}
          }
        }
      }, { signal });

      trigger?.addEventListener('keydown', (event) => {
        if (['ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
          event.preventDefault();
          openBrandMenu(true);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          closeBrandMenu();
        }
      }, { signal });

      submenu?.addEventListener('keydown', (event) => {
        const current = items.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          items[(current + 1) % items.length]?.focus();
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          items[(current - 1 + items.length) % items.length]?.focus();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          closeBrandMenu();
          trigger?.focus();
        }
      }, { signal });

      items.forEach(item => item.addEventListener('click', () => {
        if (mobileTabs.matches) {
          closeAllBrandMenus();
        }
      }, { signal }));
    });

    // Check if we should auto-open menu on mobile load
    if (mobileTabs.matches) {
      try {
        const pendingBrand = sessionStorage.getItem('openBrandMenuOnLoad');
        if (pendingBrand) {
          sessionStorage.removeItem('openBrandMenuOnLoad');
          const targetMenu = [...brandMenus].find(m => {
            const name = m.querySelector('.brand-trigger span')?.getAttribute('data-text')?.toLowerCase();
            return name === pendingBrand;
          });
          if (targetMenu) {
            setTimeout(() => {
              const trigger = targetMenu.querySelector('.brand-trigger');
              const submenu = targetMenu.querySelector('.brand-submenu');
              const items = submenu?.querySelectorAll('[role="menuitem"]') ?? [];
              if (submenu && items.length > 0) {
                closeAllBrandMenus();
                currentOpenMenu = targetMenu;
                mobilePopover.innerHTML = submenu.innerHTML;
                mobilePopover.classList.add('open');
                updatePopoverPosition();
                targetMenu.classList.add('open');
                trigger?.setAttribute('aria-expanded', 'true');

                mobilePopover.querySelectorAll('a').forEach(link => {
                  link.addEventListener('click', () => {
                    mobilePopover.classList.remove('open');
                    currentOpenMenu = null;
                  }, { signal });
                });
              }
            }, 60);
          }
        }
      } catch {}
    }

    document.addEventListener('pointerdown', (event) => {
      if (!event.target.closest('.brand-menu') && !event.target.closest('.mobile-brand-popover')) {
        closeAllBrandMenus();
      }
    }, { signal });

    const closeMenu = () => {
      archiveNav?.classList.remove('open');
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove('nav-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', '打开文章目录');
      menuButton?.setAttribute('title', '打开目录');
    };
    const openMenu = () => {
      if (!archiveNav) return;
      archiveNav.classList.add('open');
      if (backdrop) backdrop.hidden = false;
      document.body.classList.add('nav-open');
      menuButton?.setAttribute('aria-expanded', 'true');
      menuButton?.setAttribute('aria-label', '关闭文章目录');
      menuButton?.setAttribute('title', '关闭目录');
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
      document.querySelectorAll('[data-monthly-view-toggle]').forEach((button) => {
        const isDigest = normalized === 'digest';
        button.setAttribute('aria-label', isDigest ? '切换为原始图文版' : '切换为文字精简版');
        button.setAttribute('title', isDigest ? '切换为原始图文版' : '切换为文字精简版');
      });
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
