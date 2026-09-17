/** Kryterium akceptacji nr 3: stolik nie może ustalić, czy jego decyzja była zgodna z pełną wiedzą. */
import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { dalej, nastepnaFaza, nowaSesja, otworzStolik } from './pomoc.ts';

const ZAKAZANE = [/opcja_zgodna/i, /skutki_opcji/i, /ryzyko/i, /spotkania/i, /nie_ujawniac/i, /Stasser/i];

test('paczka urządzenia stolika nie zawiera ukrytej treści gry', async () => {
  const dist = join(process.cwd(), 'packages', 'web', 'dist');
  const html = readFileSync(join(dist, 'stolik.html'), 'utf8');
  const wejscia = [...html.matchAll(/assets\/[A-Za-z0-9_.-]+\.js/g)].map((m) => m[0]);
  expect(wejscia.length).toBeGreaterThan(0);

  // przechodzimy cały graf modułów paczki stolika
  const odwiedzone = new Set<string>();
  const kolejka = [...wejscia];
  while (kolejka.length) {
    const plik = kolejka.pop()!;
    if (odwiedzone.has(plik)) continue;
    odwiedzone.add(plik);
    const tresc = readFileSync(join(dist, plik), 'utf8');
    for (const wzorzec of ZAKAZANE) expect(tresc, `${plik} nie może zawierać ${wzorzec}`).not.toMatch(wzorzec);
    for (const m of tresc.matchAll(/"\.\/([A-Za-z0-9_.-]+\.js)"/g)) kolejka.push('assets/' + m[1]);
    for (const m of tresc.matchAll(/assets\/[A-Za-z0-9_.-]+\.js/g)) kolejka.push(m[0]);
  }
  expect(odwiedzone.size).toBeGreaterThan(1);
});

test('odpowiedzi API dla stolika nie różnią się między decyzją zgodną a niezgodną', async ({ page, request }) => {
  const kody = await nowaSesja(page, '7777');
  await nastepnaFaza(page);

  // stolik A: opcja zgodna to B, stolik C: opcja zgodna to B — wybieramy różnie
  const zgodna = await (
    await request.post(`/api/stolik/${kody.A}/operacja`, {
      data: { opId: 'z1', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'B' } },
    })
  ).json();
  const niezgodna = await (
    await request.post(`/api/stolik/${kody.C}/operacja`, {
      data: { opId: 'n1', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'A' } },
    })
  ).json();

  expect(zgodna.wynik.komunikat).toBe('Decyzja zapisana.');
  expect(niezgodna.wynik.komunikat).toBe('Decyzja zapisana.');
  expect(Object.keys(zgodna.wynik).sort()).toEqual(Object.keys(niezgodna.wynik).sort());
  expect(zgodna.stolik.liczniki).toEqual(niezgodna.stolik.liczniki);
  for (const wzorzec of ZAKAZANE) {
    expect(JSON.stringify(zgodna)).not.toMatch(wzorzec);
    expect(JSON.stringify(niezgodna)).not.toMatch(wzorzec);
  }
});

test('DOM stolika i ekranu sali nie zdradza ukrytych danych', async ({ page, request }) => {
  const kody = await nowaSesja(page, '8888');
  const idSesji = await page.evaluate(() => document.body.innerText.match(/Sesja (S-\w+)/)?.[1] ?? '');
  await nastepnaFaza(page);

  const stolik = await page.context().newPage();
  await otworzStolik(stolik, kody.A!);
  await stolik.getByRole('button', { name: 'Przyjmujemy do wiadomości' }).click();
  await stolik.waitForTimeout(400);
  await dalej(stolik);
  await stolik.getByRole('button', { name: /Wszyscy przeczytali/ }).click();
  await stolik.waitForTimeout(300);

  const domStolika = await stolik.content();
  for (const wzorzec of ZAKAZANE) expect(domStolika).not.toMatch(wzorzec);

  const ekran = await page.context().newPage();
  await ekran.goto(`/ekran/${idSesji}`);
  await ekran.getByText('Runda 1. Plan').first().waitFor();
  const domEkranu = await ekran.content();
  for (const wzorzec of ZAKAZANE) expect(domEkranu).not.toMatch(wzorzec);
  // ekran sali nie pokazuje liczników stolików
  expect(domEkranu).not.toMatch(/tor__wartosc/);
});

test('bez PIN-u nie ma dostępu do trybu omówienia', async ({ request }) => {
  expect((await request.get('/api/omowienie')).status()).toBe(401);
  expect((await request.get('/api/prowadzaca/stan')).status()).toBe(401);
  expect((await request.get('/api/omowienie/eksport.json')).status()).toBe(401);
});

test('aplikacja nie odpytuje żadnego serwera poza własnym', async ({ page, context }) => {
  const obce: string[] = [];
  context.on('request', (z) => {
    const url = new URL(z.url());
    if (url.hostname !== 'localhost' && url.protocol !== 'data:' && url.protocol !== 'blob:') obce.push(z.url());
  });
  const kody = await nowaSesja(page, '9999');
  await nastepnaFaza(page);
  const stolik = await context.newPage();
  await otworzStolik(stolik, kody.D!);
  await stolik.waitForTimeout(1000);
  expect(obce).toEqual([]);
});

test('nagłówki bezpieczeństwa są ustawione', async ({ request }) => {
  const o = await request.get('/api/zdrowie');
  const csp = o.headers()['content-security-policy'] ?? '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).not.toMatch(/https?:\/\//);
  expect(o.headers()['x-content-type-options']).toBe('nosniff');
  expect(o.headers()['referrer-policy']).toBe('no-referrer');
});

test('arkusz dla uczestników nie zdradza mechanizmu ukrytego', () => {
  const html = readFileSync(join(process.cwd(), 'druk', 'html', '13_scenariusz_i_zasady_dla_uczestnikow.html'), 'utf8');
  // „Spotkanie zespołu” to nazwa akcji A1 i ma prawo tu być — zakazana jest nazwa ukrytego licznika
  const zakazane = [
    /ryzyk/i,
    /liczba spotkań/i,
    /zgodn\w* z pełną wiedzą/i,
    /skutek decyzji/i,
    /ukryt\w/i,
    /Stasser/i,
    /arkusz śledzenia/i,
    /klucz decyzji/i,
  ];
  for (const wzorzec of zakazane) expect(html, `arkusz uczestników nie może zawierać ${wzorzec}`).not.toMatch(wzorzec);
  // a jednocześnie musi zawierać to, czego zespół naprawdę potrzebuje
  expect(html).toContain('Kart nie pokazujecie');
  expect(html).toContain('Wasze liczniki');
  expect(html).toContain('Jak przebiega runda');
});

test('pełne zasady dla prowadzącej zawierają mechanizm ukryty', () => {
  const html = readFileSync(join(process.cwd(), 'druk', 'html', '00_instrukcja_prowadzacej.html'), 'utf8');
  for (const wymagane of ['Pełne zasady gry', 'Ukryte ryzyko', 'Liczba spotkań zespołu', 'od rundy następnej'])
    expect(html, `instrukcja prowadzącej musi zawierać „${wymagane}”`).toContain(wymagane);
});
