import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const url = "https://mp.weixin.qq.com/s/j11zYSRr0ZW_jlCfY3B7eg";
const outDir = path.join(process.cwd(), "public/assets/images/HyperOS_8月更新一览_(2024)");

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: "new"
    });
    const page = await browser.newPage();
    
    // Setup request interception to avoid blocks or get URLs
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log("Navigating to URL...");
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    console.log("Scrolling down to trigger lazy loading...");
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 1000;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    });
    
    // Wait a bit for images to load
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Extracting image sources...");
    const imgUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => img.src || img.dataset.src).filter(Boolean);
    });
    
    console.log(`Found ${imgUrls.length} images total.`);
    
    let imgIndex = 0;
    for (const imgUrl of imgUrls) {
        if (!imgUrl.includes('mmbiz.qpic.cn')) continue;
        
        console.log(`Downloading: ${imgUrl.substring(0, 80)}...`);
        const filePath = path.join(outDir, `${imgIndex}.webp`); // using webp extension to match existing convention
        
        await new Promise((resolve) => {
            https.get(imgUrl, { rejectUnauthorized: false, headers: { "Referer": "https://mp.weixin.qq.com/" } }, (res) => {
                const stream = fs.createWriteStream(filePath);
                res.pipe(stream);
                stream.on('finish', () => {
                    stream.close();
                    const stat = fs.statSync(filePath);
                    console.log(`Saved ${imgIndex}.webp, size: ${stat.size}`);
                    imgIndex++;
                    resolve();
                });
            }).on('error', err => {
                console.error("Download error:", err.message);
                resolve();
            });
        });
    }
    
    await browser.close();
    console.log("Done.");
})();
