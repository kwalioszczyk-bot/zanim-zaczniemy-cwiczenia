import { useState } from "react";
import type { KartaLicznik, KartaLista, KartaPojedyncza, KartaPowtarzalna } from "../types";
import { Field } from "./Field";
import { useCardEntry } from "./useCardEntry";
import { ConfirmDialog } from "../components/ConfirmDialog";

type Wpis = Record<string, unknown>;

export function PojedynczaCard({ karta }: { karta: KartaPojedyncza }) {
  const { value, setValue } = useCardEntry<Wpis>(karta.id, {});
  return (
    <div className="space-y-5">
      {karta.pola.map((pole) => (
        <Field
          key={pole.klucz}
          id={`${karta.id}-${pole.klucz}`}
          pole={pole}
          value={value[pole.klucz]}
          onChange={(v) => setValue({ ...value, [pole.klucz]: v })}
        />
      ))}
    </div>
  );
}

export function PowtarzalnaCard({ karta }: { karta: KartaPowtarzalna }) {
  const { value, setValue } = useCardEntry<Wpis[]>(karta.id, []);
  const [usunIndeks, setUsunIndeks] = useState<number | null>(null);

  const dodajWpis = () => setValue([...value, {}]);
  const aktualizujWpis = (idx: number, patch: Wpis) => {
    const kopia = [...value];
    kopia[idx] = { ...kopia[idx], ...patch };
    setValue(kopia);
  };
  const usunWpis = (idx: number) => {
    setValue(value.filter((_, i) => i !== idx));
    setUsunIndeks(null);
  };

  const pelno = value.length >= karta.maksWpisow;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink/60">
        Wpisy: {value.length} / {karta.maksWpisow}
      </p>

      {value.map((wpis, idx) => (
        <div key={idx} className="rounded-2xl border border-line bg-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink/70">Wpis {idx + 1}</span>
            <button type="button" onClick={() => setUsunIndeks(idx)} className="text-sm text-ink/60 underline">
              Usuń
            </button>
          </div>
          <div className="space-y-4">
            {karta.pola.map((pole) => (
              <Field
                key={pole.klucz}
                id={`${karta.id}-${idx}-${pole.klucz}`}
                pole={pole}
                value={wpis[pole.klucz]}
                onChange={(v) => aktualizujWpis(idx, { [pole.klucz]: v })}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={pelno}
        onClick={dodajWpis}
        className="w-full rounded-xl border border-dashed border-line px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:bg-panel"
      >
        {pelno ? "Osiągnięto limit wpisów" : "+ Dodaj wpis"}
      </button>

      <ConfirmDialog
        open={usunIndeks !== null}
        title="Usunąć ten wpis?"
        description="Tej operacji nie da się cofnąć."
        confirmLabel="Usuń"
        danger
        onConfirm={() => usunIndeks !== null && usunWpis(usunIndeks)}
        onCancel={() => setUsunIndeks(null)}
      />
    </div>
  );
}

export function ListaCard({ karta }: { karta: KartaLista }) {
  const { value, setValue } = useCardEntry<string[]>(karta.id, Array(karta.liczbaPol).fill(""));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: karta.liczbaPol }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-right text-sm text-ink/50">{idx + 1}.</span>
          <input
            type="text"
            placeholder={karta.placeholder}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            value={value[idx] ?? ""}
            onChange={(e) => {
              const kopia = [...value];
              kopia[idx] = e.target.value;
              setValue(kopia);
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function LicznikCard({ karta }: { karta: KartaLicznik }) {
  const { value, setValue } = useCardEntry<Record<string, number>>(karta.id, {});

  const zmien = (klucz: string, delta: number) => {
    const aktualna = value[klucz] ?? 0;
    setValue({ ...value, [klucz]: Math.max(0, aktualna + delta) });
  };

  return (
    <div className="space-y-3">
      {karta.liczniki.map((l) => {
        const kolor = l.kierunek === "rosnie" ? "border-[#6f8f6a]/60 bg-[#6f8f6a]/10" : "border-line bg-panel";
        return (
          <div key={l.klucz} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${kolor}`}>
            <span className="text-base">{l.etykieta}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={`Zmniejsz: ${l.etykieta}`}
                onClick={() => zmien(l.klucz, -1)}
                className="h-10 w-10 rounded-full border border-line bg-bg text-lg leading-none"
              >
                −
              </button>
              <span className="w-8 text-center text-lg font-semibold tabular-nums">{value[l.klucz] ?? 0}</span>
              <button
                type="button"
                aria-label={`Zwiększ: ${l.etykieta}`}
                onClick={() => zmien(l.klucz, 1)}
                className="h-10 w-10 rounded-full border border-line bg-bg text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
