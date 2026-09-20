/** Budżet rozmiaru: widok stolika ma działać na telefonie sprzed pięciu lat. */
import { expect, test } from '@playwright/test';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT_KB = 300;

test('JavaScript widoku stolika mieści się w 300 KB po gzipie', () => {
  const dist = join(process.cwd(), 'packages', 'web', 'dist');
  const html = readFileSync(join(dist, 'stolik.html'), 'utf8');

  const odwiedzone = new Set<string>();
  const kolejka = [...html.matchAll(/assets\/[A-Za-z0-9_.-]+\.js/g)].map((m) => m[0]!);
  let bajty = 0;
  while (kolejka.length) {
    const plik = kolejka.pop()!;
    if (odwiedzone.has(plik)) continue;
    odwiedzone.add(plik);
    const tresc = readFileSync(join(dist, plik));
    bajty += gzipSync(tresc).length;
    const tekst = tresc.toString('utf8');
    for (const m of tekst.matchAll(/"\.\/([A-Za-z0-9_.-]+\.js)"/g)) kolejka.push('assets/' + m[1]);
  }

  const kb = bajty / 1024;
  expect(odwiedzone.size).toBeGreaterThan(0);
  expect(kb, `paczka stolika waży ${kb.toFixed(1)} KB (gzip)`).toBeLessThanOrEqual(LIMIT_KB);
});

test('aplikacja działa po utracie sieci dzięki service workerowi', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'KŁĘBKOWO' }).waitFor();
  // czekamy, aż service worker przejmie kontrolę i zbuforuje pliki aplikacji
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15_000 });
  await page.waitForTimeout(1200);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'KŁĘBKOWO' })).toBeVisible();
  await context.setOffline(false);
});
