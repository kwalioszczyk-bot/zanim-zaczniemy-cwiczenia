import type { KartaPracy, PoleDef } from "../types";

export interface WierszPodsumowania {
  etykieta: string;
  wartosc: string;
}

function formatujWartoscPola(pole: PoleDef, wartosc: unknown): string {
  if (wartosc == null || wartosc === "") return "—";
  if (pole.typ === "tak_nie") return wartosc ? "Tak" : "Nie";
  if (pole.typ === "wieloWybor" && Array.isArray(wartosc)) return (wartosc as string[]).join(", ") || "—";
  if (pole.typ === "wieloWyborZDopisem") {
    const v = wartosc as { wybrane?: string[]; dopisek?: string };
    const czesci = [...(v.wybrane ?? []), v.dopisek].filter(Boolean);
    return czesci.join(", ") || "—";
  }
  return String(wartosc);
}

function poleWiersze(pola: PoleDef[], dane: Record<string, unknown> | undefined, prefiks = ""): WierszPodsumowania[] {
  if (!dane) return [];
  return pola.map((pole) => ({
    etykieta: prefiks ? `${prefiks} — ${pole.etykieta}` : pole.etykieta,
    wartosc: formatujWartoscPola(pole, dane[pole.klucz]),
  }));
}

const DNI_TYGODNIA = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

export function podsumujKarte(karta: KartaPracy, wpis: unknown): WierszPodsumowania[] {
  if (wpis == null) return [];

  switch (karta.typ) {
    case "pojedyncza":
      return poleWiersze(karta.pola, wpis as Record<string, unknown>);

    case "powtarzalna": {
      const wpisy = (wpis as Record<string, unknown>[]) ?? [];
      return wpisy.flatMap((w, idx) => poleWiersze(karta.pola, w, `Wpis ${idx + 1}`));
    }

    case "lista": {
      const lista = (wpis as string[]) ?? [];
      return lista.map((v, idx) => ({ etykieta: `${idx + 1}.`, wartosc: v || "—" }));
    }

    case "licznik": {
      const liczniki = (wpis as Record<string, number>) ?? {};
      return karta.liczniki.map((l) => ({ etykieta: l.etykieta, wartosc: String(liczniki[l.klucz] ?? 0) }));
    }

    case "tydzien": {
      const v = wpis as { stale?: Record<string, unknown>; dni?: Record<string, unknown>[]; licznik?: number[] };
      const stale = karta.polaStale ? poleWiersze(karta.polaStale, v.stale) : [];
      const dni = (v.dni ?? []).flatMap((d, idx) => poleWiersze(karta.poleDnia, d, DNI_TYGODNIA[idx] ?? `Dzień ${idx + 1}`));
      return [...stale, ...dni];
    }

    case "rutyna": {
      const v = wpis as { stale?: Record<string, unknown>; kroki?: string[]; oceny?: (number | null)[] };
      const stale = poleWiersze(karta.polaStale, v.stale);
      const kroki = (v.kroki ?? []).map((k, idx) => ({ etykieta: `Krok ${idx + 1}`, wartosc: k || "—" }));
      const oceny = (v.oceny ?? []).map((o, idx) => ({ etykieta: `Ocena dnia ${idx + 1}`, wartosc: o == null ? "—" : String(o) }));
      return [...stale, ...kroki, ...oceny];
    }

    case "wykresDwaTygodnie": {
      const v = wpis as { stale?: Record<string, unknown>; dni?: Record<string, unknown>[] };
      const stale = poleWiersze(karta.polaStale, v.stale);
      const dni = (v.dni ?? []).flatMap((d, idx) => poleWiersze(karta.poleDnia, d, `Dzień ${idx + 1}`));
      return [...stale, ...dni];
    }

    case "skalaWielokrotna": {
      const v = (wpis as Record<string, number>) ?? {};
      return karta.pozycje.map((p) => ({ etykieta: p, wartosc: v[p] == null ? "—" : String(v[p]) }));
    }

    case "trzyKolumny": {
      const v = (wpis as Record<string, string[]>) ?? {};
      return karta.kolumny.map((k) => ({ etykieta: k.etykieta, wartosc: (v[k.klucz] ?? []).filter(Boolean).join(", ") || "—" }));
    }

    case "zasady": {
      const v = (wpis as { zasady?: { zasada: string; konsekwencja: string; rodzaj: string }[] }) ?? {};
      return (v.zasady ?? []).flatMap((z, idx) => [
        { etykieta: `Zasada ${idx + 1}`, wartosc: z.zasada || "—" },
        { etykieta: `Konsekwencja ${idx + 1}`, wartosc: `${z.konsekwencja || "—"} (${z.rodzaj || "—"})` },
      ]);
    }

    case "termometr": {
      const v = (wpis as Record<string, Record<string, string>>) ?? {};
      return karta.poziomy.flatMap((poziom) =>
        poziom.pola.map((pole) => ({ etykieta: `${poziom.poziom} — ${pole}`, wartosc: v[poziom.poziom]?.[pole] || "—" }))
      );
    }

    case "planAwaryjny": {
      const v = (wpis as Record<string, unknown>) ?? {};
      return poleWiersze(karta.sekcje as PoleDef[], v);
    }

    case "przeglad": {
      const v = (wpis as Record<string, unknown>) ?? {};
      return poleWiersze(karta.pytania, v);
    }

    case "planPodtrzymania": {
      const v = (wpis as Record<string, unknown>) ?? {};
      return karta.sekcje.map((s) => {
        const wartosc = v[s.klucz];
        if (Array.isArray(wartosc)) return { etykieta: s.etykieta, wartosc: (wartosc as string[]).filter(Boolean).join(", ") || "—" };
        return { etykieta: s.etykieta, wartosc: (wartosc as string) || "—" };
      });
    }

    default:
      return [];
  }
}
