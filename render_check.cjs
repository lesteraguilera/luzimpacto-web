const { chromium } = require('/Users/lester/Desktop/LUZ/Automatizacion_Instagram/Automatizacion_IG/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('http://localhost:4333/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`Total: ${totalH}px`);
  const viewport = 1600;
  const blocks = [];
  let y = 0;
  while (y < totalH) { blocks.push(y); y += viewport - 80; }
  for (let i = 0; i < blocks.length; i++) {
    await page.evaluate(s => window.scrollTo(0, s), blocks[i]);
    await page.waitForTimeout(400);
    const out = path.resolve(__dirname, `_check_${String(i+1).padStart(2,'0')}.jpg`);
    await page.screenshot({ path: out, type: 'jpeg', quality: 75, clip: { x: 0, y: 0, width: 1280, height: viewport } });
    console.log(`OK ${i+1}/${blocks.length}`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
