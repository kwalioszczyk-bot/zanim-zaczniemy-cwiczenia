import type { KartaRutyna, KartaTydzien, KartaWykresDwaTygodnie } from "../types";
import { Field } from "./Field";
import { useCardEntry } from "./useCardEntry";

const DNI_TYGODNIA = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

type Wpis = Record<string, unknown>;

interface TydzienValue {
  stale: Wpis;
  dni: Wpis[];
  licznik: number[];
}

function pustyTydzien(dni: number): TydzienValue {
  return { stale: {}, dni: Array.from({ length: dni }, () => ({})), licznik: Array.from({ length: dni }, () => 0) };
}

export function TydzienCard({ karta }: { karta: KartaTydzien }) {
  const { value, setValue } = useCardEntry<TydzienValue>(karta.id, pustyTydzien(7));

  return (
    <div className="space-y-6">
      {karta.polaStale && karta.polaStale.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-line bg-panel p-4">
          {karta.polaStale.map((pole) => (
            <Field
              key={pole.klucz}
              id={`${karta.id}-stale-${pole.klucz}`}
              pole={pole}
              value={value.stale[pole.klucz]}
              onChange={(v) => setValue({ ...value, stale: { ...value.stale, [pole.klucz]: v } })}
            />
          ))}
        </div>
      )}

      {DNI_TYGODNIA.map((nazwaDnia, idx) => (
        <div key={idx} className="rounded-2xl border border-line p-4">
          <h3 className="mb-3 font-heading text-base font-semibold">{nazwaDnia}</h3>
          <div className="space-y-4">
            {karta.poleDnia.map((pole) => (
              <Field
                key={pole.klucz}
                id={`${karta.id}-${idx}-${pole.klucz}`}
                pole={pole}
                value={value.dni[idx]?.[pole.klucz]}
                onChange={(v) => {
                  const dni = [...value.dni];
                  dni[idx] = { ...dni[idx], [pole.klucz]: v };
                  setValue({ ...value, dni });
                }}
              />
            ))}
            {karta.licznikDzienny && (
              <div>
                <label className="mb-1.5 flex justify-between text-sm font-medium">
                  <span>{karta.licznikDzienny.etykieta}</span>
                  <span className="text-accent">
                    {value.licznik[idx] ?? 0} / {karta.licznikDzienny.cel}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Zmniejsz"
                    onClick={() => {
                      const licznik = [...value.licznik];
                      licznik[idx] = Math.max(0, (licznik[idx] ?? 0) - 1);
                      setValue({ ...value, licznik });
                    }}
                    className="h-10 w-10 rounded-full border border-line text-lg"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label="Zwiększ"
                    onClick={() => {
                      const licznik = [...value.licznik];
                      licznik[idx] = (licznik[idx] ?? 0) + 1;
                      setValue({ ...value, licznik });
                    }}
                    className="h-10 w-10 rounded-full border border-line text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface RutynaValue {
  stale: Wpis;
  kroki: string[];
  oceny: (number | null)[];
}

export function RutynaCard({ karta }: { karta: KartaRutyna }) {
  const { value, setValue } = useCardEntry<RutynaValue>(karta.id, {
    stale: {},
    kroki: Array(karta.kroki.min).fill(""),
    oceny: Array(karta.ocenaDzienna.dni).fill(null),
  });

  const dodajKrok = () => {
    if (value.kroki.length >= karta.kroki.maks) return;
    setValue({ ...value, kroki: [...value.kroki, ""] });
  };
  const usunKrok = (idx: number) => {
    if (value.kroki.length <= karta.kroki.min) return;
    setValue({ ...value, kroki: value.kroki.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-line bg-panel p-4">
        {karta.polaStale.map((pole) => (
          <Field
            key={pole.klucz}
            id={`${karta.id}-stale-${pole.klucz}`}
            pole={pole}
            value={value.stale[pole.klucz]}
            onChange={(v) => setValue({ ...value, stale: { ...value.stale, [pole.klucz]: v } })}
          />
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-base font-semibold">Kroki rutyny</h3>
        <div className="space-y-2">
          {value.kroki.map((krok, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right text-sm text-ink/50">{idx + 1}.</span>
              <input
                type="text"
                placeholder={`${karta.kroki.etykieta} ${idx + 1}`}
                className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                value={krok}
                onChange={(e) => {
                  const kroki = [...value.kroki];
                  kroki[idx] = e.target.value;
                  setValue({ ...value, kroki });
                }}
              />
              {value.kroki.length > karta.kroki.min && (
                <button type="button" aria-label="Usuń krok" onClick={() => usunKrok(idx)} className="shrink-0 px-2 text-ink/50">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {value.kroki.length < karta.kroki.maks && (
          <button type="button" onClick={dodajKrok} className="mt-2 text-sm font-medium text-accent underline">
            + Dodaj krok
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-base font-semibold">{karta.ocenaDzienna.etykieta} — siedem dni</h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: karta.ocenaDzienna.dni }).map((_, idx) => (
            <div key={idx} className="text-center">
              <div className="mb-1 text-xs text-ink/60">{idx + 1}</div>
              <select
                aria-label={`Ocena dnia ${idx + 1}`}
                className="w-full rounded-lg border border-line bg-bg py-2 text-center text-sm"
                value={value.oceny[idx] ?? ""}
                onChange={(e) => {
                  const oceny = [...value.oceny];
                  oceny[idx] = e.target.value === "" ? null : Number(e.target.value);
                  setValue({ ...value, oceny });
                }}
              >
                <option value="">–</option>
                {Array.from({ length: karta.ocenaDzienna.max - karta.ocenaDzienna.min + 1 }).map((_, i) => {
                  const v = karta.ocenaDzienna.min + i;
                  return (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface WykresValue {
  stale: Wpis;
  dni: Wpis[];
}

export function WykresDwaTygodnieCard({ karta }: { karta: KartaWykresDwaTygodnie }) {
  const LICZBA_DNI = 14;
  const { value, setValue } = useCardEntry<WykresValue>(karta.id, {
    stale: {},
    dni: Array.from({ length: LICZBA_DNI }, () => ({})),
  });

  const liczby = value.dni.map((d) => Number(d["liczba"]) || 0);
  const maxLiczba = Math.max(1, ...liczby);
  const szerokoscSlupka = 100 / LICZBA_DNI;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-line bg-panel p-4">
        {karta.polaStale.map((pole) => (
          <Field
            key={pole.klucz}
            id={`${karta.id}-stale-${pole.klucz}`}
            pole={pole}
            value={value.stale[pole.klucz]}
            onChange={(v) => setValue({ ...value, stale: { ...value.stale, [pole.klucz]: v } })}
          />
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-base font-semibold">Wykres — 14 dni</h3>
        <svg viewBox="0 0 280 100" className="w-full" role="img" aria-label="Wykres słupkowy liczby wystąpień w ciągu 14 dni">
          {liczby.map((l, idx) => {
            const wysokosc = (l / maxLiczba) * 80;
            return (
              <rect
                key={idx}
                x={idx * szerokoscSlupka * 2.8 + 2}
                y={98 - wysokosc}
                width={szerokoscSlupka * 2.8 - 4}
                height={wysokosc}
                rx={2}
                fill="#a8927a"
              />
            );
          })}
          <line x1="0" y1="98" x2="280" y2="98" stroke="#d6ccc0" strokeWidth="1" />
        </svg>
      </div>

      <div className="space-y-3">
        {Array.from({ length: LICZBA_DNI }).map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-line p-4">
            <h4 className="mb-2 text-sm font-medium text-ink/70">Dzień {idx + 1}</h4>
            <div className="space-y-3">
              {karta.poleDnia.map((pole) => (
                <Field
                  key={pole.klucz}
                  id={`${karta.id}-${idx}-${pole.klucz}`}
                  pole={pole}
                  value={value.dni[idx]?.[pole.klucz]}
                  onChange={(v) => {
                    const dni = [...value.dni];
                    dni[idx] = { ...dni[idx], [pole.klucz]: v };
                    setValue({ ...value, dni });
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
