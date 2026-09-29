/**
 * Typy domenowe silnika gry „KŁĘBKOWO. Sprawa się plącze”.
 * Silnik nie zna ani UI, ani serwera — to czyste dane i czyste funkcje.
 */

export type IdStolika = 'A' | 'B' | 'C' | 'D';
export type IdRoli = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
export type IdFazy = 'R0' | 'R1' | 'R2' | 'R3' | 'F' | 'Z';
export type IdRundy = 'R1' | 'R2' | 'R3';
export type KtoraDecyzja = 'r1' | 'r3';

export type IdLicznikaJawnego = 'czas' | 'obciazenie' | 'zaufanie' | 'zasieg';
export type IdLicznikaUkrytego = 'ryzyko' | 'spotkania';
export type IdLicznika = IdLicznikaJawnego | IdLicznikaUkrytego;

export const LICZNIKI_JAWNE: readonly IdLicznikaJawnego[] = ['czas', 'obciazenie', 'zaufanie', 'zasieg'];
export const LICZNIKI_UKRYTE: readonly IdLicznikaUkrytego[] = ['ryzyko', 'spotkania'];
export const ID_STOLIKOW: readonly IdStolika[] = ['A', 'B', 'C', 'D'];
export const ID_ROL: readonly IdRoli[] = ['R1', 'R2', 'R3', 'R4', 'R5'];
export const RUNDY: readonly IdRundy[] = ['R1', 'R2', 'R3'];
export const FAZY: readonly IdFazy[] = ['R0', 'R1', 'R2', 'R3', 'F', 'Z'];

/** Komplet liczników stolika (jawne + ukryte razem, rozdzielane dopiero przy projekcji widoku). */
export type Liczniki = Record<IdLicznika, number>;
/** Zmiana liczników; wartości ujemne i dodatnie, brak klucza = brak zmiany. */
export type Efekt = Partial<Record<IdLicznika, number>>;

export interface Zobowiazanie {
  id: string;
  /** Runda, w której zobowiązanie zostało podjęte. */
  runda: IdRundy;
  rola: IdRoli;
  co: string;
  doKiedy: string;
  status: 'oczekuje' | 'zrealizowane' | 'niezrealizowane';
  /** Obciążenie w chwili sprawdzenia — pokazywane w omówieniu. */
  obciazeniePrzySprawdzeniu?: number;
  /** Wynik kostki, jeśli był potrzebny (obciążenie >= próg). */
  rzut?: number;
  /** Skąd wzięła się wartość kostki. */
  zrodloRzutu?: 'fizyczna' | 'wirtualna';
  sprawdzoneWRundzie?: IdRundy;
}

export interface ZapisDecyzji {
  ktora: KtoraDecyzja;
  opcja: string;
  /** POLE UKRYTE — nigdy nie trafia do widoku stolika ani ekranu sali. */
  zgodna: boolean;
  runda: IdRundy;
}

export interface Ochrona {
  akcja: string;
  /** Runda, w której akcja została wybrana. Ochrona działa od kolejnej rundy. */
  odRundy: IdRundy;
}

export type WpisDziennika =
  | { typ: 'zdarzenie'; runda: IdRundy; zdarzenie: string; tytul: string; wybor?: string; efekt: Efekt; komentarz?: string; ochrona?: string }
  | { typ: 'akcja'; runda: IdRundy; akcja: string; nazwa: string; efekt: Efekt; komunikat?: string; bezWymogu?: boolean }
  | { typ: 'decyzja'; runda: IdRundy; ktora: KtoraDecyzja; opcja: string; komunikat: string }
  | { typ: 'skutek'; runda: IdRundy | 'F'; ktora: KtoraDecyzja; opcja: string; tytul: string; tekst: string; efekt: Efekt; zlagodzony: boolean }
  | { typ: 'zobowiazanie'; runda: IdRundy; zobowiazanie: string; rola: IdRoli; status: 'zrealizowane' | 'niezrealizowane'; obciazenie: number; rzut?: number; efekt: Efekt }
  | { typ: 'korekta'; runda: IdRundy | IdFazy; licznik: IdLicznika; z: number; na: number; powod: string; czas: string };

export interface MigawkaLicznikow {
  faza: IdFazy;
  etykieta: string;
  liczniki: Liczniki;
}

export interface StanStolika {
  id: IdStolika;
  liczniki: Liczniki;
  /** Przebieg liczników po każdej fazie — materiał na wykres kosztów. */
  historia: MigawkaLicznikow[];
  ochrony: Ochrona[];
  /** Akcje wybrane w danej rundzie (id akcji). */
  akcje: Record<IdRundy, string[]>;
  /** Zdarzenia już rozstrzygnięte w danej rundzie (id zdarzenia). */
  zdarzenia: Record<IdRundy, string[]>;
  zobowiazania: Zobowiazanie[];
  decyzje: Partial<Record<KtoraDecyzja, ZapisDecyzji>>;
  /** Skutek czekający na wydanie w kolejnej fazie. POLE UKRYTE. */
  oczekujacySkutek: { ktora: KtoraDecyzja; opcja: string } | null;
  /** Skutki już wydane (żeby nie zdublować przy ponownym wysłaniu operacji). */
  wydaneSkutki: KtoraDecyzja[];
  dziennik: WpisDziennika[];
  /** Osoba 1..5 → rola. Obszary pracy NIE są przechowywane. */
  przydzialRol: Record<string, IdRoli>;
  /** Czy stolik zakończył pracę w bieżącej fazie. */
  zatwierdzone: Partial<Record<IdFazy, boolean>>;
  /** Złagodzenie skutku zwrotu akcji (A5). */
  lagodzenie: number;
  /** Runda, w której rola R1 nie może podejmować zobowiązań (E2). */
  blokadaZobowiazanR1: IdRundy | null;
  /** Kroki, które stolik ma już za sobą w bieżącej fazie (identyfikatory kroków). */
  ukonczoneKroki: string[];
  /** Identyfikator operacji → jej wynik. Ponowne wysłanie nie dubluje efektów. */
  wykonaneOperacje: Record<string, unknown>;
}

export interface UstawieniaSesji {
  /** Zalecany wariant sali: karty prywatne rozdaje prowadząca na papierze. */
  kartyPrywatneNaPapierze: boolean;
  /** Tryb projektora — prowadząca wprowadza decyzje stolików. */
  trybProjektora: boolean;
}

export interface StanSesji {
  id: string;
  /** Ziarno deterministycznego generatora losowego. */
  ziarno: string;
  utworzona: string;
  faza: IdFazy;
  /** Znacznik startu odliczania bieżącej fazy (ISO) albo null, gdy zegar stoi. */
  fazaOd: string | null;
  /** Ile sekund fazy już upłynęło, gdy zegar był zatrzymywany. */
  fazaUplyw: number;
  zegarDziala: boolean;
  ustawienia: UstawieniaSesji;
  stoliki: Record<IdStolika, StanStolika>;
  /** Kody stolików (4 znaki) → id stolika. */
  kody: Record<string, IdStolika>;
  /** Skrót PIN-u prowadzącej. Nigdy nie opuszcza serwera. */
  pinHash?: string;
  zakonczona?: boolean;
}
