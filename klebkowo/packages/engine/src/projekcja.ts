/**
 * Projekcja treści gry dla urządzenia stolika.
 *
 * Stolik dostaje wyłącznie to, co jest mu potrzebne do gry. Z tej struktury nie da się
 * odczytać, która opcja jest zgodna z pełną wiedzą zespołu, jakie skutki czekają za rogiem
 * ani że istnieją ukryte liczniki. Dotyczy to także odpowiedzi API — kryterium akceptacji nr 3.
 */
import type { IdStolika } from './typy.ts';
import type { Tresc } from './schemat.ts';

export interface DecyzjaDlaStolika {
  pytanie: string;
  opcje: Record<string, string>;
  informacje_wspolne: string[];
  informacje_unikalne: Record<string, string>;
}

export interface TrescDlaStolika {
  meta: Tresc['meta'];
  wstep_do_odczytania: string;
  zasady: string[];
  instytucje: Record<string, string>;
  role: Tresc['role'];
  sektory_uczestnikow: Tresc['sektory_uczestnikow'];
  liczniki: { jawne: Tresc['liczniki']['jawne']; wyczerpanie: Tresc['liczniki']['wyczerpanie'] };
  akcje: {
    id: string; nazwa: string; opis: string; duza: boolean;
    efekt: Record<string, number>; chroni_przed?: string[]; wymaga?: string;
  }[];
  limit_akcji_na_runde: number;
  zobowiazania: Tresc['zobowiazania'];
  zdarzenia: { id: string; tytul: string; tekst: string; wybor?: { etykieta: string }[] }[];
  struktura_rundy: Tresc['struktura_rundy'];
  stolik: { id: IdStolika; nazwa: string; misja: string; decyzja_r1: DecyzjaDlaStolika; zwrot_akcji: { tytul: string; tekst: string }; decyzja_r3: DecyzjaDlaStolika };
  kronika: { tytul: string; podpis: string };
  komunikat_decyzji: string;
}

function decyzjaBezKlucza(d: Tresc['stoliki'][number]['decyzja_r1']): DecyzjaDlaStolika {
  return {
    pytanie: d.pytanie,
    opcje: d.opcje,
    informacje_wspolne: d.informacje_wspolne,
    informacje_unikalne: d.informacje_unikalne,
  };
}

export function trescDlaStolika(t: Tresc, id: IdStolika): TrescDlaStolika {
  const s = t.stoliki.find((x) => x.id === id);
  if (!s) throw new Error(`Nie znam stolika „${id}”.`);
  return {
    meta: t.meta,
    wstep_do_odczytania: t.wstep_do_odczytania,
    zasady: t.zasady,
    instytucje: t.instytucje,
    role: t.role,
    sektory_uczestnikow: t.sektory_uczestnikow,
    liczniki: { jawne: t.liczniki.jawne, wyczerpanie: t.liczniki.wyczerpanie },
    akcje: t.akcje.map((a) => ({
      id: a.id,
      nazwa: a.nazwa,
      opis: a.opis,
      duza: a.duza,
      // bez `ukryty_efekt` — inaczej karta A1 zdradzałaby istnienie licznika spotkań
      efekt: a.efekt as Record<string, number>,
      ...(a.chroni_przed ? { chroni_przed: a.chroni_przed } : {}),
      ...(a.wymaga ? { wymaga: a.wymaga } : {}),
    })),
    limit_akcji_na_runde: t.limit_akcji_na_runde,
    zobowiazania: t.zobowiazania,
    zdarzenia: t.zdarzenia.map((z) => ({
      id: z.id,
      tytul: z.tytul,
      tekst: z.tekst,
      // bez `ukryty_efekt` przy reakcjach — np. „Przemilczamy sprawę” nie może się zdradzić
      ...(z.wybor ? { wybor: z.wybor.map((w) => ({ etykieta: w.etykieta })) } : {}),
    })),
    struktura_rundy: t.struktura_rundy,
    stolik: {
      id: s.id,
      nazwa: s.nazwa,
      misja: s.misja,
      decyzja_r1: decyzjaBezKlucza(s.decyzja_r1),
      zwrot_akcji: s.zwrot_akcji,
      decyzja_r3: decyzjaBezKlucza(s.decyzja_r3),
    },
    // reguły nagłówków zostają na serwerze — jedna z nich odwołuje się do ukrytego ryzyka
    kronika: { tytul: t.kronika.tytul, podpis: t.kronika.podpis },
    komunikat_decyzji: t.decyzje_zasady.gdy_zgodna.komunikat,
  };
}

/** Treść dla ekranu sali: nagłówki zdarzeń bieżącej rundy, bez kart decyzji i bez kluczy. */
export function trescDlaEkranu(t: Tresc) {
  return {
    meta: t.meta,
    zasady: t.zasady,
    // wstęp jest odczytywany na głos z ekranu sali na początku gry
    wstep_do_odczytania: t.wstep_do_odczytania,
    instytucje: t.instytucje,
    struktura_rundy: t.struktura_rundy,
    zdarzenia: t.zdarzenia.map((z) => ({ id: z.id, tytul: z.tytul })),
    stoliki: t.stoliki.map((s) => ({ id: s.id, nazwa: s.nazwa, misja: s.misja })),
    kronika: { tytul: t.kronika.tytul, podpis: t.kronika.podpis },
  };
}
