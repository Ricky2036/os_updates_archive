import puppeteer from 'puppeteer-core';

const url = "https://mp.weixin.qq.com/s/j11zYSRr0ZW_jlCfY3B7eg";

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: "new",
        args: ['--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
        // Hide standard WeChat UI
        const toHide = [
            '#activity-name', '#meta_content', '.qr_code_pc', '#js_pc_qr_code', 
            '.rich_media_area_extra', '.reward_area', '#js_profile_qrcode'
        ];
        toHide.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = 'none';
        });
        
        const content = document.querySelector('#js_content');
        if (content) {
            document.body.innerHTML = '';
            document.body.appendChild(content);
            document.body.style.backgroundColor = '#fff';
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            
            // The top and bottom banners are usually inside <section> tags.
            // Let's remove the first and last elements in the rich_media_content if they are banners.
            // Or just find all images and remove the first and last one.
            const imgs = Array.from(document.querySelectorAll('img'));
            if (imgs.length > 2) {
                // The first image is the header banner
                const firstImg = imgs[0];
                let parent = firstImg.parentElement;
                while (parent && parent.tagName !== 'SECTION' && parent.id !== 'js_content') {
                    parent = parent.parentElement;
                }
                if (parent && parent.id !== 'js_content') parent.remove();
                else firstImg.remove();
                
                // The last image is the QR code
                const lastImg = imgs[imgs.length - 1];
                parent = lastImg.parentElement;
                while (parent && parent.tagName !== 'SECTION' && parent.id !== 'js_content') {
                    parent = parent.parentElement;
                }
                if (parent && parent.id !== 'js_content') parent.remove();
                else lastImg.remove();
            }
        }
    });
    
    // Trigger lazy loading
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'public/assets/images/HyperOS_8月更新一览_(2024)/1.webp', type: 'webp', fullPage: true });
    
    await browser.close();
})();
