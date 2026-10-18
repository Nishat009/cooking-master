'use strict';
// Optional integration check: start the app first, then run npm run test:live.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const output = path.join(__dirname, '..', 'test-results');
  fs.mkdirSync(output, { recursive: true });
  const settled = () => page.waitForFunction(() => document.querySelector('#meals').getAttribute('aria-busy') === 'false', null, { timeout: 25000 });
  const readyForScreenshot = async () => {
    await page.locator('img').evaluateAll(async (images) => {
      images.forEach((image) => { image.loading = 'eager'; });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await Promise.race([
        Promise.all(images.map((image) => image.decode().catch(() => {}))),
        new Promise((resolve) => setTimeout(resolve, 10000)),
      ]);
    });
  };
  try {
    await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5500');
    await settled();
    assert(await page.locator('.meal-card').count() > 0, 'Live API should populate the collection');
    await page.waitForFunction(() => document.querySelector('#category-filter').options.length > 1 && document.querySelector('#area-filter').options.length > 1);
    await readyForScreenshot();
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
    console.log('Live collection:', await page.locator('#results-count').textContent());

    await page.locator('#meal').fill('chicken');
    await page.locator('#meal').press('Enter');
    await settled();
    assert(await page.locator('.meal-card').count() > 0);
    console.log('Live name search:', await page.locator('#results-count').textContent());
    await page.locator('#search-mode').selectOption('ingredient');
    await settled();
    assert(await page.locator('.meal-card').count() > 0);
    await page.locator('#category-filter').selectOption('Chicken');
    await settled();
    assert(await page.locator('.meal-card').count() > 0);
    console.log('Live ingredient + category:', await page.locator('#results-count').textContent());

    await page.locator('[data-recipe]').first().click();
    await page.locator('.ingredient-list').waitFor({ timeout: 20000 });
    assert(await page.locator('.ingredient-list li').count() > 0);
    assert(await page.locator('.instruction-list li').count() > 0);
    console.log('Live recipe:', await page.locator('#recipe-title').textContent(), '| ingredients:', await page.locator('.ingredient-list li').count());
    await page.locator('#recipe-dialog [data-save]').click();
    await page.waitForFunction(() => document.querySelector('#saved-count').textContent === '1');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('[data-share]').click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(shared, /#meal=\d+$/);
    await page.screenshot({ path: path.join(output, 'recipe.png'), fullPage: true });

    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.dialog-close').isVisible(), false);
    assert.equal(await page.locator('.ingredient-list').isVisible(), true);
    await page.emulateMedia({ media: 'screen' });
    await page.locator('#close-dialog').click();
    await page.locator('#favorites-nav').click();
    await settled();
    assert.equal(await page.locator('.meal-card').count(), 1);
    await page.reload();
    await settled();
    assert.equal(await page.locator('#saved-count').textContent(), '1');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await readyForScreenshot();
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    await page.locator('[data-recipe]').first().click();
    await page.locator('.ingredient-list').waitFor();
    assert.equal(await page.locator('#recipe-dialog').evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth), true);
    await page.screenshot({ path: path.join(output, 'mobile-recipe.png') });
    await page.locator('#close-dialog').click();
    await page.locator('.discovery-note [data-random]').click();
    await page.locator('.ingredient-list').waitFor({ timeout: 20000 });
    console.log('Live random:', await page.locator('#recipe-title').textContent());
    assert.deepEqual(errors, []);
    console.log('PASS: live search, filters, details, favorites, share, print, random, mobile.');
    console.log('Screenshots: test-results/');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
