/**
 * Dane wyłącznie dla trybu omówienia (chronionego PIN-em).
 * Nic z tego modułu nie może trafić do widoku stolika ani na ekran sali.
 */
import type { IdStolika, KtoraDecyzja, StanSesji, StanStolika } from './typy.ts';
import { ID_ROL, ID_STOLIKOW } from './typy.ts';
import type { Tresc } from './schemat.ts';
import { daneWykresu } from './kronika.ts';
import { decyzjaStolika } from './reguly.ts';

export interface OmowienieDecyzji {
  ktora: KtoraDecyzja;
  pytanie: string;
  opcje: Record<string, string>;
  wybrana: string | null;
  zgodnaZPelnaWiedza: string;
  byłaZgodna: boolean | null;
  /** Informacje unikalne rola po roli — odsłaniane krok po kroku. */
  informacjeUnikalne: { rola: string; tekst: string; rozstrzygajaca: boolean }[];
  informacjeWspolne: string[];
}

export interface OmowienieStolika {
  id: IdStolika;
  nazwa: string;
  wykres: ReturnType<typeof daneWykresu>;
  zdarzenia: { runda: string; zdarzenie: string; tytul: string; wybor?: string; efekt: Record<string, number>; komentarz?: string; ochrona?: string }[];
  zobowiazania: { id: string; rola: string; co: string; status: string; obciazenie?: number; rzut?: number }[];
  decyzje: OmowienieDecyzji[];
  ukryteRyzyko: number;
  liczbaSpotkan: number;
  korekty: { licznik: string; z: number; na: number; powod: string; czas: string }[];
}

/**
 * Informacja unikalna jest „rozstrzygająca”, jeśli wprost mówi o opcji zgodnej z pełną wiedzą
 * albo podważa opcję sugerowaną przez informacje wspólne. Oznaczamy te role, których wiedza
 * przesądzała sprawę — to materiał do rozmowy w dniu 2., a nie ocena zespołu.
 */
