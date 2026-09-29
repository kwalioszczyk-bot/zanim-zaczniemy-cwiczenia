/**
 * Cykl życia sesji i pojedyncze wejście dla wszystkich operacji stolika.
 * Ten sam kod obsługuje grę z serwerem i tryb projektora bez backendu.
 */
import type {
  IdFazy,
  IdRundy,
  IdStolika,
  KtoraDecyzja,
  StanSesji,
  StanStolika,
  UstawieniaSesji,
} from './typy.ts';
import { ID_STOLIKOW, LICZNIKI_JAWNE } from './typy.ts';
import type { Tresc } from './schemat.ts';
import { licznikiStartowe, przytnij } from './liczniki.ts';
import { KROKI_FAZY, NAZWY_FAZ, czyRunda, nastepnaFaza } from './kroki.ts';
import { kodStolika } from './losowosc.ts';
import { przydzielRole } from './role.ts';
import {
  BladReguly,
  dodajZobowiazania,
  rozstrzygnijDecyzje,
  rozstrzygnijZdarzenie,
  sprawdzZobowiazania,
  wydajSkutek,
  zastosujAkcje,
  type NoweZobowiazanie,
} from './reguly.ts';

export function pustyStolik(t: Tresc, id: IdStolika): StanStolika {
  return {
    id,
    liczniki: licznikiStartowe(t),
    historia: [],
    ochrony: [],
    akcje: { R1: [], R2: [], R3: [] },
    zdarzenia: { R1: [], R2: [], R3: [] },
    zobowiazania: [],
    decyzje: {},
    oczekujacySkutek: null,
    wydaneSkutki: [],
    dziennik: [],
    przydzialRol: {},
    zatwierdzone: {},
    lagodzenie: 0,
    blokadaZobowiazanR1: null,
    ukonczoneKroki: [],
    wykonaneOperacje: {},
  };
}

export interface OpcjeStartu {
  id?: string;
  ziarno?: string;
  ustawienia?: Partial<UstawieniaSesji>;
  pinHash?: string;
  teraz?: () => Date;
}

