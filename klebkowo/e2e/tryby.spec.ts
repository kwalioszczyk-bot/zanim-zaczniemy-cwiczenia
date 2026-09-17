import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nastepnaFaza, nowaSesja, otworzStolik, dalej } from './pomoc.ts';

test('tryb projektora działa bez backendu', async ({ page, context }) => {
  // po wejściu do trybu projektora odcinamy serwer — gra ma toczyć się dalej
  await page.goto('/projektor');
  await page.getByRole('button', { name: 'Zacznij nową grę' }).click();
  await page.getByText('Wprowadzenie').first().waitFor();

  await context.route('**/api/**', (r) => r.abort());

  await page.getByRole('button', { name: 'Następna faza' }).click();
  await expect(page.getByText('Runda 1. Plan').first()).toBeVisible();
  await page.getByRole('button', { name: 'Rozstrzygnij' }).first().click();
  await expect(page.getByText('rozstrzygnięte').first()).toBeVisible();

  // stan przeżywa odświeżenie strony (localStorage)
  await page.reload();
  await page.getByText('Runda 1. Plan').first().waitFor();
  await expect(page.getByText('rozstrzygnięte').first()).toBeVisible();
  await expect(page.getByText(/Stan gry zostaje wyłącznie w tej przeglądarce/)).toBeVisible();
});

test('tryb podawania urządzenia pokazuje karty pojedynczo', async ({ page, request }) => {
  const kody = await nowaSesja(page, '2323');
  const token = await page.evaluate(() => localStorage.getItem('klebkowo:prowadzaca'));
  // wyłączamy wariant papierowy, żeby sprawdzić tryb podawania urządzenia
  await request.post('/api/prowadzaca/ustawienia', {
    headers: { 'x-klebkowo-token': token! },
    data: { kartyPrywatneNaPapierze: false },
  });
  await nastepnaFaza(page);

  const stolik = await page.context().newPage();
  await otworzStolik(stolik, kody.A!);
  await stolik.getByRole('button', { name: 'Przyjmujemy do wiadomości' }).click();
  await stolik.waitForTimeout(300);
  await dalej(stolik);

  // treść prywatna jest ukryta do czasu potwierdzenia przez właściwą osobę
  await expect(stolik.getByText('Przekażcie urządzenie')).toBeVisible();
  await expect(stolik.getByText(/Przy wejściu bocznym jest podjazd/)).toBeHidden();
  await stolik.getByRole('button', { name: /Jestem R1 — pokaż/ }).click();
  await expect(stolik.getByText(/Przy wejściu bocznym jest podjazd/)).toBeVisible();
  await expect(stolik.getByText(/Ukryje się samo za/)).toBeVisible();
  await stolik.getByRole('button', { name: 'Ukryj i przekaż dalej' }).click();
  await expect(stolik.getByText(/Przy wejściu bocznym jest podjazd/)).toBeHidden();
  await expect(stolik.getByRole('button', { name: /Jestem R2 — pokaż/ })).toBeVisible();
});

test('wariant „karty prywatne na papierze” pomija tryb podawania urządzenia', async ({ page }) => {
  const kody = await nowaSesja(page, '2424');
  await nastepnaFaza(page);
  const stolik = await page.context().newPage();
  await otworzStolik(stolik, kody.A!);
  await stolik.getByRole('button', { name: 'Przyjmujemy do wiadomości' }).click();
  await stolik.waitForTimeout(300);
  await dalej(stolik);
  await expect(stolik.getByText(/Odczytajcie swoje karty z koperty nr/)).toBeVisible();
  await expect(stolik.getByRole('button', { name: /Jestem R1/ })).toHaveCount(0);
});

test('podgląd materiałów do druku składa wszystkie arkusze', async ({ page }) => {
  await page.goto('/druk');
  await page.getByText('Materiały do druku').first().waitFor();
  await expect(page.getByRole('heading', { name: 'Instrukcja prowadzącej' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Karty ról' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Żetony i znaczniki' })).toBeVisible();
  // 1 instrukcja + 4 plansze + role + misje + 4 komplety informacji + koperty + zdarzenia
  // + skutki + akcje + druki + arkusz śledzenia + Kronika + żetony + zasady dla uczestników
  const arkusze = await page.locator('button.karteczka--2').count();
  expect(arkusze).toBe(20);

  await page.getByRole('heading', { name: /Arkusz śledzenia/ }).click();
  await expect(page.getByText(/Ten arkusz jest wyłącznie dla prowadzącej/)).toBeVisible();
  await expect(page.locator('#podglad')).toBeVisible();
});

test('npm run druk tworzy komplet plików PDF', () => {
  test.slow();
  execFileSync('npm', ['run', 'druk'], { cwd: process.cwd(), stdio: 'pipe', timeout: 300_000 });
  const katalog = join(process.cwd(), 'druk');
  const pliki = readdirSync(katalog).filter((p) => p.endsWith('.pdf')).sort();
  expect(pliki).toHaveLength(20);
  expect(pliki[0]).toBe('00_instrukcja_prowadzacej.pdf');
  for (const p of pliki) expect(statSync(join(katalog, p)).size, p).toBeGreaterThan(10_000);
  for (const wymagany of [
    '01_plansza_stolika_A3_A.pdf',
    '04_karty_informacji_D.pdf',
    '07_karty_skutkow.pdf',
    '10_arkusz_prowadzacej.pdf',
    '12_zetony.pdf',
  ])
    expect(existsSync(join(katalog, wymagany)), wymagany).toBe(true);
});