function rozstrzygajaceRole(t: Tresc, stolik: IdStolika, ktora: KtoraDecyzja): Set<string> {
  const d = decyzjaStolika(t, stolik, ktora);
  const zgodna = d.opcje[d.opcja_zgodna_z_pelna_wiedza] ?? '';
  const slowaKluczowe = zgodna
    .toLowerCase()
    .replace(/[„”".,!?()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5);
  const wynik = new Set<string>();
  for (const rola of ID_ROL) {
    const tekst = (d.informacje_unikalne[rola] ?? '').toLowerCase();
    if (slowaKluczowe.some((w) => tekst.includes(w))) wynik.add(rola);
  }
  // Jeżeli dopasowanie po słowach nic nie dało, traktujemy wszystkie role jako współrozstrzygające:
  // w mechanizmie ukrytego profilu dopiero złożenie wszystkich fragmentów daje pełny obraz.
  return wynik.size ? wynik : new Set(ID_ROL);
}

export function omowienieStolika(t: Tresc, s: StanStolika): OmowienieStolika {
  const opis = t.stoliki.find((x) => x.id === s.id);
  const decyzje: OmowienieDecyzji[] = (['r1', 'r3'] as const).map((ktora) => {
    const d = ktora === 'r1' ? opis!.decyzja_r1 : opis!.decyzja_r3;
    const zapis = s.decyzje[ktora];
    const rozstrzygajace = rozstrzygajaceRole(t, s.id, ktora);
    return {
      ktora,
      pytanie: d.pytanie,
      opcje: d.opcje,
      wybrana: zapis?.opcja ?? null,
      zgodnaZPelnaWiedza: d.opcja_zgodna_z_pelna_wiedza,
      byłaZgodna: zapis ? zapis.zgodna : null,
      informacjeWspolne: d.informacje_wspolne,
      informacjeUnikalne: ID_ROL.map((r) => ({
        rola: r,
        tekst: d.informacje_unikalne[r] ?? '',
        rozstrzygajaca: rozstrzygajace.has(r),
      })),
    };
  });

  return {
    id: s.id,
    nazwa: opis?.nazwa ?? s.id,
    wykres: daneWykresu(t, s.historia),
    zdarzenia: s.dziennik
      .filter((w): w is Extract<typeof w, { typ: 'zdarzenie' }> => w.typ === 'zdarzenie')
      .map((w) => ({ runda: w.runda, zdarzenie: w.zdarzenie, tytul: w.tytul, wybor: w.wybor, efekt: w.efekt as Record<string, number>, komentarz: w.komentarz, ochrona: w.ochrona })),
    zobowiazania: s.zobowiazania.map((z) => ({
      id: z.id,
      rola: z.rola,
      co: z.co,
      status: z.status,
      obciazenie: z.obciazeniePrzySprawdzeniu,
      rzut: z.rzut,
    })),
    decyzje,
    ukryteRyzyko: s.liczniki.ryzyko,
    liczbaSpotkan: s.liczniki.spotkania,
    korekty: s.dziennik
      .filter((w): w is Extract<typeof w, { typ: 'korekta' }> => w.typ === 'korekta')
      .map((w) => ({ licznik: w.licznik, z: w.z, na: w.na, powod: w.powod, czas: w.czas })),
  };
}

export function omowienieSesji(t: Tresc, sesja: StanSesji): OmowienieStolika[] {
  return ID_STOLIKOW.map((id) => omowienieStolika(t, sesja.stoliki[id]));
}

/* --------------------------------------------------------------------- eksport */

/** Eksport JSON — wyłącznie na poziomie stolików, bez mapowania osób na role. */
export function eksportJSON(t: Tresc, sesja: StanSesji): string {
  return JSON.stringify(
    {
      sesja: sesja.id,
      utworzona: sesja.utworzona,
      faza: sesja.faza,
      uwaga: 'Eksport nie zawiera danych uczestników ani mapowania osób na role.',
      stoliki: ID_STOLIKOW.map((id) => {
        const s = sesja.stoliki[id];
        const o = omowienieStolika(t, s);
        return {
          stolik: id,
          nazwa: o.nazwa,
          licznikiPoFazach: s.historia.map((h) => ({ faza: h.etykieta, ...h.liczniki })),
          zdarzenia: o.zdarzenia.map((z) => ({ runda: z.runda, id: z.zdarzenie, tytul: z.tytul, wybor: z.wybor })),
          akcje: s.akcje,
          decyzje: o.decyzje.map((d) => ({ ktora: d.ktora, wybrana: d.wybrana, zgodnaZPelnaWiedza: d.zgodnaZPelnaWiedza, byłaZgodna: d.byłaZgodna })),
          zobowiazania: { podjete: s.zobowiazania.length, zrealizowane: s.zobowiazania.filter((z) => z.status === 'zrealizowane').length, niezrealizowane: s.zobowiazania.filter((z) => z.status === 'niezrealizowane').length },
          ukryteRyzyko: o.ukryteRyzyko,
          liczbaSpotkan: o.liczbaSpotkan,
        };
      }),
    },
    null,
    2,
  );
}

function polCSV(wartosc: unknown): string {
  const tekst = String(wartosc ?? '');
  return /[";\n]/.test(tekst) ? `"${tekst.replace(/"/g, '""')}"` : tekst;
}

/** Eksport CSV (średnik — żeby arkusz otworzył się poprawnie po polsku). */
export function eksportCSV(t: Tresc, sesja: StanSesji): string {
  const naglowki = [
    'stolik', 'nazwa', 'faza', 'czas', 'obciazenie', 'zaufanie', 'wspoltworzenie',
    'akcje', 'zdarzenia', 'decyzja_r1', 'decyzja_r3', 'zobowiazania_podjete',
    'zobowiazania_zrealizowane', 'ukryte_ryzyko', 'liczba_spotkan',
  ];
  const wiersze: string[][] = [];
  for (const id of ID_STOLIKOW) {
    const s = sesja.stoliki[id];
    const o = omowienieStolika(t, s);
    s.historia.forEach((h, i) => {
      const ostatnia = i === s.historia.length - 1;
      wiersze.push([
        id,
        o.nazwa,
        h.etykieta,
        String(h.liczniki.czas), String(h.liczniki.obciazenie), String(h.liczniki.zaufanie), String(h.liczniki.zasieg),
        ostatnia ? Object.values(s.akcje).flat().join(' ') : '',
        ostatnia ? Object.values(s.zdarzenia).flat().join(' ') : '',
        ostatnia ? (s.decyzje.r1?.opcja ?? '') : '',
        ostatnia ? (s.decyzje.r3?.opcja ?? '') : '',
        ostatnia ? String(s.zobowiazania.length) : '',
        ostatnia ? String(s.zobowiazania.filter((z) => z.status === 'zrealizowane').length) : '',
        ostatnia ? String(o.ukryteRyzyko) : '',
        ostatnia ? String(o.liczbaSpotkan) : '',
      ]);
    });
  }
  return [naglowki, ...wiersze].map((w) => w.map(polCSV).join(';')).join('\n');
}
