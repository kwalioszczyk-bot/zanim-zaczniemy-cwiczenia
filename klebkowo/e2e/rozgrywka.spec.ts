import { expect, test } from '@playwright/test';
import { dalej, nastepnaFaza, nowaSesja, otworzStolik } from './pomoc.ts';

test.describe('pełna sesja z czterema stolikami', () => {
  test('prowadząca zakłada sesję, cztery stoliki grają rundę 1', async ({ browser }) => {
    const kontekst = await browser.newContext();
    const prowadzaca = await kontekst.newPage();
    const kody = await nowaSesja(prowadzaca);
    expect(Object.keys(kody).sort()).toEqual(['A', 'B', 'C', 'D']);

    await nastepnaFaza(prowadzaca); // wprowadzenie → runda 1

    const stoliki = await Promise.all(
      (['A', 'B', 'C', 'D'] as const).map(async (id) => {
        const s = await kontekst.newPage();
        await otworzStolik(s, kody[id]!);
        return { id, strona: s };
      }),
    );

    for (const { strona } of stoliki) {
      await expect(strona.getByText('Runda 1. Plan')).toBeVisible();
      // zdarzenie rundy
      const zWyborem = strona.getByRole('button', { name: 'Zapisz naszą reakcję' });
      if (await zWyborem.isVisible().catch(() => false)) {
        await strona.getByRole('group', { name: 'Reakcja zespołu' }).getByRole('button').first().click();
        await zWyborem.click();
      } else {
        await strona.getByRole('button', { name: 'Przyjmujemy do wiadomości' }).click();
      }
      await strona.waitForTimeout(400);
      await dalej(strona); // → informacje
      await strona.getByRole('button', { name: /Wszyscy przeczytali/ }).click();
      await strona.waitForTimeout(300);
      // decyzja
      await strona.getByRole('group').getByRole('button').first().click();
      await strona.getByRole('button', { name: 'Zapisz decyzję zespołu' }).click();
      await expect(strona.getByText('Decyzja zapisana.').first()).toBeVisible();
      await dalej(strona);
      // akcje
      await strona.getByRole('group', { name: 'Działania zespołu' }).getByRole('button').first().click();
      await strona.getByRole('button', { name: 'Zapisz działania' }).click();
      await strona.waitForTimeout(400);
      await dalej(strona);
      // zobowiązania
      await strona.fill('#co-0', 'Rozmowa z sąsiadami');
      await strona.fill('#kiedy-0', 'do następnej rundy');
      await strona.getByRole('button', { name: 'Zapisz zobowiązanie' }).click();
      await strona.waitForTimeout(400);
      await dalej(strona);
      // zatwierdzenie
      await strona.getByRole('button', { name: 'Zatwierdzamy rundę' }).click();
      await expect(strona.getByText('Runda zamknięta')).toBeVisible();
    }

    // prowadząca widzi cztery gotowe stoliki, zawsze w kolejności A–D
    await prowadzaca.reload();
    await prowadzaca.getByText('Kody stolików').waitFor();
    const etykiety = await prowadzaca.locator('.etykieta-stolika').allTextContents();
    expect(etykiety.slice(0, 4)).toEqual(['A', 'B', 'C', 'D']);
    await expect(prowadzaca.getByText('gotowy').first()).toBeVisible();

    await kontekst.close();
  });

  test('zerwane połączenie: ponowne wysłanie operacji nie dubluje efektów', async ({ page, request }) => {
    const kody = await nowaSesja(page, '5555');
    await nastepnaFaza(page);
    const kod = kody.A!;

    const operacja = { opId: 'powtorka-e2e', polecenie: { typ: 'akcje', akcje: ['A6'] } };
    const pierwsza = await (await request.post(`/api/stolik/${kod}/operacja`, { data: operacja })).json();
    const druga = await (await request.post(`/api/stolik/${kod}/operacja`, { data: operacja })).json();
    const trzecia = await (await request.post(`/api/stolik/${kod}/operacja`, { data: operacja })).json();

    expect(pierwsza.powtorzona).toBe(false);
    expect(druga.powtorzona).toBe(true);
    expect(trzecia.powtorzona).toBe(true);
    expect(druga.stolik.liczniki).toEqual(pierwsza.stolik.liczniki);
    expect(trzecia.stolik.akcje.R1).toEqual(['A6']);
  });

  test('zespół przeciążony gra dalej, tylko węziej', async ({ page, request }) => {
    const kody = await nowaSesja(page, '6666');
    await nastepnaFaza(page);
    const kod = kody.B!;
    const token = await page.evaluate(() => localStorage.getItem('klebkowo:prowadzaca'));

    await request.post('/api/prowadzaca/korekta', {
      headers: { 'x-klebkowo-token': token! },
      data: { stolik: 'B', licznik: 'obciazenie', na: 9, powod: 'test wyczerpania' },
    });

    await otworzStolik(page, kod);
    await page.getByRole('button', { name: 'Przyjmujemy do wiadomości' }).click();
    await page.waitForTimeout(300);
    await dalej(page);
    // po przeczytaniu kart informacji aplikacja sama przechodzi do decyzji
    await page.getByRole('button', { name: /Wszyscy przeczytali/ }).click();
    await page.waitForTimeout(300);
    await dalej(page); // decyzja → wybór akcji

    await expect(page.getByText(/Zespół jest przeciążony/)).toBeVisible();
    const duze = page.getByRole('group', { name: 'Działania zespołu' }).getByRole('button', { name: /Spotkanie zespołu/ });
    await expect(duze).toBeDisabled();
    // jedno niewielkie działanie wciąż jest możliwe — zespół nie odpada
    await page.getByRole('group', { name: 'Działania zespołu' }).getByRole('button', { name: /Przerwa na kawę/ }).click();
    await page.getByRole('button', { name: 'Zapisz działania' }).click();
    await expect(page.getByText('Przerwa na kawę i sernik')).toBeVisible();
  });
});

test('kody QR prowadzą na adres w sieci lokalnej, nie na localhost', async ({ page, request }) => {
  const { adresy } = await (await request.get('/api/adresy')).json();
  test.skip(!adresy.length, 'ten komputer nie ma adresu w sieci lokalnej');

  // prowadząca wchodzi przez localhost — tak otwiera przeglądarkę plik startowy
  await nowaSesja(page, '1919');
  const zrodla = await page
    .locator('img[alt*="Kod QR"]')
    .evaluateAll((obrazki) => obrazki.map((i) => decodeURIComponent((i as HTMLImageElement).src.split('tekst=')[1] ?? '')));

  expect(zrodla).toHaveLength(4);
  for (const adres of zrodla) {
    expect(adres, 'kod QR nie może wskazywać na komputer prowadzącej').not.toMatch(/localhost|127\.0\.0\.1/);
    expect(adres).toContain(adresy[0]);
    expect(adres).toMatch(/\/stolik\/[A-Z0-9]{4}$/);
  }
  await expect(page.getByText(`Adres dla stolików: ${adresy[0]}/stolik`)).toBeVisible();
});
