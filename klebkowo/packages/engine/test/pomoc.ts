import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { wczytajTresc } from '../src/schemat.ts';
import { pustyStolik, utworzSesje } from '../src/sesja.ts';
import type { IdStolika, StanStolika } from '../src/typy.ts';

const sciezka = fileURLToPath(new URL('../../../content/gra.json', import.meta.url));
export const surowaTresc = JSON.parse(readFileSync(sciezka, 'utf8'));
export const tresc = wczytajTresc(surowaTresc);

export function stolik(id: IdStolika = 'A', zmiany: Partial<StanStolika> = {}): StanStolika {
  return { ...pustyStolik(tresc, id), ...zmiany };
}

export function sesja(ziarno = 'test-ziarno') {
  return utworzSesje(tresc, { ziarno, id: 'S-TEST', teraz: () => new Date('2026-06-01T12:00:00Z') });
}
