import type { PoleDef } from "../types";
import { InlineHelpHint } from "../components/InlineHelpHint";

interface Props {
  pole: PoleDef;
  value: unknown;
  onChange: (value: unknown) => void;
  id: string;
}

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export function Field({ pole, value, onChange, id }: Props) {
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
      {pole.etykieta}
    </label>
  );

  switch (pole.typ) {
    case "tekst":
      return (
        <div>
          {label}
          <input
            id={id}
            type="text"
            className={inputClass}
            placeholder={pole.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <InlineHelpHint text={(value as string) ?? ""} />
        </div>
      );

    case "tekstDlugi":
      return (
        <div>
          {label}
          <textarea
            id={id}
            rows={pole.wiersze ?? 3}
            className={inputClass}
            placeholder={pole.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <InlineHelpHint text={(value as string) ?? ""} />
        </div>
      );

    case "liczba":
      return (
        <div>
          {label}
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={pole.min}
            max={pole.max}
            className={inputClass}
            value={value === undefined || value === null ? "" : (value as number)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      );

    case "skala": {
      const min = pole.min ?? 0;
      const max = pole.max ?? 10;
      const current = typeof value === "number" ? value : min;
      return (
        <div>
          <label htmlFor={id} className="mb-1.5 flex justify-between text-sm font-medium text-ink">
            <span>{pole.etykieta}</span>
            <span className="text-accent">{current}</span>
          </label>
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-[#a8927a]"
          />
        </div>
      );
    }

    case "wybor":
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-2">
            {(pole.opcje ?? []).map((opcja) => {
              const active = value === opcja;
              return (
                <button
                  key={opcja}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange(opcja)}
                  className={`rounded-xl border px-4 py-2.5 text-sm ${active ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
                >
                  {opcja}
                </button>
              );
            })}
          </div>
        </div>
      );

    case "wieloWybor": {
      const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (opcja: string) => {
        onChange(selected.includes(opcja) ? selected.filter((o) => o !== opcja) : [...selected, opcja]);
      };
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">{pole.etykieta}</legend>
          <div className="flex flex-wrap gap-2">
            {(pole.opcje ?? []).map((opcja) => {
              const active = selected.includes(opcja);
              return (
                <button
                  key={opcja}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(opcja)}
                  className={`rounded-xl border px-4 py-2.5 text-sm ${active ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
                >
                  {opcja}
                </button>
              );
            })}
          </div>
        </fieldset>
      );
    }

    case "wieloWyborZDopisem": {
      const val = (value as { wybrane: string[]; dopisek: string }) ?? { wybrane: [], dopisek: "" };
      const toggle = (opcja: string) => {
        const wybrane = val.wybrane.includes(opcja) ? val.wybrane.filter((o) => o !== opcja) : [...val.wybrane, opcja];
        onChange({ ...val, wybrane });
      };
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">{pole.etykieta}</legend>
          <div className="flex flex-wrap gap-2">
            {(pole.opcje ?? []).map((opcja) => {
              const active = val.wybrane.includes(opcja);
              return (
                <button
                  key={opcja}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(opcja)}
                  className={`rounded-xl border px-4 py-2.5 text-sm ${active ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
                >
                  {opcja}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Coś jeszcze? (dopisz własne)"
            className={inputClass + " mt-2"}
            value={val.dopisek}
            onChange={(e) => onChange({ ...val, dopisek: e.target.value })}
          />
        </fieldset>
      );
    }

    case "tak_nie": {
      const options: { v: boolean; l: string }[] = [
        { v: true, l: "Tak" },
        { v: false, l: "Nie" },
      ];
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">{pole.etykieta}</legend>
          <div className="flex gap-2">
            {options.map((opt) => (
              <button
                key={opt.l}
                type="button"
                aria-pressed={value === opt.v}
                onClick={() => onChange(opt.v)}
                className={`rounded-xl border px-5 py-2.5 text-sm ${value === opt.v ? "border-accent bg-accent/20 font-medium" : "border-line bg-bg"}`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </fieldset>
      );
    }

    case "data":
      return (
        <div>
          {label}
          <input id={id} type="date" className={inputClass} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    case "godzina":
      return (
        <div>
          {label}
          <input id={id} type="time" className={inputClass} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    default:
      return null;
  }
}
