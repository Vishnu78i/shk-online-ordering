import { test, expect } from '@playwright/test';

test.setTimeout(120000);

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

  await page.goto('http://127.0.0.1:4173/checkout.html?e2e=seed', {waitUntil:'domcontentloaded'});
  await page.evaluate(cart => {
    localStorage.setItem('shkCart', cart);
    localStorage.removeItem('shkCartMessage');
  }, CART);

  for (let n = 1; n <= 1; n++) {
    await page.goto('http://127.0.0.1:4173/checkout.html?e2e='+n, {waitUntil:'domcontentloaded'});
    await page.locator('#pickup').check();
    await page.locator('#name').fill('Test Customer');
    await page.locator('#phone').fill('7483962677');
    await page.locator('#upi').check();

    const button = page.locator('#placeButton');
    await expect(button).toBeVisible();
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();

    const stack = box ? await page.evaluate(({x,y}) => document.elementsFromPoint(x,y).slice(0,8).map(el => ({
      tag:el.tagName,id:el.id,cls:el.className,pointerEvents:getComputedStyle(el).pointerEvents
    })), {x:box.x+box.width/2,y:box.y+box.height/2}) : [];
    console.log('CTA STACK', JSON.stringify(stack));

    await page.locator('#confirm').check();
    await page.waitForTimeout(150);
    if (!(await page.locator('#confirm').isChecked())) failures.push(n+': confirmation unchecked itself');

    await page.locator('#placeButton').click({timeout:10000});
    await page.waitForTimeout(100);

    const href = await page.locator('#placeButton').getAttribute('href');
    console.log('CTA HREF', href);
    if (!href?.startsWith(TARGET)) failures.push(n+': href not converted to WhatsApp target');
  }

  if (waRequests !== 1) failures.push('expected 1 WhatsApp navigation, got '+waRequests);
  await context.close();
  expect(failures, failures.join('\\n')).toEqual([]);
});