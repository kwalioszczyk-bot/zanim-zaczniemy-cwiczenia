import type { KartaSkalaWielokrotna, KartaTermometr, KartaTrzyKolumny, KartaZasady } from "../types";
import { useCardEntry } from "./useCardEntry";
import { InlineHelpHint } from "../components/InlineHelpHint";

export function SkalaWielokrotnaCard({ karta }: { karta: KartaSkalaWielokrotna }) {
  const { value, setValue } = useCardEntry<Record<string, number>>(karta.id, {});

  const pozycje = [...karta.pozycje].sort((a, b) => (value[b] ?? -1) - (value[a] ?? -1));

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-xs text-ink/60">
        <span>{karta.skala.opisMin}</span>
        <span>{karta.skala.opisMax}</span>
      </div>
      {pozycje.map((pozycja) => {
        const current = value[pozycja] ?? karta.skala.min;
        return (
          <div key={pozycja}>
            <label className="mb-1.5 flex justify-between text-sm font-medium">
              <span>{pozycja}</span>
              <span className="text-accent">{value[pozycja] ?? "–"}</span>
            </label>
            <input
              type="range"
              min={karta.skala.min}
              max={karta.skala.max}
              value={current}
              onChange={(e) => setValue({ ...value, [pozycja]: Number(e.target.value) })}
              className="w-full accent-[#a8927a]"
            />
          </div>
        );
      })}
    </div>
  );
}

interface TrzyKolumnyValue {
  [klucz: string]: string[];
}

