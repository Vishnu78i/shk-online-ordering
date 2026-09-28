import { test, expect } from '@playwright/test';

const TARGET = 'https://wa.me/917483962677?text=';
const CART = JSON.stringify([{id:'butter-roti',qty:1}]);

test('SHK WhatsApp checkout survives 100 complete pickup cycles', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  const failures = [];
  let waRequests = 0;

  await page.route('https://wa.me/**', async route => {
    waRequests += 1;
    await route.abort();
  });
  await page.route('https://wvqocfszawruthkeyaxw.supabase.co/functions/v1/shk-order', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, order_id: 'test-order', order_number: 'SHK-TEST' })
    });
  });
  await page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', async route => {
    await route.fulfill({status:200,contentType:'application/javascript',body:'window.L={};'});
  });

  await page.goto('http://127.0.0.1:4173/checkout.html?e2e=1', {waitUntil:'domcontentloaded'});
  await page.evaluate(cart => {
    localStorage.setItem('shkCart', cart);
    localStorage.removeItem('shkCartMessage');
  }, CART);

  for (let n = 1; n <= 100; n++) {
    await page.goto('http://127.0.0.1:4173/checkout.html?e2e='+n, {waitUntil:'domcontentloaded'});
    await page.locator('#pickup').check();
    await page.locator('#name').fill('Test Customer');
    await page.locator('#phone').fill('7483962677');
    await page.locator('#upi').check();

    const button = page.locator('#placeButton');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    const box = await button.boundingBox();
    if (!box) failures.push(n+': no button bounding box');
    else {
      const hit = await page.evaluate(({x,y}) => {
        const el = document.elementFromPoint(x,y);
        return el && (el.id === 'placeButton' || el.closest?.('#placeButton')?.id === 'placeButton');
      }, {x:box.x+box.width/2,y:box.y+box.height/2});
      if (!hit) failures.push(n+': CTA center is not clickable');
    }

    console.log('BEFORE CONFIRM', n, page.url);
    await page.locator('#confirm').check();
    console.log('AFTER CONFIRM', n, page.url, 'checked=', await page.locator('#confirm').isChecked());
    await page.waitForTimeout(150);
    if (!(await page.locator('#confirm').isChecked())) failures.push(n+': confirmation unchecked itself');

    console.log('BEFORE CLICK', n, page.url, 'href=', await page.locator('#placeButton').getAttribute('href'));
    await page.locator('#placeButton').click({timeout:10000});
    console.log('AFTER CLICK', n, page.url);
    await page.waitForTimeout(50);

    const href = await page.locator('#placeButton').getAttribute('href');
    if (!href?.startsWith(TARGET)) failures.push(n+': href not converted to WhatsApp target');
  }

  if (waRequests !== 100) failures.push('expected 100 WhatsApp navigations, got '+waRequests);
  await context.close();

  expect(failures, failures.join('
')).toEqual([]);
});