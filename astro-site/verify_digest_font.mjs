import puppeteer from 'puppeteer-core';
const exe = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--single-process', '--no-zygote'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto('http://localhost:4321/coloros/2025/09-oppo-coloros/', { waitUntil: 'load', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));
const info = await page.evaluate(() => {
  const table = document.querySelector('.digest-table');
  const th = document.querySelector('.digest-table thead th');
  const cell = document.querySelector('.digest-table tbody td');
  const cs = (el) => el ? getComputedStyle(el).fontSize : 'n/a';
  return { table: cs(table), theadTh: cs(th), firstCell: cs(cell) };
});
console.log('月更表格:', JSON.stringify(info));
await page.screenshot({ path: '/tmp/table_digest_font.png' });
await browser.close();
console.log('DONE');
