/** Operacje na licznikach: wartości startowe, przycinanie do zakresu, nakładanie efektów. */
import type { Efekt, IdLicznika, Liczniki } from './typy.ts';
import { LICZNIKI_JAWNE, LICZNIKI_UKRYTE } from './typy.ts';
import type { Licznik, Tresc } from './schemat.ts';

export function definicjeLicznikow(t: Tresc): Record<string, Licznik> {
  const mapa: Record<string, Licznik> = {};
  for (const l of [...t.liczniki.jawne, ...t.liczniki.ukryte]) mapa[l.id] = l;
  return mapa;
}

export function licznikiStartowe(t: Tresc): Liczniki {
  const def = definicjeLicznikow(t);
  const wynik = {} as Liczniki;
  for (const id of [...LICZNIKI_JAWNE, ...LICZNIKI_UKRYTE]) wynik[id] = def[id]?.start ?? 0;
  return wynik;
}

export function przytnij(t: Tresc, id: IdLicznika, wartosc: number): number {
  const def = definicjeLicznikow(t)[id];
  if (!def) return wartosc;
  return Math.max(def.min, Math.min(def.max, Math.round(wartosc)));
}

/**
 * Nakłada efekt na liczniki. Zwraca nowy zestaw liczników oraz rzeczywiste zmiany
 * (po przycięciu do zakresu) — to one są pokazywane przy karcie zdarzenia czy akcji.
 */
export function zastosujEfekt(
  t: Tresc,
  liczniki: Liczniki,
  efekt: Efekt | undefined,
): { liczniki: Liczniki; zmiany: Efekt } {
  const nowe: Liczniki = { ...liczniki };
  const zmiany: Efekt = {};
  if (!efekt) return { liczniki: nowe, zmiany };
  for (const [klucz, delta] of Object.entries(efekt)) {
    if (typeof delta !== 'number' || delta === 0) continue;
    const id = klucz as IdLicznika;
    const przed = nowe[id] ?? 0;
    const po = przytnij(t, id, przed + delta);
    if (po !== przed) zmiany[id] = po - przed;
    nowe[id] = po;
  }
  return { liczniki: nowe, zmiany };
}

/** Suma dwóch efektów — używana przy łączeniu skutków w jednej fazie. */
export function polaczEfekty(a: Efekt, b: Efekt): Efekt {
  const wynik: Efekt = { ...a };
  for (const [klucz, delta] of Object.entries(b)) {
    if (typeof delta !== 'number') continue;
    const id = klucz as IdLicznika;
    wynik[id] = (wynik[id] ?? 0) + delta;
  }
  return wynik;
}

/** Łagodzi efekt o `o` punktów w każdym ujemnym składniku (A5 przy zwrocie akcji). */
export function zlagodzEfekt(efekt: Efekt, o: number): Efekt {
  if (o <= 0) return { ...efekt };
  const wynik: Efekt = {};
  for (const [klucz, delta] of Object.entries(efekt)) {
    if (typeof delta !== 'number') continue;
    const id = klucz as IdLicznika;
    wynik[id] = delta < 0 ? Math.min(0, delta + o) : delta;
  }
  return wynik;
}

/** Tylko jawne liczniki — projekcja dla stolika i ekranu sali. */
export function tylkoJawne(liczniki: Liczniki): Record<string, number> {
  const wynik: Record<string, number> = {};
  for (const id of LICZNIKI_JAWNE) wynik[id] = liczniki[id];
  return wynik;
}

/** Zapis zmiany licznika w formie czytelnej na karcie („Czas −2”, „Zaufanie +1”). */
export function opiszZmiane(t: Tresc, id: IdLicznika, delta: number): string {
  const nazwa = definicjeLicznikow(t)[id]?.nazwa ?? id;
  const znak = delta > 0 ? '+' : '−';
  return `${nazwa} ${znak}${Math.abs(delta)}`;
}

export function opiszZmiany(t: Tresc, zmiany: Efekt): string[] {
  return Object.entries(zmiany)
    .filter(([, d]) => typeof d === 'number' && d !== 0)
    .map(([id, d]) => opiszZmiane(t, id as IdLicznika, d as number));
}
