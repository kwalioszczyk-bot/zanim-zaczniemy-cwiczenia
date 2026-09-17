/**
 * Schemat pliku `content/gra.json` (Zod) wraz z regułami spójności treści.
 * Aplikacja nie startuje, jeśli plik jest niepoprawny — komunikat po polsku.
 */
import { z } from 'zod';
import { ID_ROL, ID_STOLIKOW } from './typy.ts';

const efekt = z
  .object({
    czas: z.number().int().optional(),
    obciazenie: z.number().int().optional(),
    zaufanie: z.number().int().optional(),
    zasieg: z.number().int().optional(),
    ryzyko: z.number().int().optional(),
    spotkania: z.number().int().optional(),
  })
  .strict();

const licznik = z.object({
  id: z.string(),
  nazwa: z.string(),
  opis: z.string(),
  start: z.number().int(),
  min: z.number().int(),
  max: z.number().int(),
});

const rola = z.object({
  id: z.enum(['R1', 'R2', 'R3', 'R4', 'R5']),
  instytucja: z.string(),
  nazwa: z.string(),
  sektor_wykluczony: z.string(),
  slowo_klucz: z.string(),
  slowo_klucz_opis: z.string(),
  motywacja: z.string(),
  wiadomosc_od_przelozonego: z.string(),
  druga_rola: z.string().nullable(),
});

const akcja = z.object({
  id: z.string().regex(/^A\d+$/, 'Identyfikator akcji musi mieć postać A1, A2, …'),
  nazwa: z.string(),
  opis: z.string(),
  duza: z.boolean(),
  efekt: efekt,
  ukryty_efekt: efekt.optional(),
  chroni_przed: z.array(z.string()).optional(),
  odblokowuje: z.array(z.string()).optional(),
  lagodzi_zwrot_akcji: z.number().int().optional(),
  wymaga: z.string().optional(),
  efekt_bez_wymogu: efekt.optional(),
  komunikat_bez_wymogu: z.string().optional(),
  uwaga_dla_omowienia: z.string().optional(),
});

const wyborZdarzenia = z.object({
  etykieta: z.string(),
  efekt: efekt,
  ukryty_efekt: efekt.optional(),
  komentarz: z.string().optional(),
});

const zdarzenie = z.object({
  id: z.string().regex(/^E\d+$/, 'Identyfikator zdarzenia musi mieć postać E1, E2, …'),
  tytul: z.string(),
  tekst: z.string(),
  efekt: efekt.optional(),
  ochrona: z.string().optional(),
  ochrona_warunek: z.string().optional(),
  efekt_z_ochrona: efekt.optional(),
  komentarz_z_ochrona: z.string().optional(),
  wybor: z.array(wyborZdarzenia).min(2).optional(),
  warunek: z
    .object({
      licznik: z.string(),
      prog: z.number().int(),
      efekt_gdy_ponizej: efekt,
      efekt_gdy_rowny_lub_powyzej: efekt,
      komentarz_gdy_powyzej: z.string().optional(),
    })
    .optional(),
});

const skutek = z.object({ tytul: z.string(), tekst: z.string(), efekt: efekt });

const decyzja = z.object({
  pytanie: z.string(),
  opcje: z.record(z.string(), z.string()),
  informacje_wspolne: z.array(z.string()).min(1),
  informacje_unikalne: z.record(z.string(), z.string()),
  opcja_zgodna_z_pelna_wiedza: z.string(),
  skutki_opcji: z.record(z.string(), skutek),
});

const stolik = z.object({
  id: z.enum(['A', 'B', 'C', 'D']),
  nazwa: z.string(),
  misja: z.string(),
  decyzja_r1: decyzja,
  zwrot_akcji: z.object({ tytul: z.string(), tekst: z.string() }),
  decyzja_r3: decyzja,
});

const regula = z.object({ warunek: z.string(), tekst: z.string() });

