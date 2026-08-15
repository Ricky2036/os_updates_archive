import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const url = "https://mp.weixin.qq.com/s/j11zYSRr0ZW_jlCfY3B7eg";
const outDir = path.join(process.cwd(), "public/assets/images/HyperOS_8月更新一览_(2024)");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
    console.log("Launching browser with security disabled...");
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: "new",
        args: ['--disable-web-security']
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log("Navigating to URL...");
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    console.log("Scrolling down to trigger lazy loading...");
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 1000;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Extracting image data as base64...");
    const imagesData = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => {
            if (!img.src || !img.src.includes('mmbiz')) return null;
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                if (canvas.width === 0 || canvas.height === 0) return null;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL('image/webp', 0.9);
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
    });
    
    console.log(`Extracted ${imagesData.length} images.`);
    
    imagesData.forEach((dataUrl, idx) => {
        const base64Data = dataUrl.replace(/^data:image\/webp;base64,/, "");
        const filePath = path.join(outDir, `${idx}.webp`);
        fs.writeFileSync(filePath, base64Data, 'base64');
        console.log(`Saved ${idx}.webp, size: ${fs.statSync(filePath).size}`);
    });
    
    await browser.close();
    console.log("Done.");
})();
