import type { KartaPlanAwaryjny, KartaPlanPodtrzymania, KartaPrzeglad, PoleDef } from "../types";
import { Field } from "./Field";
import { useCardEntry } from "./useCardEntry";

export function PlanAwaryjnyCard({ karta }: { karta: KartaPlanAwaryjny }) {
  const { value, setValue } = useCardEntry<Record<string, unknown>>(karta.id, {});

  return (
    <div className="space-y-6">
      {karta.sekcje.map((sekcja) => {
        const pole = sekcja as PoleDef;
        return (
          <Field
            key={pole.klucz}
            id={`${karta.id}-${pole.klucz}`}
            pole={pole}
            value={value[pole.klucz]}
            onChange={(v) => setValue({ ...value, [pole.klucz]: v })}
          />
        );
      })}

      <div className="rounded-2xl border border-line bg-panel p-4 print-page">
        <h3 className="font-heading text-base font-semibold">Stałe kroki — kiedy czujesz, że narasta</h3>
        <ol className="mt-3 space-y-2 text-base leading-relaxed">
          {karta.stalyKrok.map((krok, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 font-heading font-semibold text-accent">{idx + 1}.</span>
              <span>{krok}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function PrzegladCard({ karta }: { karta: KartaPrzeglad }) {
  const { value, setValue } = useCardEntry<Record<string, unknown>>(karta.id, {});

  return (
    <div className="space-y-6">
      {karta.pytania.map((pytanie) => (
        <Field
          key={pytanie.klucz}
          id={`${karta.id}-${pytanie.klucz}`}
          pole={pytanie}
          value={value[pytanie.klucz]}
          onChange={(v) => setValue({ ...value, [pytanie.klucz]: v })}
        />
      ))}

      <div className="rounded-2xl border border-line bg-panel p-4 text-base leading-relaxed">{karta.komunikatWspierajacy}</div>
    </div>
  );
}

export function PlanPodtrzymaniaCard({ karta }: { karta: KartaPlanPodtrzymania }) {
  const { value, setValue } = useCardEntry<Record<string, unknown>>(karta.id, {});

  return (
    <div className="space-y-6">
      {karta.sekcje.map((sekcja) => {
        if (sekcja.typ === "lista") {
          const lista: string[] = Array.isArray(value[sekcja.klucz])
            ? (value[sekcja.klucz] as string[])
            : Array(sekcja.liczbaPol ?? 3).fill("");
          return (
            <div key={sekcja.klucz}>
              <label className="mb-2 block text-sm font-medium">{sekcja.etykieta}</label>
              <div className="space-y-2">
                {Array.from({ length: sekcja.liczbaPol ?? 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-right text-sm text-ink/50">{idx + 1}.</span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                      value={lista[idx] ?? ""}
                      onChange={(e) => {
                        const kopia = [...lista];
                        kopia[idx] = e.target.value;
                        setValue({ ...value, [sekcja.klucz]: kopia });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={sekcja.klucz}>
            <label className="mb-1.5 block text-sm font-medium">{sekcja.etykieta}</label>
            <textarea
              rows={sekcja.wiersze ?? 2}
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={(value[sekcja.klucz] as string) ?? ""}
              onChange={(e) => setValue({ ...value, [sekcja.klucz]: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
