import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:4321/coloros/2026/59-oppo-coloros-2026-08/', { waitUntil: 'networkidle0' });

  const tree = await page.evaluate(() => {
    const footerNav = document.querySelector('[data-article-footer-nav]');
    const links = document.querySelector('.article-footer-links');
    const pullWrapper = document.querySelector('.footer-pull-wrapper');
    const articleContent = document.querySelector('.article-content');
    const monthlyDigest = document.querySelector('.monthly-digest');
    const digestSections = Array.from(document.querySelectorAll('.digest-section'));
    const lastSection = digestSections[digestSections.length - 1];
    const brandNav = document.querySelector('.brand-switcher-nav');

    const getBox = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        tag: el.tagName,
        class: el.className,
        rect: { top: r.top, bottom: r.bottom, height: r.height },
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom
      };
    };

    return {
      lastSection: getBox(lastSection),
      monthlyDigest: getBox(monthlyDigest),
      articleContent: getBox(articleContent),
      footerNav: getBox(footerNav),
      pullWrapper: getBox(pullWrapper),
      links: getBox(links),
      brandNav: getBox(brandNav)
    };
  });

  console.log('DOM Boxes and paddings at bottom:');
  console.log(JSON.stringify(tree, null, 2));

  await browser.close();
})();
