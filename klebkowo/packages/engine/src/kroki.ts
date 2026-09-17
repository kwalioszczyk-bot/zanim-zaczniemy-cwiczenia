/**
 * Przebieg pracy stolika w obrębie fazy — wspólny dla aplikacji i wersji papierowej.
 *
 * TODO: do akceptacji prowadzącej — wskazówki przy krokach (pole `wskazowka`) są tekstami
 * interfejsu dopisanymi na potrzeby aplikacji. Nie ma ich w content/gra.json.
 */
import type { IdFazy } from './typy.ts';

export type IdKroku =
  | 'role'
  | 'karty'
  | 'sprawdzenie-zobowiazan'
  | 'skutek'
  | 'koperty'
  | 'zdarzenia'
  | 'informacje'
  | 'zwrot'
  | 'decyzja'
  | 'akcje'
  | 'zobowiazania'
  | 'zatwierdzenie'
  | 'kronika'
  | 'wykres'
  | 'wyjscie';

export interface OpisKroku {
  id: IdKroku;
  etykieta: string;
  /** Krótkie, neutralne zdanie prowadzące zespół przez krok. */
  wskazowka: string;
}

const K: Record<IdKroku, OpisKroku> = {
  role: { id: 'role', etykieta: 'Losowanie ról', wskazowka: 'Po kolei wskażcie obszar pracy każdej z pięciu osób. Aplikacja rozda role tak, żeby nikt nie grał własnego zawodu.' },
  karty: { id: 'karty', etykieta: 'Karta roli i karta misji', wskazowka: 'Przeczytajcie swoją kartę roli i wspólną kartę misji. Słowa-klucze wyjaśniamy tylko wtedy, gdy ktoś zapyta.' },
  'sprawdzenie-zobowiazan': { id: 'sprawdzenie-zobowiazan', etykieta: 'Sprawdzenie zobowiązań', wskazowka: 'Sprawdźcie zobowiązania z poprzedniej rundy.' },
  skutek: { id: 'skutek', etykieta: 'Skutek decyzji', wskazowka: 'Odczytajcie kartę, która przyszła z poprzedniej rundy.' },
  koperty: { id: 'koperty', etykieta: 'Koperty od przełożonych', wskazowka: 'Każda osoba otwiera swoją kopertę i czyta wiadomość w milczeniu. O treści możecie mówić — kart nie pokazujecie.' },
  zdarzenia: { id: 'zdarzenia', etykieta: 'Zdarzenie rundy', wskazowka: 'Odczytajcie zdarzenie i — jeśli wymaga wyboru — zdecydujcie wspólnie, jak reagujecie.' },
  informacje: { id: 'informacje', etykieta: 'Karty informacji', wskazowka: 'Najpierw informacje wspólne, potem prywatne. Możecie mówić o wszystkim, co wiecie. Kart nie pokazujecie.' },
  zwrot: { id: 'zwrot', etykieta: 'Zwrot akcji', wskazowka: 'Sytuacja się zmieniła. Odczytajcie, co się właśnie wydarzyło.' },
  decyzja: { id: 'decyzja', etykieta: 'Decyzja rundy', wskazowka: 'Wybierzcie jedną opcję. Decyzję podejmuje cały zespół.' },
  akcje: { id: 'akcje', etykieta: 'Wybór akcji', wskazowka: 'Wybierzcie działania na tę rundę. Każde ma swój koszt.' },
  zobowiazania: { id: 'zobowiazania', etykieta: 'Zobowiązania', wskazowka: 'Zapiszcie, kto co robi i do kiedy. Możecie podjąć do dwóch zobowiązań.' },
  zatwierdzenie: { id: 'zatwierdzenie', etykieta: 'Zatwierdzenie rundy', wskazowka: 'Gdy wszystko jest gotowe, zatwierdźcie rundę.' },
  kronika: { id: 'kronika', etykieta: 'Kronika Kłębkowa', wskazowka: 'Przeczytajcie na głos swoje wydanie specjalne.' },
  wykres: { id: 'wykres', etykieta: 'Przegląd kosztów', wskazowka: 'Zobaczcie, jak zmieniały się Wasze liczniki.' },
  wyjscie: { id: 'wyjscie', etykieta: 'Wyjście z ról', wskazowka: 'Powiedzcie po kolei: „Nie jestem już…” i podajcie nazwę swojej roli. Zostawcie karty na stole.' },
};

export const KROKI_FAZY: Record<IdFazy, OpisKroku[]> = {
  R0: [K.role, K.karty],
  R1: [K.zdarzenia, K.informacje, K.decyzja, K.akcje, K.zobowiazania, K.zatwierdzenie],
  R2: [K['sprawdzenie-zobowiazan'], K.skutek, K.koperty, K.zdarzenia, K.akcje, K.zobowiazania, K.zatwierdzenie],
  R3: [K['sprawdzenie-zobowiazan'], K.zdarzenia, K.zwrot, K.informacje, K.decyzja, K.akcje, K.zatwierdzenie],
  F: [K.skutek, K.kronika, K.wykres],
  Z: [K.wyjscie],
};

export const NAZWY_FAZ: Record<IdFazy, string> = {
  R0: 'Wprowadzenie',
  R1: 'Runda 1. Plan',
  R2: 'Runda 2. Realizacja',
  R3: 'Runda 3. Zwrot akcji',
  F: 'Finał. Dzień otwarcia',
  Z: 'Zakończenie',
};

export function czyRunda(faza: IdFazy): faza is 'R1' | 'R2' | 'R3' {
  return faza === 'R1' || faza === 'R2' || faza === 'R3';
}

export function nastepnaFaza(faza: IdFazy): IdFazy | null {
  const kolejnosc: IdFazy[] = ['R0', 'R1', 'R2', 'R3', 'F', 'Z'];
  const i = kolejnosc.indexOf(faza);
  return i >= 0 && i < kolejnosc.length - 1 ? (kolejnosc[i + 1] as IdFazy) : null;
}

export function poprzedniaRunda(runda: 'R1' | 'R2' | 'R3'): 'R1' | 'R2' | null {
  if (runda === 'R2') return 'R1';
  if (runda === 'R3') return 'R2';
  return null;
}