export function utworzSesje(t: Tresc, opcje: OpcjeStartu = {}): StanSesji {
  const teraz = (opcje.teraz ?? (() => new Date()))();
  const ziarno = opcje.ziarno ?? `${teraz.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const stoliki = {} as Record<IdStolika, StanStolika>;
  const kody: Record<string, IdStolika> = {};
  for (const id of ID_STOLIKOW) {
    stoliki[id] = pustyStolik(t, id);
    let kod = kodStolika(ziarno, id);
    let licznik = 0;
    while (kody[kod]) kod = kodStolika(ziarno, `${id}:${++licznik}`);
    kody[kod] = id;
  }
  return {
    id: opcje.id ?? `S-${ziarno.slice(0, 6).toUpperCase()}`,
    ziarno,
    utworzona: teraz.toISOString(),
    faza: 'R0',
    fazaOd: null,
    fazaUplyw: 0,
    zegarDziala: false,
    ustawienia: {
      kartyPrywatneNaPapierze: true,
      trybProjektora: false,
      ...opcje.ustawienia,
    },
    stoliki,
    kody,
    pinHash: opcje.pinHash,
  };
}

/* ------------------------------------------------------------------- polecenia */

export type Polecenie =
  | { typ: 'losuj-role'; sektory: string[] }
  | { typ: 'zdarzenie'; zdarzenie: string; wybor?: number }
  | { typ: 'akcje'; akcje: string[] }
  | { typ: 'zobowiazania'; lista: NoweZobowiazanie[] }
  | { typ: 'sprawdz-zobowiazania'; rzuty?: Record<string, { wartosc: number; zrodlo: 'fizyczna' | 'wirtualna' }> }
  | { typ: 'decyzja'; ktora: KtoraDecyzja; opcja: string }
  | { typ: 'wydaj-skutek'; ktora: KtoraDecyzja }
  | { typ: 'krok'; krok: string }
  | { typ: 'zatwierdz' }
  | { typ: 'cofnij-zatwierdzenie' };

export interface Operacja {
  /** Identyfikator operacji — ponowne wysłanie po zerwaniu sieci nie dubluje efektów. */
  opId: string;
  stolik: IdStolika;
  polecenie: Polecenie;
}

export interface WynikOperacji {
  sesja: StanSesji;
  /** Dane do pokazania stolikowi (karty zdarzeń, efekty akcji itp.). */
  wynik: unknown;
  /** Czy operacja została rozpoznana jako powtórzona. */
  powtorzona: boolean;
}

function biezacaRunda(sesja: StanSesji): IdRundy {
  if (!czyRunda(sesja.faza)) throw new BladReguly('Ta operacja jest dostępna tylko w rundzie 1, 2 lub 3.');
  return sesja.faza;
}

function zStolikiem(sesja: StanSesji, id: IdStolika, nowy: StanStolika): StanSesji {
  return { ...sesja, stoliki: { ...sesja.stoliki, [id]: nowy } };
}

/** Jedyne wejście do zmiany stanu gry. Idempotentne po `opId`. */
export function wykonaj(t: Tresc, sesja: StanSesji, operacja: Operacja): WynikOperacji {
  const stolik = sesja.stoliki[operacja.stolik];
  if (!stolik) throw new BladReguly(`Nie znam stolika „${operacja.stolik}”.`);
  if (sesja.zakonczona) throw new BladReguly('Sesja została zakończona.');
  if (Object.prototype.hasOwnProperty.call(stolik.wykonaneOperacje, operacja.opId))
    return { sesja, wynik: stolik.wykonaneOperacje[operacja.opId], powtorzona: true };

  const p = operacja.polecenie;
  let nowy = stolik;
  let wynik: unknown = null;

  switch (p.typ) {
    case 'losuj-role': {
      if (sesja.faza !== 'R0') throw new BladReguly('Role losujemy tylko we wprowadzeniu.');
      const przydzial = przydzielRole(t, p.sektory, sesja.ziarno, `${stolik.id}:${operacja.opId}`);
      nowy = { ...stolik, przydzialRol: przydzial.przydzial };
      wynik = { przydzial: przydzial.przydzial, kolizje: przydzial.kolizje, osobyZKolizja: przydzial.osobyZKolizja, ostrzezenie: przydzial.ostrzezenie };
      break;
    }
    case 'zdarzenie': {
      const runda = biezacaRunda(sesja);
      if (stolik.zdarzenia[runda].includes(p.zdarzenie))
        return { sesja, wynik: null, powtorzona: true };
      const r = rozstrzygnijZdarzenie(t, stolik, p.zdarzenie, runda, p.wybor);
      nowy = r.stolik;
      wynik = r.wynik;
      break;
    }
    case 'akcje': {
      const runda = biezacaRunda(sesja);
      const r = zastosujAkcje(t, stolik, runda, p.akcje);
      nowy = r.stolik;
      wynik = r.wyniki;
      break;
    }
    case 'zobowiazania': {
      const runda = biezacaRunda(sesja);
      nowy = dodajZobowiazania(t, stolik, runda, p.lista);
      wynik = nowy.zobowiazania.filter((z) => z.runda === runda);
      break;
    }
    case 'sprawdz-zobowiazania': {
      const runda = biezacaRunda(sesja);
      const r = sprawdzZobowiazania(t, stolik, runda, sesja.ziarno, p.rzuty);
      nowy = r.stolik;
      wynik = r.wyniki;
      break;
    }
    case 'decyzja': {
      const runda = biezacaRunda(sesja);
      if (stolik.decyzje[p.ktora]) return { sesja, wynik: { ktora: p.ktora, opcja: stolik.decyzje[p.ktora]!.opcja, komunikat: t.decyzje_zasady.gdy_zgodna.komunikat }, powtorzona: true };
      const r = rozstrzygnijDecyzje(t, stolik, p.ktora, p.opcja, runda);
      nowy = r.stolik;
      wynik = r.wynik;
      break;
    }
    case 'wydaj-skutek': {
      const faza = sesja.faza === 'F' ? 'F' : biezacaRunda(sesja);
      const r = wydajSkutek(t, stolik, p.ktora, faza);
      nowy = r.stolik;
      wynik = r.wynik;
      break;
    }
    case 'krok': {
      nowy = stolik.ukonczoneKroki.includes(p.krok)
        ? stolik
        : { ...stolik, ukonczoneKroki: [...stolik.ukonczoneKroki, p.krok] };
      wynik = { krok: p.krok };
      break;
    }
    case 'zatwierdz': {
      nowy = { ...stolik, zatwierdzone: { ...stolik.zatwierdzone, [sesja.faza]: true } };
      wynik = { faza: sesja.faza, zatwierdzone: true };
      break;
    }
    case 'cofnij-zatwierdzenie': {
      nowy = { ...stolik, zatwierdzone: { ...stolik.zatwierdzone, [sesja.faza]: false } };
      wynik = { faza: sesja.faza, zatwierdzone: false };
      break;
    }
    default: {
      const _nigdy: never = p;
      throw new BladReguly(`Nieznane polecenie: ${JSON.stringify(_nigdy)}`);
    }
  }

  nowy = { ...nowy, wykonaneOperacje: { ...nowy.wykonaneOperacje, [operacja.opId]: wynik } };
  return { sesja: zStolikiem(sesja, operacja.stolik, nowy), wynik, powtorzona: false };
}

/* ------------------------------------------------------------------------ fazy */

function etykietaMigawki(faza: IdFazy): string {
  if (faza === 'R0') return 'Start';
  if (faza === 'F') return 'Finał';
  return NAZWY_FAZ[faza].replace('Runda ', 'R').replace(/\..*$/, '');
}

/** Zapisuje migawkę liczników wszystkich stolików — materiał na wykres kosztów. */
export function zapiszMigawke(sesja: StanSesji, faza: IdFazy): StanSesji {
  const stoliki = { ...sesja.stoliki };
  for (const id of ID_STOLIKOW) {
    const s = stoliki[id];
    if (s.historia.some((h) => h.faza === faza)) continue;
    stoliki[id] = {
      ...s,
      historia: [...s.historia, { faza, etykieta: etykietaMigawki(faza), liczniki: { ...s.liczniki } }],
    };
  }
  return { ...sesja, stoliki };
}

/** Przejście do kolejnej fazy. Migawka liczników zostaje zapisana przed zmianą. */
export function przejdzDoNastepnejFazy(sesja: StanSesji, teraz = new Date()): StanSesji {
  const nastepna = nastepnaFaza(sesja.faza);
  if (!nastepna) return sesja;
  const zMigawka = zapiszMigawke(sesja, sesja.faza);
  return { ...zMigawka, faza: nastepna, fazaOd: teraz.toISOString(), fazaUplyw: 0, zegarDziala: true };
}

export function ustawFaze(sesja: StanSesji, faza: IdFazy, teraz = new Date()): StanSesji {
  const zMigawka = zapiszMigawke(sesja, sesja.faza);
  return { ...zMigawka, faza, fazaOd: teraz.toISOString(), fazaUplyw: 0, zegarDziala: true };
}

export function przelaczZegar(sesja: StanSesji, teraz = new Date()): StanSesji {
  if (sesja.zegarDziala && sesja.fazaOd) {
    const uplyw = sesja.fazaUplyw + Math.floor((teraz.getTime() - new Date(sesja.fazaOd).getTime()) / 1000);
    return { ...sesja, zegarDziala: false, fazaOd: null, fazaUplyw: uplyw };
  }
  return { ...sesja, zegarDziala: true, fazaOd: teraz.toISOString() };
}

export function sekundyFazy(sesja: StanSesji, teraz = new Date()): number {
  if (!sesja.zegarDziala || !sesja.fazaOd) return sesja.fazaUplyw;
  return sesja.fazaUplyw + Math.floor((teraz.getTime() - new Date(sesja.fazaOd).getTime()) / 1000);
}

/** Ręczna korekta licznika przez prowadzącą — zawsze z wpisem w dzienniku zmian. */
export function skorygujLicznik(
  t: Tresc,
  sesja: StanSesji,
  stolik: IdStolika,
  licznik: string,
  na: number,
  powod: string,
  teraz = new Date(),
): StanSesji {
  const s = sesja.stoliki[stolik];
  if (!s) throw new BladReguly(`Nie znam stolika „${stolik}”.`);
  if (!powod.trim()) throw new BladReguly('Korekta wymaga krótkiego uzasadnienia.');
  const id = licznik as keyof typeof s.liczniki;
  if (!(id in s.liczniki)) throw new BladReguly(`Nie znam licznika „${licznik}”.`);
  const z = s.liczniki[id];
  const wartosc = przytnij(t, id, na);
  return zStolikiem(sesja, stolik, {
    ...s,
    liczniki: { ...s.liczniki, [id]: wartosc },
    dziennik: [
      ...s.dziennik,
      { typ: 'korekta', runda: sesja.faza, licznik: id, z, na: wartosc, powod: powod.trim(), czas: teraz.toISOString() },
    ],
  });
}

/* ------------------------------------------------------------------- projekcje */

export interface WidokStolika {
  id: IdStolika;
  nazwa: string;
  liczniki: Record<string, number>;
  historia: { etykieta: string; liczniki: Record<string, number> }[];
  zobowiazania: StanStolika['zobowiazania'];
  akcje: Record<IdRundy, string[]>;
  zdarzenia: Record<IdRundy, string[]>;
  decyzje: { ktora: KtoraDecyzja; opcja: string }[];
  przydzialRol: Record<string, string>;
  zatwierdzone: Partial<Record<IdFazy, boolean>>;
  ukonczoneKroki: string[];
  ochrony: string[];
  lagodzenie: number;
  blokadaZobowiazanR1: IdRundy | null;
}

const tylkoJawneLiczniki = (l: Record<string, number>) => {
  const wynik: Record<string, number> = {};
  for (const id of LICZNIKI_JAWNE) wynik[id] = l[id] ?? 0;
  return wynik;
};

/**
 * Projekcja stanu dla stolika i ekranu sali.
 * Z tego obiektu NIE DA SIĘ odczytać ukrytego ryzyka, liczby spotkań ani tego,
 * czy decyzja była zgodna z pełną wiedzą zespołu.
 */
export function widokStolika(t: Tresc, s: StanStolika): WidokStolika {
  return {
    id: s.id,
    nazwa: t.stoliki.find((x) => x.id === s.id)?.nazwa ?? s.id,
    liczniki: tylkoJawneLiczniki(s.liczniki),
    historia: s.historia.map((h) => ({ etykieta: h.etykieta, liczniki: tylkoJawneLiczniki(h.liczniki) })),
    zobowiazania: s.zobowiazania,
    akcje: s.akcje,
    zdarzenia: s.zdarzenia,
    decyzje: Object.values(s.decyzje).map((d) => ({ ktora: d.ktora, opcja: d.opcja })),
    przydzialRol: s.przydzialRol,
    zatwierdzone: s.zatwierdzone,
    ukonczoneKroki: s.ukonczoneKroki,
    ochrony: s.ochrony.map((o) => o.akcja),
    lagodzenie: s.lagodzenie,
    blokadaZobowiazanR1: s.blokadaZobowiazanR1,
  };
}

export interface WidokSesji {
  id: string;
  faza: IdFazy;
  nazwaFazy: string;
  minutyFazy: number;
  sekundyFazy: number;
  kroki: { id: string; etykieta: string; wskazowka: string }[];
  ustawienia: UstawieniaSesji;
  zegarDziala: boolean;
  zakonczona: boolean;
}

export function widokSesji(t: Tresc, sesja: StanSesji, teraz = new Date()): WidokSesji {
  const faza = t.struktura_rundy.find((f) => f.id === sesja.faza);
  return {
    id: sesja.id,
    faza: sesja.faza,
    nazwaFazy: faza?.nazwa ?? NAZWY_FAZ[sesja.faza],
    minutyFazy: faza?.minuty ?? 0,
    sekundyFazy: sekundyFazy(sesja, teraz),
    kroki: KROKI_FAZY[sesja.faza].map((k) => ({ id: k.id, etykieta: k.etykieta, wskazowka: k.wskazowka })),
    ustawienia: sesja.ustawienia,
    zegarDziala: sesja.zegarDziala,
    zakonczona: Boolean(sesja.zakonczona),
  };
}

/** Status stolików dla prowadzącej — zawsze w kolejności A, B, C, D i bez wyników. */
export function statusStolikow(sesja: StanSesji): { id: IdStolika; zatwierdzony: boolean; kroki: number }[] {
  return ID_STOLIKOW.map((id) => ({
    id,
    zatwierdzony: Boolean(sesja.stoliki[id].zatwierdzone[sesja.faza]),
    kroki: sesja.stoliki[id].ukonczoneKroki.length,
  }));
}
