'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://127.0.0.1:5511';
const meals = Array.from({ length: 26 }, (_, index) => ({
  idMeal: String(1000 + index),
  strMeal: index % 2 ? `Garden Pasta ${String(index).padStart(2, '0')}` : `Crispy Chicken ${String(index).padStart(2, '0')}`,
  strCategory: index % 2 ? 'Pasta' : 'Chicken',
  strArea: index % 4 ? 'Italian' : 'Indian',
  strMealThumb: 'https://images.test/meal.jpg',
  strInstructions: 'Prepare all the ingredients.\r\n\r\nCook gently until ready.\r\nServe and enjoy.',
  strIngredient1: index % 2 ? 'Pasta' : 'Chicken', strMeasure1: '250 g',
  strIngredient2: ' ', strMeasure2: '',
  strIngredient9: 'Garlic', strMeasure9: '2 cloves',
  strIngredient20: 'Basil', strMeasure20: 'A handful',
  strYoutube: 'https://www.youtube.com/watch?v=example',
  strSource: 'https://example.com/recipe',
}));
let server;
let browser;

before(async () => {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '5511'], { cwd: ROOT, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start.')), 10000);
    server.stdout.on('data', (chunk) => { if (String(chunk).includes('Ready in')) { clearTimeout(timeout); resolve(); } });
    server.stderr.once('data', (chunk) => { clearTimeout(timeout); reject(new Error(String(chunk))); });
    server.once('error', (error) => { clearTimeout(timeout); reject(error); });
  });
  const channels = ['chrome', 'msedge'];
  for (const channel of channels) {
    try { browser = await chromium.launch({ channel, headless: true }); break; } catch { /* Try the next installed browser. */ }
  }
  if (!browser) browser = await chromium.launch({ headless: true });
}, { timeout: 60000 });

after(async () => { if (browser) await browser.close(); if (server) server.kill(); });

async function setup(t, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport || { width: 1366, height: 900 } });
  t.after(() => context.close());
  if (options.blockStorage) await context.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
  });
  const page = await context.newPage();
  const errors = [];
  const calls = [];
  const control = { offline: false, failSearch: false, failLookup: false, failFilters: false, randoms: 0, ...options.control };
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === BASE) return route.continue();
    if (url.hostname === 'www.themealdb.com' && url.pathname.includes('/api/')) {
      calls.push(url);
      if (control.offline) return route.abort();
      const endpoint = url.pathname.split('/').pop();
      const query = url.searchParams;
      if ((control.failSearch && endpoint === 'search.php') || (control.failLookup && endpoint === 'lookup.php') || (control.failFilters && ['list.php', 'categories.php'].includes(endpoint))) return route.fulfill({ status: 503, body: '{}' });
      let data;
      if (endpoint === 'categories.php') data = { categories: ['Chicken', 'Pasta', 'Seafood', 'Vegetarian', 'Dessert'].map((strCategory) => ({ strCategory })) };
      else if (endpoint === 'list.php') data = { meals: [{ strArea: 'Indian' }, { strArea: 'Italian' }] };
      else if (endpoint === 'lookup.php') data = { meals: meals.filter((meal) => meal.idMeal === query.get('i')) };
      else if (endpoint === 'random.php') { control.randoms++; data = { meals: [meals[control.randoms - 1]] }; }
      else if (endpoint === 'filter.php') {
        data = { meals: meals.filter((meal) => (!query.has('c') || meal.strCategory === query.get('c')) && (!query.has('a') || meal.strArea === query.get('a')) && (!query.has('i') || meal.strIngredient1.toLowerCase() === query.get('i').toLowerCase())).map(({ idMeal, strMeal, strMealThumb }) => ({ idMeal, strMeal, strMealThumb })) };
      } else {
        const term = query.get('s') || '';
        if (term === 'slow') { await new Promise((resolve) => setTimeout(resolve, 300)); data = { meals: [meals[1]] }; }
        else if (term === 'fast') data = { meals: [meals[0]] };
        else if (term === 'unsafe') data = { meals: [{ ...meals[0], strMeal: '<img src=x onerror="window.injected=true">', strMealThumb: 'javascript:alert(1)' }] };
        else data = { meals: meals.filter((meal) => meal.strMeal.toLowerCase().includes(term.toLowerCase())) };
        if (!data.meals.length) data.meals = null;
      }
      try { return await route.fulfill({ json: data }); } catch { return; }
    }
    if (url.hostname === 'images.test' || url.pathname.endsWith('.jpg')) return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#d9d4ba"/><circle cx="200" cy="150" r="105" fill="#b6753c"/></svg>' });
    return route.abort();
  });
  await page.goto(BASE + (options.hash || ''));
  await page.waitForFunction(() => document.querySelector('#meals')?.getAttribute('aria-busy') === 'false');
  return { page, context, control, calls, errors };
}

