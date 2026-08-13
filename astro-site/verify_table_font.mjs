import puppeteer from 'puppeteer-core';
const exe = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] });

// 1) 月更表格
const p1 = await browser.newPage();
await p1.setViewport({ width: 1440, height: 1400 });
await p1.goto('http://localhost:4321/coloros/2025/09-oppo-coloros/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1200));
const digestInfo = await p1.evaluate(() => {
  const table = document.querySelector('.digest-table');
  const th = document.querySelector('.digest-table thead th');
  const cell = document.querySelector('.digest-table tbody td');
  const cs = (el) => el ? getComputedStyle(el).fontSize : 'n/a';
  return { table: cs(table), theadTh: cs(th), firstCell: cs(cell) };
});
console.log('月更表格:', JSON.stringify(digestInfo));
await p1.screenshot({ path: '/tmp/table_digest_font.png', fullPage: false });
await p1.close();

// 2) hyperos4 表格
const p2 = await browser.newPage();
await p2.setViewport({ width: 1440, height: 1400 });
await p2.goto('file:///Users/jingzhan.chen/Documents/antigravity/OS%E6%A1%A3%E6%A1%88/hyperos4_table.html', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1000));
const h4 = await p2.evaluate(() => {
  const table = document.querySelector('table');
  const th = document.querySelector('th');
  const td = document.querySelector('td');
  const cs = (el) => el ? getComputedStyle(el).fontSize : 'n/a';
  return { table: cs(table), th: cs(th), td: cs(td) };
});
console.log('hyperos4 表格:', JSON.stringify(h4));
await p2.screenshot({ path: '/tmp/table_h4_font.png', fullPage: false });
await p2.close();

await browser.close();
