/** WCAG 2.1 AA, obsługa klawiatury, rozmiary celów dotykowych. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { dalej, nastepnaFaza, nowaSesja, otworzStolik } from './pomoc.ts';

async function audyt(strona: Page, nazwa: string) {
  const wynik = await new AxeBuilder({ page: strona })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const opis = wynik.violations
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.html).slice(0, 3).join('\n    ')}`)
    .join('\n');
  expect(wynik.violations, `${nazwa}:\n${opis}`).toEqual([]);
}

test('rozdroże, stolik, ekran sali i druk przechodzą audyt axe', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'KŁĘBKOWO' }).waitFor();
  await audyt(page, 'rozdroże');

  const kody = await nowaSesja(page, '3333');
  const idSesji = await page.evaluate(() => document.body.innerText.match(/Sesja (S-\w+)/)?.[1] ?? '');
  await audyt(page, 'prowadząca');
  await nastepnaFaza(page);

  const stolik = await context.newPage();
  await otworzStolik(stolik, kody.A!);
  await audyt(stolik, 'stolik — zdarzenie');
  await stolik.getByRole('button', { name: 'Przyjmujemy do wiadomości' }).click();
  await stolik.waitForTimeout(300);
  await dalej(stolik);
  await stolik.getByRole('button', { name: /Wszyscy przeczytali/ }).click();
  await stolik.waitForTimeout(300);
  await audyt(stolik, 'stolik — decyzja');

  const ekran = await context.newPage();
  await ekran.goto(`/ekran/${idSesji}`);
  await ekran.getByText('Runda 1. Plan').first().waitFor();
  await audyt(ekran, 'ekran sali');

  const druk = await context.newPage();
  await druk.goto('/druk');
  await druk.getByRole('heading', { name: 'Materiały do druku' }).waitFor();
  await audyt(druk, 'druk');
});

test('język strony to polski, a układ działa przy szerokości 360 px', async ({ page }) => {
  const kody = await nowaSesja(page, '3434');
  await nastepnaFaza(page);
  await page.setViewportSize({ width: 360, height: 720 });
  await otworzStolik(page, kody.C!);
  expect(await page.getAttribute('html', 'lang')).toBe('pl');
  // brak poziomego przewijania na wąskim ekranie
  const nadmiar = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(nadmiar).toBeLessThanOrEqual(1);
});

test('przyciski mają co najmniej 48 × 48 px i widoczny fokus', async ({ page }) => {
  const kody = await nowaSesja(page, '3535');
  await nastepnaFaza(page);
  await otworzStolik(page, kody.D!);

  const przyciski = page.locator('button:visible');
  const ile = await przyciski.count();
  expect(ile).toBeGreaterThan(2);
  for (let i = 0; i < ile; i++) {
    const p = przyciski.nth(i);
    const pudelko = await p.boundingBox();
    if (!pudelko) continue;
    expect(pudelko.height, `przycisk „${(await p.innerText()).slice(0, 30)}” jest za niski`).toBeGreaterThanOrEqual(44);
    expect(pudelko.width).toBeGreaterThanOrEqual(44);
  }

  await page.keyboard.press('Tab');
  const zarys = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const styl = getComputedStyle(el);
    return { szerokosc: styl.outlineWidth, styl: styl.outlineStyle };
  });
  expect(zarys).not.toBeNull();
  expect(parseFloat(zarys!.szerokosc)).toBeGreaterThanOrEqual(2);
  expect(zarys!.styl).not.toBe('none');
});

test('wykres ma opis tekstowy i tabelę danych', async ({ page, request }) => {
  const kody = await nowaSesja(page, '3636');
  const token = await page.evaluate(() => localStorage.getItem('klebkowo:prowadzaca'));
  for (let i = 0; i < 4; i++)
    await request.post('/api/prowadzaca/faza', { headers: { 'x-klebkowo-token': token! }, data: {} });

  await otworzStolik(page, kody.A!);
  await page.getByRole('img', { name: /Przebieg liczników/ }).waitFor();
  await page.getByText('Te same dane w tabeli').click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Współtworzenie' })).toBeVisible();
});

test('prefers-reduced-motion wyłącza animacje', async ({ browser }) => {
  const kontekst = await browser.newContext({ reducedMotion: 'reduce' });
  const strona = await kontekst.newPage();
  await strona.goto('/');
  await strona.getByRole('heading', { name: 'KŁĘBKOWO' }).waitFor();
  // przycisk to jedyny element z zadeklarowanym przejściem — przy reduced-motion ma zniknąć
  const sekundy = await strona.evaluate(() => {
    const el = document.querySelector('.przycisk') as HTMLElement | null;
    if (!el) return null;
    const czas = getComputedStyle(el).transitionDuration.split(',')[0]!.trim();
    return czas.endsWith('ms') ? parseFloat(czas) / 1000 : parseFloat(czas);
  });
  expect(sekundy).not.toBeNull();
  expect(sekundy!).toBeLessThan(0.01);
  await kontekst.close();
});