async function waitForCards(page, count) {
  await page.waitForFunction((expected) => document.querySelectorAll('.meal-card:not(.skeleton)').length === expected && document.querySelector('#meals').getAttribute('aria-busy') === 'false', count);
}

test('initial collection, load more, sorting and Enter search', async (t) => {
  const { page, errors } = await setup(t);
  await waitForCards(page, 12);
  assert.match(await page.locator('#results-count').textContent(), /12 of 26/);
  await page.locator('#load-more').click();
  await waitForCards(page, 24);
  await page.locator('#sort-order').selectOption('za');
  await waitForCards(page, 12);
  assert.equal(await page.locator('[data-recipe]').first().textContent(), 'Garden Pasta 25');
  await page.locator('#meal').fill('chicken');
  await page.locator('#meal').press('Enter');
  await page.waitForFunction(() => document.querySelector('#results-count').textContent.includes('of 13'));
  assert.equal(await page.locator('.meal-card h4').filter({ hasText: 'Pasta' }).count(), 0);
  assert.deepEqual(errors, []);
});

test('ingredient, cuisine and category filters intersect; reset clears all', async (t) => {
  const { page, calls, errors } = await setup(t);
  await page.locator('#search-mode').selectOption('ingredient');
  await page.locator('#meal').fill('chicken');
  await page.locator('#search-button').click();
  await page.locator('#category-filter').selectOption('Chicken');
  await page.locator('#area-filter').selectOption('Indian');
  await waitForCards(page, 7);
  assert.match(await page.locator('#results-count').textContent(), /7 of 7/);
  assert(calls.some((url) => url.searchParams.get('i') === 'chicken'));
  assert(calls.some((url) => url.searchParams.get('a') === 'Indian'));
  assert.equal(await page.locator('[data-category="Chicken"]').getAttribute('aria-pressed'), 'true');
  await page.locator('#reset-filters').click();
  await waitForCards(page, 12);
  assert.equal(await page.locator('#meal').inputValue(), '');
  assert.equal(await page.locator('#search-mode').inputValue(), 'name');
  assert.equal(await page.locator('#category-filter').inputValue(), '');
  assert.equal(await page.locator('#area-filter').inputValue(), '');
  assert.deepEqual(errors, []);
});

test('full recipe has ingredient 20, checklist, steps and safe video links', async (t) => {
  const { page, errors } = await setup(t);
  await page.locator('[data-recipe="1000"]').click();
  await page.locator('#recipe-title').filter({ hasText: 'Crispy Chicken 00' }).waitFor();
  assert.equal(await page.locator('.ingredient-list li').count(), 3);
  assert.match(await page.locator('.ingredient-list').textContent(), /Garlic.*2 cloves.*Basil.*A handful/s);
  assert.equal(await page.locator('.instruction-list li').count(), 3);
  await page.locator('.ingredient-list input').first().check();
  assert.equal(await page.locator('.ingredient-list input').first().isChecked(), true);
  assert.equal(await page.locator('.recipe-links a').count(), 2);
  assert.equal(await page.locator('.recipe-links a').first().getAttribute('rel'), 'noopener noreferrer');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#recipe-dialog').evaluate((dialog) => dialog.open), false);
  assert.deepEqual(errors, []);
});

test('favorites survive reload and saved details work with API offline', async (t) => {
  const { page, control, errors } = await setup(t);
  await page.locator('.meal-card [data-save="1000"]').click();
  await page.waitForFunction(() => document.querySelector('#saved-count').textContent === '1');
  control.offline = true;
  await page.reload();
  await page.locator('#favorites-nav').click();
  await waitForCards(page, 1);
  assert.equal(await page.locator('[data-save="1000"]').getAttribute('aria-pressed'), 'true');
  await page.locator('#category-filter').selectOption('Chicken');
  await page.locator('#area-filter').selectOption('Indian');
  await waitForCards(page, 1);
  await page.locator('[data-recipe="1000"]').click();
  await page.locator('.ingredient-list').waitFor();
  assert.match(await page.locator('#recipe-title').textContent(), /Crispy Chicken/);
  await page.locator('#close-dialog').click();
  await page.locator('.meal-card [data-save="1000"]').click();
  await page.waitForFunction(() => document.querySelector('#saved-count').textContent === '0');
  assert.match(await page.locator('#results-state').textContent(), /Keep your favorites close/);
  assert.deepEqual(errors, []);
});

test('empty results and failed API both offer a working recovery action', async (t) => {
  const { page, control, errors } = await setup(t);
  await page.locator('#meal').fill('nothingmatches');
  await page.locator('#meal').press('Enter');
  await page.locator('[data-state-action="reset"]').waitFor();
  await page.locator('[data-state-action="reset"]').click();
  await waitForCards(page, 12);
  control.failSearch = true;
  await page.locator('#meal').fill('new-query');
  await page.locator('#meal').press('Enter');
  await page.locator('[data-state-action="retry"]').waitFor();
  control.failSearch = false;
  await page.locator('#meal').fill('chicken');
  await page.locator('[data-state-action="retry"]').click();
  await waitForCards(page, 12);
  assert.match(await page.locator('#results-count').textContent(), /of 13/);
  assert.deepEqual(errors, []);
});

