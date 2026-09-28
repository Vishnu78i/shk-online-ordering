import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test('SHK checkout CTA diagnostic', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
  page.on('console', m => { if (m.type()==='error') errors.push('CONSOLE: '+m.text()); });

  await page.route('https://wvqocfszawruthkeyaxw.supabase.co/functions/v1/shk-order', async route => {
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,order_id:'test',order_number:'SHK-TEST'})});
  });
  await page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', async route => {
    await route.fulfill({status:200,contentType:'application/javascript',body:'window.L={};'});
  });
  await page.route('https://wa.me/**', async route => { await route.abort(); });

  await page.goto('http://127.0.0.1:4173/checkout.html?e2e=diag', {waitUntil:'domcontentloaded'});
  await page.evaluate(() => localStorage.setItem('shkCart', JSON.stringify([{id:'butter-roti',qty:1}])));
  await page.reload({waitUntil:'domcontentloaded'});

  await page.locator('#pickup').check();
  await page.locator('#name').fill('Test Customer');
  await page.locator('#phone').fill('7483962677');
  await page.locator('#upi').check();
  await page.locator('#confirm').check();
  await page.waitForTimeout(300);

  const diag = await page.evaluate(() => {
    const b=document.querySelector('#placeButton');
    return {
      url:location.href,
      placeType:typeof window.placeOrder,
      buttonTag:b?.tagName,
      href:b?.getAttribute('href'),
      onclick:String(b?.onclick),
      outer:b?.outerHTML,
      topAtCenter:(()=>{const r=b.getBoundingClientRect(); const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {tag:el?.tagName,id:el?.id,cls:el?.className}})()
    };
  });
  console.log('DIAG '+JSON.stringify(diag));
  console.log('ERRORS '+JSON.stringify(errors));

  await page.evaluate(() => {
    const b=document.querySelector('#placeButton');
    b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
  });
  await page.waitForTimeout(100);
  const after = await page.locator('#placeButton').getAttribute('href');
  console.log('AFTER DISPATCH '+after);

  expect(errors).toEqual([]);
  expect(typeof diag.placeType).toBe('function');
  expect(after).toContain('https://wa.me/917483962677?text=');
  await context.close();
});