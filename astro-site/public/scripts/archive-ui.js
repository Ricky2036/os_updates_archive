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
    let popoverRafId = null;

    const stopTrackingPopover = () => {
      if (popoverRafId) {
        cancelAnimationFrame(popoverRafId);
        popoverRafId = null;
      }
    };

    const updatePopoverPosition = () => {
      if (!currentOpenMenu || !mobilePopover || !mobilePopover.classList.contains('open')) {
        stopTrackingPopover();
        return;
      }
      const trigger = currentOpenMenu.querySelector('.brand-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const popoverWidth = mobilePopover.offsetWidth || 150;
        const halfW = popoverWidth / 2 + 8;
        const centerX = Math.max(halfW, Math.min(window.innerWidth - halfW, rect.left + rect.width / 2));
        mobilePopover.style.setProperty('--popover-x', `${centerX}px`);
      }
    };

    const startTrackingPopover = () => {
      stopTrackingPopover();
      const loop = () => {
        if (currentOpenMenu && mobilePopover?.classList.contains('open')) {
          updatePopoverPosition();
          popoverRafId = requestAnimationFrame(loop);
        } else {
          stopTrackingPopover();
        }
      };
      updatePopoverPosition();
      popoverRafId = requestAnimationFrame(loop);
    };

    const getOptimalTabScrollLeft = (targetTab) => {
      if (!brandSwitcher || !targetTab) return 0;
      const items = Array.from(brandSwitcher.children);
      const index = items.indexOf(targetTab);
      if (index === -1) return 0;

      const containerWidth = brandSwitcher.clientWidth;
      const maxScroll = Math.max(0, brandSwitcher.scrollWidth - containerWidth);
      if (maxScroll <= 0) return 0;

      // 1. 首个菜单（首页）-> 靠最左显示（scrollLeft = 0）
      if (index === 0) {
        return 0;
      }
      // 2. 最后一个菜单（MagicOS）-> 靠最右显示（scrollLeft = maxScroll）
      if (index === items.length - 1) {
        return maxScroll;
      }

      // 3. 中间菜单（ColorOS / OriginOS / HyperOS 等）
      // 确保其左侧相邻项与右侧相邻项均完整显示在可视区域内，避免过度滚动
      const prevItem = items[index - 1];
      const nextItem = items[index + 1];
      const spanLeft = prevItem.offsetLeft;
      const spanRight = nextItem.offsetLeft + nextItem.offsetWidth;
      const spanWidth = spanRight - spanLeft;
      const maskPadding = 14; // 避开边缘渐变蒙版，确保左邻和右邻100%完整可见

      if (spanWidth + maskPadding * 2 <= containerWidth) {
        const minAllowed = spanRight + maskPadding - containerWidth;
        const maxAllowed = spanLeft - maskPadding;
        const ideal = spanLeft + (spanWidth - containerWidth) / 2;
        const bounded = Math.max(minAllowed, Math.min(maxAllowed, ideal));
        return Math.max(0, Math.min(maxScroll, bounded));
      } else if (spanWidth <= containerWidth) {
        const minAllowed = spanRight - containerWidth;
        const maxAllowed = spanLeft;
        const ideal = spanLeft + (spanWidth - containerWidth) / 2;
        const bounded = Math.max(minAllowed, Math.min(maxAllowed, ideal));
        return Math.max(0, Math.min(maxScroll, bounded));
      } else {
        const itemLeft = targetTab.offsetLeft;
        const itemWidth = targetTab.offsetWidth;
        return Math.max(0, Math.min(maxScroll, itemLeft - (containerWidth / 2) + (itemWidth / 2)));
      }
    };

    const setOptimisticActiveTab = (targetEl) => {
      if (!targetEl || !brandSwitcher) return;
      const targetTab = targetEl.closest('.brand-menu') || targetEl.closest('.home-tab') || targetEl.closest('.brand-tab');
      if (!targetTab) return;

      const allTabsAndMenus = brandSwitcher.querySelectorAll('.home-tab, .brand-menu, .brand-tab');
      allTabsAndMenus.forEach(el => el.classList.remove('active'));
      targetTab.classList.add('active');

      const existingHl = brandSwitcher.querySelector('.nav-highlight');
      if (existingHl) existingHl.remove();

      const newHl = document.createElement('div');
      newHl.className = 'nav-highlight';

      const triggerOrAnchor = targetTab.querySelector('.brand-trigger') || targetTab;
      triggerOrAnchor.prepend(newHl);

      if (mobileTabs.matches) {
        const targetScroll = getOptimalTabScrollLeft(targetTab);
        brandSwitcher.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    };

    const prefetchUrl = (url) => {
      if (!url || url.startsWith('#') || url.startsWith('javascript:')) return;
      if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    };

    // Instant prefetch on touch
    brandSwitcher?.addEventListener('pointerdown', (e) => {
      const anchor = e.target.closest('a');
      if (anchor?.href) {
        prefetchUrl(anchor.href);
      }
    }, { passive: true, signal });

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

      const targetTab = activeNavTab ? (activeNavTab.closest('.brand-menu') || activeNavTab) : brandSwitcher.firstElementChild;
      if (targetTab) {
        brandSwitcher.scrollLeft = getOptimalTabScrollLeft(targetTab);
        updateScrollMask();
      } else {
        updateScrollMask();
      }
    }

    const homeTab = document.querySelector('.home-tab');
    homeTab?.addEventListener('click', () => {
      if (mobileTabs.matches && brandSwitcher) {
        setOptimisticActiveTab(homeTab);
        brandSwitcher.scrollTo({ left: 0, behavior: 'smooth' });
        closeAllBrandMenus();
      }
    }, { signal });

    const magicOSTab = document.querySelector('.brand-tab[href*="magicos"]');
    magicOSTab?.addEventListener('click', () => {
      if (mobileTabs.matches && brandSwitcher) {
        setOptimisticActiveTab(magicOSTab);
        brandSwitcher.scrollTo({ left: brandSwitcher.scrollWidth, behavior: 'smooth' });
        closeAllBrandMenus();
      }
    }, { signal });

    // Desktop hover & dismissal state (window-level persistent across view transitions)
    window.__osDismissedBrand = window.__osDismissedBrand ?? null;

    const brandMenus = document.querySelectorAll('.brand-menu');

    const closeAllBrandMenus = () => {
      stopTrackingPopover();
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
      const brandKey = menu.dataset.brand || '';
      let hoverTimer = null;

      const openBrandMenu = (focusFirst = false) => {
        if (window.__osDismissedBrand === brandKey) return;
        closeAllBrandMenus();
        currentOpenMenu = menu;

        if (mobileTabs.matches && trigger && submenu && items.length > 0) {
          mobilePopover.innerHTML = submenu.innerHTML;
          mobilePopover.classList.add('open');
          startTrackingPopover();

          mobilePopover.querySelectorAll('a').forEach(subLink => {
            subLink.addEventListener('click', (e) => {
              window.__osDismissedBrand = brandKey;
              closeBrandMenu();
              const targetHref = subLink.getAttribute('href');
              if (targetHref && (window.location.pathname === targetHref || window.location.pathname.replace(/\/$/, '') === targetHref.replace(/\/$/, ''))) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }, { signal });
          });
        }

        menu.classList.add('open');
        trigger?.setAttribute('aria-expanded', 'true');
        if (focusFirst && items[0]) items[0].focus();
      };

      const closeBrandMenu = () => {
        clearTimeout(hoverTimer);
        closeAllBrandMenus();
      };

      // Desktop: mouse hover opens popup menu
      menu.addEventListener('mouseenter', () => {
        if (!mobileTabs.matches) {
          if (window.__osDismissedBrand === brandKey) return;
          // Hovering a different brand clears dismissal of previous brand
          window.__osDismissedBrand = null;
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => {
            if (window.__osDismissedBrand !== brandKey) openBrandMenu();
          }, 35);
        }
      }, { signal });

      // Desktop: mouse leave closes menu
      menu.addEventListener('mouseleave', () => {
        if (!mobileTabs.matches) {
          clearTimeout(hoverTimer);
          closeBrandMenu();
        }
      }, { signal });

      menu.addEventListener('focusout', (event) => {
        if (!menu.contains(event.relatedTarget) && !mobileTabs.matches) {
          closeBrandMenu();
        }
      }, { signal });

      // Tab click handler
      trigger?.addEventListener('click', (event) => {
        if (mobileTabs.matches) {
          const targetTab = menu || trigger.closest('.brand-menu') || trigger;
          const targetScroll = getOptimalTabScrollLeft(targetTab);
          brandSwitcher?.scrollTo({ left: targetScroll, behavior: 'smooth' });

          if (items.length > 1) {
            if (menu.classList.contains('active')) {
              event.preventDefault();
              if (currentOpenMenu === menu && mobilePopover.classList.contains('open')) {
                closeBrandMenu();
              } else {
                openBrandMenu();
              }
            } else {
              setOptimisticActiveTab(menu);
              closeBrandMenu();
            }
          } else {
            setOptimisticActiveTab(menu);
            closeBrandMenu();
          }
        } else {
          // Desktop: clicking TAB immediately closes popup and prevents re-opening while cursor lingers
          window.__osDismissedBrand = brandKey;
          closeBrandMenu();

          const targetHref = trigger.getAttribute('href');
          if (targetHref && (window.location.pathname === targetHref || window.location.pathname.replace(/\/$/, '') === targetHref.replace(/\/$/, ''))) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, { signal });

      trigger?.addEventListener('keydown', (event) => {
        if (['ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
          event.preventDefault();
          window.__osDismissedBrand = null;
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

      items.forEach(item => item.addEventListener('click', (e) => {
        window.__osDismissedBrand = brandKey;
        closeAllBrandMenus();
        const targetHref = item.getAttribute('href');
        if (targetHref && (window.location.pathname === targetHref || window.location.pathname.replace(/\/$/, '') === targetHref.replace(/\/$/, ''))) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, { signal }));
    });

    document.querySelectorAll('.home-tab, .brand-tab:not(.brand-trigger)').forEach(tab => {
      tab.addEventListener('click', () => {
        window.__osDismissedBrand = tab.getAttribute('data-brand') || 'home';
        closeAllBrandMenus();
      }, { signal });
    });

    // Reset dismissed brand whenever mouse leaves the entire brand switcher navbar
    const brandNav = document.querySelector('.brand-switcher-nav');
    brandNav?.addEventListener('mouseleave', () => {
      window.__osDismissedBrand = null;
      closeAllBrandMenus();
    }, { signal });

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

      // Update button state and icon rotation IMMEDIATELY (0ms) on click:
      document.documentElement.dataset.monthlyView = normalized;
      document.querySelectorAll('[data-monthly-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.monthlyView === normalized)));
      document.querySelectorAll('[data-monthly-view-toggle]').forEach((button) => {
        const isDigest = normalized === 'digest';
        button.setAttribute('aria-label', isDigest ? '切换为原始图文版' : '切换为文字精校版');
        button.setAttribute('title', isDigest ? '切换为原始图文版' : '切换为文字精校版');
      });
      if (persist) {
        try { localStorage.setItem('os-archive:monthly-view', normalized); } catch { /* storage is optional */ }
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setMonthlyView(root, normalized, false);
        return;
      }

      isFlipping = true;
      const isToOriginal = normalized === 'original';
      const flipDirection = isToOriginal ? 'to-original' : 'to-digest';

      if (isToOriginal) mountOriginal(root);

      document.documentElement.classList.add('is-switching-view');
      root.classList.add('is-flipping', `is-flipping-${flipDirection}-out`);

      setTimeout(() => {
        setMonthlyView(root, normalized, false);
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

    document.body.classList.remove('page-card-exit-up');
    if (sessionStorage.getItem('os-archive:pull-navigated') === 'true') {
      sessionStorage.removeItem('os-archive:pull-navigated');
      document.body.classList.add('page-card-enter-up');
      setTimeout(() => {
        document.body.classList.remove('page-card-enter-up');
      }, 500);
    }

    // Article footer navigation & Pull-up to next article (Touch + Mouse Wheel)
    const initArticleFooterNav = () => {
      const footerNav = document.querySelector('[data-article-footer-nav]');
      if (!footerNav) return;

      const articleContent = document.querySelector('.article-content') || footerNav;
      const pullHintText = footerNav.querySelector('[data-pull-hint-text]');
      const scrollTopBtn = footerNav.querySelector('[data-scroll-top]');
      const nextUrl = footerNav.dataset.nextUrl;
      const prevUrl = footerNav.dataset.prevUrl;

      // Click to scroll to top
      scrollTopBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, { signal });

      let isPulling = false;
      let thresholdReached = false;
      let cancelTimer = null;
      // Increased deliberate physical threshold (~150px thumb drag, ~3.5cm on phone screen)
      const TOUCH_THRESHOLD = 150;
      const WHEEL_THRESHOLD = 75;

      const applyPullTransform = (dampedPx, transition = '') => {
        clearTimeout(cancelTimer);
        articleContent.style.transition = transition;
        articleContent.style.transform = `translate3d(0, -${dampedPx}px, 0)`;
      };

      const setThresholdState = (reached) => {
        if (thresholdReached === reached) return;
        thresholdReached = reached;
        if (reached) {
          footerNav.classList.add('is-threshold-reached');
          if (pullHintText && nextUrl) pullHintText.textContent = '松手查看下一篇';
          if ('vibrate' in navigator) {
            try { navigator.vibrate(15); } catch {}
          }
        } else {
          footerNav.classList.remove('is-threshold-reached');
          if (pullHintText && nextUrl) pullHintText.textContent = '松手查看下一篇';
        }
      };

      const triggerNavigation = () => {
        footerNav.classList.add('is-loading');
        document.body.classList.add('page-card-exit-up');
        sessionStorage.setItem('os-archive:pull-navigated', 'true');

        setTimeout(() => {
          window.location.href = nextUrl;
        }, 180);

        // Fallback
        setTimeout(() => {
          cancelPull();
        }, 2000);
      };

      const cancelPull = () => {
        isPulling = false;
        thresholdReached = false;
        footerNav.classList.remove('is-pulling', 'is-threshold-reached', 'is-loading');
        document.body.classList.remove('page-card-exit-up');
        setThresholdState(false);
        clearTimeout(cancelTimer);

        // Natural smooth spring-back
        articleContent.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease';
        void articleContent.offsetHeight;
        articleContent.style.transform = 'translate3d(0, 0px, 0)';
        articleContent.style.opacity = '1';

        cancelTimer = setTimeout(() => {
          if (!isPulling) {
            articleContent.style.transition = '';
            articleContent.style.transform = '';
            articleContent.style.opacity = '';
            if (pullHintText && nextUrl) pullHintText.textContent = '松手查看下一篇';
          }
        }, 350);
      };

      const isAtBottom = () => {
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const rect = footerNav.getBoundingClientRect();
        return scrollBottom >= docHeight - 20 || rect.bottom <= window.innerHeight + 15;
      };

      // --- Mobile Touch Gestures ---
      let touchStartY = 0;
      let touchStartX = 0;

      const onTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        clearTimeout(cancelTimer);
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isPulling = false;
        thresholdReached = false;
      };

      const onTouchMove = (e) => {
        if (e.touches.length !== 1) return;
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const dy = currentY - touchStartY;
        const dx = currentX - touchStartX;

        const atBottom = isAtBottom();

        if (atBottom && dy < 0 && Math.abs(dy) > Math.abs(dx)) {
          if (e.cancelable) {
            e.preventDefault();
          }

          if (!isPulling) {
            isPulling = true;
            footerNav.classList.add('is-pulling');
          }

          const rawPull = Math.abs(dy);
          // Controlled rubber-band curve: gentle pull follows finger, max 55px
          const damped = Math.min(55, Math.pow(rawPull, 0.6) * 1.5);
          applyPullTransform(damped, 'none');

          if (nextUrl) {
            prefetchUrl(nextUrl);
            setThresholdState(rawPull >= TOUCH_THRESHOLD);
          } else {
            if (pullHintText) pullHintText.textContent = '已是最后一篇';
          }
        } else if (isPulling && dy >= 0) {
          cancelPull();
        }
      };

      const onTouchEnd = () => {
        if (isPulling) {
          if (thresholdReached && nextUrl) {
            triggerNavigation();
          } else {
            cancelPull();
          }
        } else {
          cancelPull();
        }
      };

      window.addEventListener('touchstart', onTouchStart, { passive: true, signal });
      window.addEventListener('touchmove', onTouchMove, { passive: false, signal });
      window.addEventListener('touchend', onTouchEnd, { passive: true, signal });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true, signal });

      // --- Desktop Mouse Wheel & Trackpad Gesture ---
      let wheelPullY = 0;
      let wheelEndTimeout = null;
      let isWheelActive = false;

      const onWheel = (e) => {
        if (!nextUrl) return;

        const atBottom = isAtBottom();
        if (atBottom && e.deltaY > 0) {
          if (e.cancelable && (wheelPullY > 15 || e.deltaY > 25)) {
            e.preventDefault();
          }

          prefetchUrl(nextUrl);
          isWheelActive = true;
          isPulling = true;
          footerNav.classList.add('is-pulling');

          wheelPullY += Math.min(Math.abs(e.deltaY), 40) * 0.45;
          const damped = Math.min(85, Math.pow(wheelPullY, 0.58) * 2.1);
          applyPullTransform(damped, 'none');

          setThresholdState(damped >= WHEEL_THRESHOLD);

          clearTimeout(wheelEndTimeout);
          wheelEndTimeout = setTimeout(() => {
            if (thresholdReached && nextUrl) {
              triggerNavigation();
            } else {
              wheelPullY = 0;
              cancelPull();
            }
            isWheelActive = false;
          }, 280);
        } else if (isWheelActive && e.deltaY < 0) {
          wheelPullY = Math.max(0, wheelPullY + e.deltaY * 0.7);
          if (wheelPullY === 0) {
            clearTimeout(wheelEndTimeout);
            isWheelActive = false;
            cancelPull();
          } else {
            const damped = Math.min(85, Math.pow(wheelPullY, 0.58) * 2.1);
            applyPullTransform(damped, 'none');
            setThresholdState(damped >= WHEEL_THRESHOLD);
          }
        }
      };

      window.addEventListener('wheel', onWheel, { passive: false, signal });
    };

    initArticleFooterNav();

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