test('stale searches never overwrite a newer search', async (t) => {
  const { page, errors } = await setup(t);
  await page.locator('#meal').fill('slow');
  await page.locator('#meal').press('Enter');
  await page.locator('#meal').fill('fast');
  await page.locator('#meal').press('Enter');
  await waitForCards(page, 1);
  await page.waitForTimeout(450);
  assert.equal(await page.locator('[data-recipe]').textContent(), 'Crispy Chicken 00');
  assert.match(await page.locator('#results-title').textContent(), /fast/);
  assert.deepEqual(errors, []);
});

test('failed filter metadata can be retried without blocking meal discovery', async (t) => {
  const { page, control, errors } = await setup(t, { control: { failFilters: true } });
  await waitForCards(page, 12);
  await page.locator('#metadata-status').waitFor({ state: 'visible' });
  control.failFilters = false;
  await page.locator('#retry-filters').click();
  await page.waitForFunction(() => document.querySelector('#category-filter').options.length > 1 && document.querySelector('#metadata-status').hidden);
  await page.locator('[data-category="Chicken"]').click();
  await page.waitForFunction(() => document.querySelector('#results-count').textContent.includes('of 13'));
  assert.deepEqual(errors, []);
});

test('failed recipe details can be retried inside the dialog', async (t) => {
  const { page, control, errors } = await setup(t, { hash: '#meal=1000', control: { failLookup: true } });
  await page.locator('[data-retry-recipe]').waitFor();
  control.failLookup = false;
  await page.locator('[data-retry-recipe]').click();
  await page.locator('.ingredient-list').waitFor();
  assert.match(await page.locator('#recipe-title').textContent(), /Crispy Chicken/);
  assert.deepEqual(errors, []);
});

test('a storage failure never pretends the recipe was saved', async (t) => {
  const { page, errors } = await setup(t, { blockStorage: true });
  await page.locator('.meal-card [data-save="1000"]').click();
  await page.locator('#toast').filter({ hasText: 'Couldn’t save this change' }).waitFor();
  assert.equal(await page.locator('#saved-count').textContent(), '0');
  assert.equal(await page.locator('.meal-card [data-save="1000"]').getAttribute('aria-pressed'), 'false');
  assert.deepEqual(errors, []);
});

test('random recipes bypass the cache and shared links open full details', async (t) => {
  const { page, control, errors } = await setup(t, { hash: '#meal=1000' });
  await page.locator('.ingredient-list').waitFor();
  await page.locator('#close-dialog').click();
  await page.locator('.header-random').click();
  await page.locator('#recipe-title').filter({ hasText: 'Crispy Chicken 00' }).waitFor();
  await page.locator('#close-dialog').click();
  await page.locator('.header-random').click();
  await page.locator('#recipe-title').filter({ hasText: 'Garden Pasta 01' }).waitFor();
  assert.equal(control.randoms, 2);
  assert.deepEqual(errors, []);
});

test('API text is escaped and unsafe image URLs are rejected', async (t) => {
  const { page, errors } = await setup(t);
  await page.locator('#meal').fill('unsafe');
  await page.locator('#meal').press('Enter');
  await waitForCards(page, 1);
  assert.match(await page.locator('.meal-card h4').textContent(), /<img src=x/);
  assert.equal(await page.locator('.meal-card img').count(), 0);
  assert.equal(await page.evaluate(() => Boolean(window.injected)), false);
  assert.deepEqual(errors, []);
});

test('mobile layout stays within viewport and modal remains usable', async (t) => {
  const { page, errors } = await setup(t, { viewport: { width: 390, height: 844 } });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.locator('#meals').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length), 2);
  await page.locator('[data-recipe="1000"]').click();
  await page.locator('.ingredient-list').waitFor();
  assert.equal(await page.locator('#recipe-dialog').evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth), true);
  await page.locator('#close-dialog').click();
  assert.equal(await page.locator('#recipe-dialog').evaluate((dialog) => dialog.open), false);
  assert.deepEqual(errors, []);
});

test('Next.js serves the app and keeps project internals private', async () => {
  assert.equal((await fetch(BASE)).status, 200);
  assert.match(await (await fetch(BASE)).text(), /_next\/static/);
  for (const file of ['/.git/config', '/package.json', '/server.cjs', '/tests/app.test.cjs', '/../package.json', '/src/lib/mealdb.ts', '/api.js']) assert.equal((await fetch(BASE + file)).status, 404);
});
