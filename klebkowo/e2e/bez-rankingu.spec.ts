/** Zasada nienegocjowalna nr 1: brak zwycięzców, rankingu i porównań między stolikami. */
import { expect, test } from '@playwright/test';
import { nastepnaFaza, nowaSesja, otworzStolik } from './pomoc.ts';

const SLOWA_RANKINGU = [/zwycięz/i, /ranking/i, /\bmiejsce \d/i, /medal/i, /punktacj/i, /\bwygra/i, /\bprzegra/i, /brawo/i, /porażk/i, /\bbłąd\b/i];

/**
 * Zasady gry wprost mówią, że rankingu NIE MA — te zdania pochodzą z content/gra.json
 * i są jedynym dozwolonym miejscem, gdzie te słowa mogą paść. Usuwamy je przed sprawdzeniem.
 */
const ZAPRZECZENIA = [
  /Symulacja nie przewiduje zwycięzców ani rankingu\./g,
  /Nie ma tu zwycięzców ani rankingu\./g,
];
const bezZaprzeczen = (tekst: string) => ZAPRZECZENIA.reduce((t, w) => t.replace(w, ''), tekst);

test('żaden widok nie pokazuje rankingu ani porównań', async ({ page, context }) => {
  const kody = await nowaSesja(page, '1212');
  const idSesji = await page.evaluate(() => document.body.innerText.match(/Sesja (S-\w+)/)?.[1] ?? '');
  await nastepnaFaza(page);

  const widoki: { nazwa: string; tresc: string }[] = [];
  widoki.push({ nazwa: 'prowadząca', tresc: await page.innerText('body') });

  const stolik = await context.newPage();
  await otworzStolik(stolik, kody.A!);
  widoki.push({ nazwa: 'stolik', tresc: await stolik.innerText('body') });

  const ekran = await context.newPage();
  await ekran.goto(`/ekran/${idSesji}`);
  await ekran.getByText('Runda 1. Plan').first().waitFor();
  widoki.push({ nazwa: 'ekran sali', tresc: await ekran.innerText('body') });

  for (const w of widoki)
    for (const slowo of SLOWA_RANKINGU)
      expect(bezZaprzeczen(w.tresc), `${w.nazwa} nie może zawierać ${slowo}`).not.toMatch(slowo);

  // stoliki zawsze w kolejności A, B, C, D
  for (const strona of [page, ekran]) {
    const etykiety = await strona.locator('.etykieta-stolika').allTextContents();
    if (etykiety.length >= 4) expect(etykiety.slice(0, 4)).toEqual(['A', 'B', 'C', 'D']);
  }
});

test('kolejność stolików nie zmienia się wraz z wartościami liczników', async ({ page, request }) => {
  await nowaSesja(page, '1313');
  const token = await page.evaluate(() => localStorage.getItem('klebkowo:prowadzaca'));
  for (const [stolik, wartosc] of [['A', 1], ['B', 10], ['C', 4], ['D', 8]] as const)
    await request.post('/api/prowadzaca/korekta', {
      headers: { 'x-klebkowo-token': token! },
      data: { stolik, licznik: 'zaufanie', na: wartosc, powod: 'test kolejności' },
    });
  await page.reload();
  await page.getByText('Kody stolików').waitFor();
  const etykiety = await page.locator('.etykieta-stolika').allTextContents();
  expect(etykiety.slice(0, 4)).toEqual(['A', 'B', 'C', 'D']);
  expect(etykiety.slice(4, 8)).toEqual(['A', 'B', 'C', 'D']);
});
