import type { TrescDlaStolika, WidokSesji, WidokStolika, Kronika } from '@klebkowo/engine';

export interface StanWidoku {
  tresc: TrescDlaStolika;
  sesja: WidokSesji;
  stolik: WidokStolika;
  /** Identyfikatory zdarzeń bieżącej rundy — przychodzą dopiero wtedy, gdy są potrzebne. */
  zdarzeniaRundy: string[];
  kronika: Kronika | null;
}

/** Karty wyświetlane po operacji — trzymane też w sessionStorage, żeby przetrwały odświeżenie. */
export interface KartyRundy {
  zdarzenia: {
    zdarzenie: string;
    tytul: string;
    tekst: string;
    zmiany: Record<string, number>;
    komentarz?: string;
    ochrona?: string;
    wybor?: string;
  }[];
  akcje: { akcja: string; nazwa: string; zmiany: Record<string, number>; komunikat?: string; bezWymogu?: boolean }[];
  skutek: { tytul: string; tekst: string; zmiany: Record<string, number>; zlagodzony: boolean } | null;
  zobowiazania: {
    id: string;
    rola: string;
    co: string;
    status: string;
    obciazenie: number;
    rzut?: number;
    zmiany: Record<string, number>;
  }[];
  decyzja: { komunikat: string } | null;
}

export const pusteKarty = (): KartyRundy => ({ zdarzenia: [], akcje: [], skutek: null, zobowiazania: [], decyzja: null });

const klucz = (sesja: string, stolik: string, faza: string) => `klebkowo:karty:${sesja}:${stolik}:${faza}`;

export function wczytajKarty(sesja: string, stolik: string, faza: string): KartyRundy {
  try {
    const zapis = sessionStorage.getItem(klucz(sesja, stolik, faza));
    return zapis ? { ...pusteKarty(), ...(JSON.parse(zapis) as KartyRundy) } : pusteKarty();
  } catch {
    // tryb prywatny przeglądarki albo zablokowane dane stron — gra działa dalej
    return pusteKarty();
  }
}

export function zapiszKarty(sesja: string, stolik: string, faza: string, karty: KartyRundy): void {
  try {
    sessionStorage.setItem(klucz(sesja, stolik, faza), JSON.stringify(karty));
  } catch {
    /* brak pamięci podręcznej nie może przerwać gry */
  }
}