export const schematTresci = z.object({
  meta: z.object({
    tytul: z.string(),
    podtytul: z.string(),
    czas_min: z.number().int(),
    liczba_stolikow: z.number().int(),
    osob_przy_stoliku: z.number().int(),
    zrodlo_prawdy: z.string(),
  }),
  wstep_do_odczytania: z.string(),
  zasady: z.array(z.string()).min(1),
  instytucje: z.record(z.string(), z.string()),
  role: z.array(rola).length(5, 'Gra wymaga dokładnie pięciu ról (R1–R5).'),
  sektory_uczestnikow: z.array(z.object({ id: z.string(), etykieta: z.string() })).min(2),
  liczniki: z.object({
    jawne: z.array(licznik).min(1),
    ukryte: z.array(licznik).min(1),
    wyczerpanie: z.object({
      prog_obciazenia: z.number().int(),
      skutek: z.string(),
      komunikat: z.string(),
    }),
  }),
  akcje: z.array(akcja).min(1),
  limit_akcji_na_runde: z.number().int().positive(),
  zobowiazania: z.object({
    limit_na_runde: z.number().int().positive(),
    pola: z.array(z.string()).min(1),
    zasada: z.string(),
    prog_obciazenia: z.number().int(),
  }),
  zdarzenia: z.array(zdarzenie).min(1),
  kolejnosc_zdarzen: z.record(
    z.string(),
    z.object({ R1: z.array(z.string()), R2: z.array(z.string()), R3: z.array(z.string()) }),
  ),
  struktura_rundy: z
    .array(z.object({ id: z.string(), nazwa: z.string(), minuty: z.number().int(), kroki: z.array(z.string()) }))
    .min(1),
  stoliki: z.array(stolik).length(4, 'Gra wymaga dokładnie czterech stolików (A–D).'),
  decyzje_zasady: z.object({
    opis: z.string(),
    gdy_zgodna: z.object({ jawny_efekt: efekt, komunikat: z.string() }),
    gdy_niezgodna: z.object({
      jawny_efekt: efekt,
      ukryty_efekt: efekt,
      komunikat: z.string(),
      skutek: z.string(),
    }),
    uwaga: z.string(),
  }),
  kronika: z.object({
    tytul: z.string(),
    reguly_naglowka: z.array(regula).min(1),
    zdania_dodatkowe: z.array(regula),
    podpis: z.string(),
  }),
  omowienie: z.object({
    dzien_1: z.object({
      nazwa: z.string(),
      pytania: z.array(z.string()).min(1),
      nie_ujawniac: z.array(z.string()).min(1),
      powiazania: z.record(z.string(), z.string()),
    }),
    dzien_2_mechanizm: z.object({
      nazwa: z.string(),
      ujawnienie: z.array(z.string()).min(1),
      odniesienie: z.string(),
      powiazania: z.record(z.string(), z.string()),
    }),
  }),
});

export type Tresc = z.infer<typeof schematTresci>;
export type Akcja = z.infer<typeof akcja>;
export type Zdarzenie = z.infer<typeof zdarzenie>;
export type Rola = z.infer<typeof rola>;
export type Decyzja = z.infer<typeof decyzja>;
export type StolikTresc = z.infer<typeof stolik>;
export type Skutek = z.infer<typeof skutek>;
export type Licznik = z.infer<typeof licznik>;

export class BladTresci extends Error {
  constructor(public readonly problemy: string[]) {
    super(
      'Plik content/gra.json jest niepoprawny — gra nie może wystartować.\n' +
        problemy.map((p) => '  • ' + p).join('\n'),
    );
    this.name = 'BladTresci';
  }
}

