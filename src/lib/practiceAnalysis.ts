import type { AppState } from "./storage";
import type { KartaPracy, ObszarPraktyki, PoleDef } from "../types";

function czyNiepuste(wartosc: unknown): boolean {
  if (wartosc == null || wartosc === "") return false;
  if (Array.isArray(wartosc)) return wartosc.length > 0;
  if (typeof wartosc === "object") {
    const v = wartosc as { wybrane?: string[]; dopisek?: string };
    if ("wybrane" in v || "dopisek" in v) return (v.wybrane?.length ?? 0) > 0 || !!v.dopisek;
    return Object.keys(wartosc as object).length > 0;
  }
  return true;
}

function policzWypelnionePola(pola: PoleDef[], dane: Record<string, unknown> | undefined): number {
  if (!dane) return 0;
  return pola.reduce((suma, pole) => suma + (czyNiepuste(dane[pole.klucz]) ? 1 : 0), 0);
}

/**
 * Liczy „jednostki aktywności" w jednej karcie — dla każdego typu karty co innego ma sens
 * (dzień w karcie tygodniowej, wpis w karcie powtarzalnej, wypełnione pole w liście...).
 * Wynik służy wyłącznie do porównania względnego między obszarami u tego samego użytkownika,
 * więc nie musi być jednostką spójną w skali bezwzględnej.
 */
export function policzAktywnoscKarty(karta: KartaPracy, wpis: unknown): number {
  if (wpis == null) return 0;

  switch (karta.typ) {
    case "pojedyncza":
      return policzWypelnionePola(karta.pola, wpis as Record<string, unknown>);

    case "powtarzalna":
      return (wpis as unknown[]).length;

    case "lista":
      return (wpis as string[]).filter((v) => v && v.trim() !== "").length;

    case "licznik": {
      const v = wpis as Record<string, number>;
      return karta.liczniki.filter((l) => (v[l.klucz] ?? 0) > 0).length;
    }

    case "tydzien": {
      const v = wpis as { dni?: Record<string, unknown>[] };
      return (v.dni ?? []).filter((dzien) => karta.poleDnia.some((p) => czyNiepuste(dzien[p.klucz]))).length;
    }

    case "rutyna": {
      const v = wpis as { kroki?: string[]; oceny?: (number | null)[] };
      const oceny = (v.oceny ?? []).filter((o) => o != null).length;
      const kroki = (v.kroki ?? []).filter((k) => k && k.trim() !== "").length;
      return oceny + kroki;
    }

    case "wykresDwaTygodnie": {
      const v = wpis as { dni?: Record<string, unknown>[] };
      return (v.dni ?? []).filter((dzien) => karta.poleDnia.some((p) => czyNiepuste(dzien[p.klucz]))).length;
    }

    case "skalaWielokrotna": {
      const v = wpis as Record<string, number>;
      return karta.pozycje.filter((p) => v[p] != null).length;
    }

    case "trzyKolumny": {
      const v = wpis as Record<string, string[]>;
      return karta.kolumny.reduce((suma, k) => suma + (v[k.klucz] ?? []).filter(Boolean).length, 0);
    }

    case "zasady": {
      const v = wpis as { zasady?: { zasada: string }[] };
      return (v.zasady ?? []).filter((z) => z.zasada && z.zasada.trim() !== "").length;
    }

    case "termometr": {
      const v = wpis as Record<string, Record<string, string>>;
      return karta.poziomy.reduce(
        (suma, poziom) => suma + poziom.pola.filter((pole) => czyNiepuste(v[poziom.poziom]?.[pole])).length,
        0
      );
    }

    case "planAwaryjny":
      return policzWypelnionePola(karta.sekcje as PoleDef[], wpis as Record<string, unknown>);

    case "przeglad":
      return policzWypelnionePola(karta.pytania, wpis as Record<string, unknown>);

    case "planPodtrzymania": {
      const v = wpis as Record<string, unknown>;
      return karta.sekcje.reduce((suma, s) => {
        const wartosc = v[s.klucz];
        if (Array.isArray(wartosc)) return suma + (wartosc as string[]).filter((x) => x && x.trim() !== "").length;
        return suma + (czyNiepuste(wartosc) ? 1 : 0);
      }, 0);
    }

    default:
      return 0;
  }
}

