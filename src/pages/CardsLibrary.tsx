import { useState } from "react";
import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";
import { Link, useQueryParam } from "../router";

const dane = trescJson as TrescAplikacji;

export function CardsLibrary() {
  const modulZUrl = useQueryParam("modul");
  const [filtr, setFiltr] = useState<number | "wszystkie">(modulZUrl ? Number(modulZUrl) : "wszystkie");

  const karty = dane.kartyPracy.filter((k) => filtr === "wszystkie" || k.modul === filtr);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Karty pracy</h1>
      <p className="mt-1 text-sm text-ink/60">Wszystkie {dane.kartyPracy.length} kart w jednym miejscu.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltr("wszystkie")}
          className={`rounded-xl border px-3 py-2 text-sm ${filtr === "wszystkie" ? "border-accent bg-accent/20 font-medium" : "border-line"}`}
        >
          Wszystkie
        </button>
        {dane.moduly.map((m) => (
          <button
            key={m.nr}
            type="button"
            onClick={() => setFiltr(m.nr)}
            className={`rounded-xl border px-3 py-2 text-sm ${filtr === m.nr ? "border-accent bg-accent/20 font-medium" : "border-line"}`}
          >
            Moduł {m.nr}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {karty.map((k) => (
          <Link key={k.id} to={`/karta/${k.id}`} className="block rounded-2xl border border-line p-4 hover:bg-panel">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Moduł {k.modul}</p>
            <h2 className="mt-1 font-heading text-lg font-semibold">{k.tytul}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-ink/70">{k.wstep}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
