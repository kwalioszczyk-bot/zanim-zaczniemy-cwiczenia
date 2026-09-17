import type { Page } from '@playwright/test';

/** Tworzy sesję i zwraca kody stolików A–D. */
export async function nowaSesja(strona: Page, pin = '4321'): Promise<Record<string, string>> {
  await strona.goto('/prowadzaca');
  await strona.fill('#pin', pin);
  await strona.getByRole('button', { name: 'Utwórz sesję' }).click();
  await strona.getByText('Kody stolików').waitFor();
  return strona.evaluate(() => {
    const kody: Record<string, string> = {};
    for (const img of document.querySelectorAll('img')) {
      const m = img.alt.match(/stolika (\w), kod (\w{4})/);
      if (m) kody[m[1]!] = m[2]!;
    }
    return kody;
  });
}

export async function nastepnaFaza(strona: Page): Promise<void> {
  await strona.getByRole('button', { name: 'Następna faza' }).click();
  await strona.waitForTimeout(400);
}

export async function otworzStolik(strona: Page, kod: string): Promise<void> {
  await strona.goto(`/stolik/${kod}`);
  await strona.locator('.pasek__tytul').waitFor();
}

export async function dalej(strona: Page): Promise<void> {
  await strona.getByRole('button', { name: 'Dalej →' }).click();
  await strona.waitForTimeout(300);
}