export interface WynikObszaru {
  obszar: ObszarPraktyki;
  aktywnoscRaw: number;
  aktywnoscNorm: number; // 0–100, względem najaktywniejszego obszaru TEGO użytkownika
  wagaNorm: number; // 0–100, względem najwyżej ważonego obszaru w danych badawczych
}

export function policzWynikiObszarow(obszary: ObszarPraktyki[], kartyPracy: KartaPracy[], wpisyKart: AppState["wpisyKart"]): WynikObszaru[] {
  const kartyById = new Map(kartyPracy.map((k) => [k.id, k]));

  const raw = obszary.map((obszar) => {
    const aktywnoscRaw = obszar.zrodlaWpisow.reduce((suma, id) => {
      const karta = kartyById.get(id);
      if (!karta) return suma;
      return suma + policzAktywnoscKarty(karta, wpisyKart[id]);
    }, 0);
    return { obszar, aktywnoscRaw };
  });

  const maxRaw = Math.max(1, ...raw.map((r) => r.aktywnoscRaw));
  const maxWaga = Math.max(1, ...obszary.map((o) => o.wagaBadawcza));

  return raw.map(({ obszar, aktywnoscRaw }) => ({
    obszar,
    aktywnoscRaw,
    aktywnoscNorm: Math.round((aktywnoscRaw / maxRaw) * 100),
    wagaNorm: Math.round((obszar.wagaBadawcza / maxWaga) * 100),
  }));
}

// Progi dobrane empirycznie tak, żeby komunikat pojawiał się dopiero przy realnej pracy
// z aplikacją — kilka pojedynczych kliknięć nie powinno jeszcze generować "analizy".
const PROG_MALO_SUMA = 4;
const PROG_ROWNOMIERNIE_ROZPIETOSC = 20;

export type TypKomunikatu = "brak" | "malo" | "rownomiernie" | "luka" | "mocnaStrona";

export interface WynikInterpretacji {
  typ: TypKomunikatu;
  tresc: string;
  obszar?: ObszarPraktyki;
}

/** Zawsze zwraca dokładnie JEDEN komunikat — zgodnie z założeniem, że to nie ma być lista ocen. */
export function wybierzKomunikat(wyniki: WynikObszaru[], komunikaty: import("../types").KomunikatyZwrotne): WynikInterpretacji {
  const sumaRaw = wyniki.reduce((suma, w) => suma + w.aktywnoscRaw, 0);
  if (sumaRaw === 0) return { typ: "brak", tresc: komunikaty.brakDanych };
  if (sumaRaw < PROG_MALO_SUMA) return { typ: "malo", tresc: komunikaty.malo };

  const maxNorm = Math.max(...wyniki.map((w) => w.aktywnoscNorm));
  const minNorm = Math.min(...wyniki.map((w) => w.aktywnoscNorm));

  if (maxNorm - minNorm <= PROG_ROWNOMIERNIE_ROZPIETOSC) return { typ: "rownomiernie", tresc: komunikaty.rownomiernie };

  const najwazniejsze = wyniki.filter((w) => w.obszar.wagaBadawcza === Math.max(...wyniki.map((x) => x.obszar.wagaBadawcza)));
  const najslabszeZWaznych = [...najwazniejsze].sort((a, b) => a.aktywnoscNorm - b.aktywnoscNorm)[0];

  if (najslabszeZWaznych && najslabszeZWaznych.aktywnoscNorm === minNorm) {
    return { typ: "luka", tresc: komunikaty.lukaWaznaObszar, obszar: najslabszeZWaznych.obszar };
  }

  const najmocniejszy = [...wyniki].sort((a, b) => b.aktywnoscNorm - a.aktywnoscNorm)[0];
  return { typ: "mocnaStrona", tresc: komunikaty.mocnaStrona, obszar: najmocniejszy.obszar };
}