/** Reguły spójności, których sam schemat nie wyrazi. Zwraca listę problemów po polsku. */
export function sprawdzSpojnosc(t: Tresc): string[] {
  const problemy: string[] = [];
  const idAkcji = new Set(t.akcje.map((a) => a.id));
  const idZdarzen = new Set(t.zdarzenia.map((z) => z.id));
  const idLicznikow = new Set([...t.liczniki.jawne, ...t.liczniki.ukryte].map((l) => l.id));

  for (const a of t.akcje) {
    for (const e of a.chroni_przed ?? [])
      if (!idZdarzen.has(e)) problemy.push(`Akcja ${a.id} chroni przed nieistniejącym zdarzeniem „${e}”.`);
    if (a.wymaga && !idAkcji.has(a.wymaga)) problemy.push(`Akcja ${a.id} wymaga nieistniejącej akcji „${a.wymaga}”.`);
    if (a.wymaga && !a.efekt_bez_wymogu)
      problemy.push(`Akcja ${a.id} wymaga ${a.wymaga}, ale nie ma pola „efekt_bez_wymogu”.`);
    for (const e of a.odblokowuje ?? [])
      if (!idAkcji.has(e)) problemy.push(`Akcja ${a.id} odblokowuje nieistniejącą akcję „${e}”.`);
  }

  for (const z of t.zdarzenia) {
    if (z.ochrona && !idAkcji.has(z.ochrona))
      problemy.push(`Zdarzenie ${z.id} wskazuje ochronę nieistniejącą akcją „${z.ochrona}”.`);
    if (!z.efekt && !z.wybor && !z.warunek)
      problemy.push(`Zdarzenie ${z.id} nie ma ani efektu, ani wyboru, ani warunku.`);
    if (z.warunek && !idLicznikow.has(z.warunek.licznik))
      problemy.push(`Zdarzenie ${z.id} odwołuje się do nieistniejącego licznika „${z.warunek.licznik}”.`);
  }

  for (const id of ID_STOLIKOW) {
    const kolejnosc = t.kolejnosc_zdarzen[id];
    if (!kolejnosc) {
      problemy.push(`Brak kolejności zdarzeń dla stolika ${id}.`);
      continue;
    }
    for (const runda of ['R1', 'R2', 'R3'] as const)
      for (const e of kolejnosc[runda])
        if (!idZdarzen.has(e))
          problemy.push(`Stolik ${id}, runda ${runda}: zdarzenie „${e}” nie istnieje w talii zdarzeń.`);
  }

  const idStolikow = new Set(t.stoliki.map((s) => s.id));
  for (const id of ID_STOLIKOW) if (!idStolikow.has(id)) problemy.push(`Brak stolika ${id} w treści gry.`);

  for (const s of t.stoliki) {
    for (const [nazwa, d] of [
      ['decyzja_r1', s.decyzja_r1],
      ['decyzja_r3', s.decyzja_r3],
    ] as const) {
      const opcje = Object.keys(d.opcje);
      if (opcje.length < 2) problemy.push(`Stolik ${s.id}, ${nazwa}: potrzebne są co najmniej dwie opcje.`);
      if (!opcje.includes(d.opcja_zgodna_z_pelna_wiedza))
        problemy.push(
          `Stolik ${s.id}, ${nazwa}: opcja zgodna z pełną wiedzą „${d.opcja_zgodna_z_pelna_wiedza}” nie występuje wśród opcji.`,
        );
      for (const r of ID_ROL)
        if (!d.informacje_unikalne[r]?.trim())
          problemy.push(`Stolik ${s.id}, ${nazwa}: brak informacji unikalnej dla roli ${r}.`);
      for (const o of opcje) {
        if (o === d.opcja_zgodna_z_pelna_wiedza) {
          if (d.skutki_opcji[o]) problemy.push(`Stolik ${s.id}, ${nazwa}: opcja zgodna „${o}” nie może mieć skutku.`);
        } else if (!d.skutki_opcji[o]) {
          problemy.push(`Stolik ${s.id}, ${nazwa}: brak karty skutku dla niezgodnej opcji „${o}”.`);
        }
      }
      for (const o of Object.keys(d.skutki_opcji))
        if (!opcje.includes(o)) problemy.push(`Stolik ${s.id}, ${nazwa}: skutek dla nieistniejącej opcji „${o}”.`);
    }
  }

  const sektory = new Set(t.sektory_uczestnikow.map((s) => s.id));
  for (const r of t.role)
    if (!sektory.has(r.sektor_wykluczony))
      problemy.push(`Rola ${r.id} wyklucza nieznany obszar pracy „${r.sektor_wykluczony}”.`);
  if (t.role.length > t.sektory_uczestnikow.length)
    problemy.push('Obszarów pracy musi być co najmniej tyle, ile ról — inaczej losowanie bez kolizji jest niemożliwe.');

  for (const l of [...t.liczniki.jawne, ...t.liczniki.ukryte])
    if (l.start < l.min || l.start > l.max)
      problemy.push(`Licznik „${l.id}”: wartość startowa ${l.start} jest poza zakresem ${l.min}–${l.max}.`);

  for (const f of ['R0', 'R1', 'R2', 'R3', 'F', 'Z'])
    if (!t.struktura_rundy.some((s) => s.id === f)) problemy.push(`Brak fazy „${f}” w strukturze rundy.`);

  return problemy;
}

/** Waliduje surowy obiekt JSON i zwraca typowaną treść albo rzuca BladTresci. */
export function wczytajTresc(surowa: unknown): Tresc {
  const wynik = schematTresci.safeParse(surowa);
  if (!wynik.success) {
    const problemy = wynik.error.issues.map((i) => {
      const sciezka = i.path.length ? i.path.join(' → ') : '(korzeń pliku)';
      return `${sciezka}: ${i.message}`;
    });
    throw new BladTresci(problemy);
  }
  const problemy = sprawdzSpojnosc(wynik.data);
  if (problemy.length) throw new BladTresci(problemy);
  return wynik.data;
}
