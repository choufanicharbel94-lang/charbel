const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: '/tmp/ss_hero.png' });

  await page.evaluate(() => document.getElementById('categories').scrollIntoView());
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/ss_cats.png' });

  await page.evaluate(() => document.getElementById('products').scrollIntoView());
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/ss_products.png' });

  await page.click('.product-thumb');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/ss_modal.png' });

  await page.keyboard.press('Escape');
  await page.evaluate(() => document.getElementById('about').scrollIntoView());
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/ss_about.png' });

  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/ss_contact.png' });

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e.message); process.exit(1); });