export function TrzyKolumnyCard({ karta }: { karta: KartaTrzyKolumny }) {
  const initial: TrzyKolumnyValue = {};
  karta.kolumny.forEach((k) => (initial[k.klucz] = []));
  const { value, setValue } = useCardEntry<TrzyKolumnyValue>(karta.id, initial);

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {karta.kolumny.map((kolumna) => {
        const pozycje = value[kolumna.klucz] ?? [];
        const przekroczono = !!kolumna.limit && pozycje.length > kolumna.limit;
        return (
          <div key={kolumna.klucz} className="rounded-2xl border border-line p-4" style={{ borderTopColor: kolumna.kolor, borderTopWidth: 4 }}>
            <h3 className="font-heading text-sm font-semibold" style={{ color: kolumna.kolor }}>
              {kolumna.etykieta}
            </h3>
            <p className="mt-1 text-xs text-ink/60">{kolumna.opis}</p>

            <ul className="mt-3 space-y-2">
              {pozycje.map((pozycja, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm"
                    value={pozycja}
                    onChange={(e) => {
                      const kopia = [...pozycje];
                      kopia[idx] = e.target.value;
                      setValue({ ...value, [kolumna.klucz]: kopia });
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Usuń pozycję"
                    onClick={() => setValue({ ...value, [kolumna.klucz]: pozycje.filter((_, i) => i !== idx) })}
                    className="shrink-0 text-ink/50"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setValue({ ...value, [kolumna.klucz]: [...pozycje, ""] })}
              className="mt-3 text-sm font-medium text-accent underline"
            >
              + Dodaj
            </button>

            {przekroczono && (
              <p className="mt-2 text-xs leading-relaxed text-ink/80">
                Jest więcej niż {kolumna.limit} — rozważ przeniesienie części do kolumny zielonej na ten miesiąc.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Zasada {
  zasada: string;
  konsekwencja: string;
  rodzaj: string;
}

interface ZasadyValue {
  zasady: Zasada[];
  podpisRodzic: boolean;
  podpisDziecko: boolean;
}

export function ZasadyCard({ karta }: { karta: KartaZasady }) {
  const { value, setValue } = useCardEntry<ZasadyValue>(karta.id, { zasady: [], podpisRodzic: false, podpisDziecko: false });
  const poleZasada = karta.polaZasady.find((p) => p.klucz === "zasada");
  const poleKonsekwencja = karta.polaZasady.find((p) => p.klucz === "konsekwencja");
  const poleRodzaj = karta.polaZasady.find((p) => p.klucz === "rodzaj");

  const dodaj = () => {
    if (value.zasady.length >= karta.maksZasad) return;
    setValue({ ...value, zasady: [...value.zasady, { zasada: "", konsekwencja: "", rodzaj: "" }] });
  };

  const aktualizuj = (idx: number, patch: Partial<Zasada>) => {
    const zasady = [...value.zasady];
    zasady[idx] = { ...zasady[idx], ...patch };
    setValue({ ...value, zasady });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink/60">
        Zasady: {value.zasady.length} / {karta.maksZasad}
      </p>

      {value.zasady.map((zasada, idx) => (
        <div key={idx} className="space-y-3 rounded-2xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink/70">Zasada {idx + 1}</span>
            <button
              type="button"
              onClick={() => setValue({ ...value, zasady: value.zasady.filter((_, i) => i !== idx) })}
              className="text-sm text-ink/60 underline"
            >
              Usuń
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">{poleZasada?.etykieta ?? "U nas w domu..."}</label>
            <input
              type="text"
              placeholder={poleZasada?.placeholder}
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={zasada.zasada}
              onChange={(e) => aktualizuj(idx, { zasada: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">{poleKonsekwencja?.etykieta ?? "Konsekwencja"}</label>
            <input
              type="text"
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={zasada.konsekwencja}
              onChange={(e) => aktualizuj(idx, { konsekwencja: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">{poleRodzaj?.etykieta ?? "Rodzaj"}</label>
            <div className="flex flex-wrap gap-2">
              {(poleRodzaj?.opcje ?? []).map((opcja) => (
                <button
                  key={opcja}
                  type="button"
                  aria-pressed={zasada.rodzaj === opcja}
                  onClick={() => aktualizuj(idx, { rodzaj: opcja })}
                  className={`rounded-xl border px-4 py-2 text-sm ${zasada.rodzaj === opcja ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
                >
                  {opcja}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {value.zasady.length < karta.maksZasad && (
        <button type="button" onClick={dodaj} className="w-full rounded-xl border border-dashed border-line px-4 py-3 text-sm font-medium hover:bg-panel">
          + Dodaj zasadę
        </button>
      )}

      {karta.podpisy && (
        <div className="rounded-2xl border border-line p-4">
          <p className="mb-3 text-sm font-medium">Ustaliliśmy to razem</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              aria-pressed={value.podpisRodzic}
              onClick={() => setValue({ ...value, podpisRodzic: !value.podpisRodzic })}
              className={`rounded-xl border px-4 py-2.5 text-sm ${value.podpisRodzic ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
            >
              {value.podpisRodzic ? "✓ " : ""}Podpis rodzica
            </button>
            <button
              type="button"
              aria-pressed={value.podpisDziecko}
              onClick={() => setValue({ ...value, podpisDziecko: !value.podpisDziecko })}
              className={`rounded-xl border px-4 py-2.5 text-sm ${value.podpisDziecko ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
            >
              {value.podpisDziecko ? "✓ " : ""}Podpis dziecka
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/60">Bez wpisywania imion — samo potwierdzenie, że kodeks powstał wspólnie.</p>
        </div>
      )}
    </div>
  );
}

export function TermometrCard({ karta }: { karta: KartaTermometr }) {
  const { value, setValue } = useCardEntry<Record<string, Record<string, string>>>(karta.id, {});

  return (
    <div className="space-y-5">
      {karta.poziomy.map((poziom) => (
        <div key={poziom.poziom} className="rounded-2xl border p-4" style={{ borderColor: poziom.kolor }}>
          <h3 className="font-heading text-base font-semibold" style={{ color: poziom.kolor }}>
            {poziom.poziom}
          </h3>
          <div className="mt-3 space-y-3">
            {poziom.pola.map((etykieta) => (
              <div key={etykieta}>
                <label className="mb-1.5 block text-sm font-medium">{etykieta}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  value={value[poziom.poziom]?.[etykieta] ?? ""}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      [poziom.poziom]: { ...value[poziom.poziom], [etykieta]: e.target.value },
                    })
                  }
                />
                <InlineHelpHint text={value[poziom.poziom]?.[etykieta] ?? ""} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
