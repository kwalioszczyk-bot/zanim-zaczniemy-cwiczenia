/**
 * Kronika Kłębkowa — „wydanie specjalne” dla każdego stolika.
 * Nigdy nie porównuje stolików i nigdy nie podaje liczby ukrytego ryzyka;
 * ukryty licznik może najwyżej dołożyć jedno zdanie o niespodziance.
 */
import type { IdLicznikaJawnego, Liczniki, StanStolika } from './typy.ts';
import { LICZNIKI_JAWNE } from './typy.ts';
import type { Tresc } from './schemat.ts';
import { sprawdzWarunek } from './warunki.ts';

export interface SeriaWykresu {
  licznik: IdLicznikaJawnego;
  nazwa: string;
  wartosci: number[];
}

export interface DaneWykresu {
  etykiety: string[];
  serie: SeriaWykresu[];
  min: number;
  max: number;
  /** Opis dla czytnika ekranu — wykres nigdy nie jest jedynym nośnikiem informacji. */
  opis: string;
}

export interface Kronika {
  stolik: string;
  tytul: string;
  nazwaPrzedsiewziecia: string;
  naglowek: string;
  zdania: string[];
  podpis: string;
  wykres: DaneWykresu;
}

function podstaw(tekst: string, nazwa: string): string {
  return tekst.replace(/\{nazwa\}/g, nazwa);
}

/** Dane wykresu kosztów: przebieg czterech jawnych liczników po każdej fazie. */
export function daneWykresu(t: Tresc, historia: { etykieta: string; liczniki: Liczniki }[]): DaneWykresu {
  const nazwy = new Map(t.liczniki.jawne.map((l) => [l.id, l.nazwa]));
  const serie: SeriaWykresu[] = LICZNIKI_JAWNE.map((id) => ({
    licznik: id,
    nazwa: nazwy.get(id) ?? id,
    wartosci: historia.map((h) => h.liczniki[id]),
  }));
  const wszystkie = serie.flatMap((s) => s.wartosci);
  const min = Math.min(0, ...wszystkie);
  const max = Math.max(10, ...wszystkie);
  const opis =
    'Przebieg liczników: ' +
    serie
      .map((s) => `${s.nazwa} — ${s.wartosci.map((w, i) => `${historia[i]?.etykieta ?? ''}: ${w}`).join(', ')}`)
      .join('; ') +
    '.';
  return { etykiety: historia.map((h) => h.etykieta), serie, min, max, opis };
}

export function zbudujKronike(t: Tresc, stolik: StanStolika): Kronika {
  const opis = t.stoliki.find((s) => s.id === stolik.id);
  const nazwa = opis?.nazwa ?? stolik.id;
  const liczniki: Record<string, number> = { ...stolik.liczniki };

  const regula = t.kronika.reguly_naglowka.find((r) => sprawdzWarunek(r.warunek, liczniki));
  const naglowek = podstaw(regula?.tekst ?? '', nazwa);
  const zdania = t.kronika.zdania_dodatkowe
    .filter((r) => sprawdzWarunek(r.warunek, liczniki))
    .map((r) => podstaw(r.tekst, nazwa));

  return {
    stolik: stolik.id,
    tytul: t.kronika.tytul,
    nazwaPrzedsiewziecia: nazwa,
    naglowek,
    zdania,
    podpis: t.kronika.podpis,
    wykres: daneWykresu(t, stolik.historia),
  };
}
