import { useMemo, useState } from "react";
import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji, Zabawa } from "../types";
import { useQueryParam } from "../router";
import { getZabawaStatus, setZabawaStatus } from "../lib/storage";
import { useAppState } from "../hooks/useAppState";

const dane = trescJson as TrescAplikacji;

function parsujWiekMin(wiek: string): number {
  const dopasowanie = wiek.match(/\d+/);
  return dopasowanie ? Number(dopasowanie[0]) : 0;
}
function parsujWiekMax(wiek: string): number {
  const liczby = wiek.match(/\d+/g);
  if (!liczby) return 130;
  return Number(liczby[liczby.length - 1]);
}
function parsujCzasMinuty(czas: string): number {
  const dopasowanie = czas.match(/\d+/);
  return dopasowanie ? Number(dopasowanie[0]) : 0;
}

const PROGI_CZASU = [
  { etykieta: "wszystkie", max: Infinity },
  { etykieta: "do 5 min", max: 5 },
  { etykieta: "do 10 min", max: 10 },
  { etykieta: "do 20 min", max: 20 },
  { etykieta: "do 30 min", max: 30 },
];

export function GamesPage() {
  useAppState();
  const modulZUrl = useQueryParam("modul");
  const [wiekDziecka, setWiekDziecka] = useState<string>("");
  const [progCzasu, setProgCzasu] = useState(0);
  const [modul, setModul] = useState<number | "wszystkie">(modulZUrl ? Number(modulZUrl) : "wszystkie");
  const [tylkoUlubione, setTylkoUlubione] = useState(false);

  const przefiltrowane = useMemo(() => {
    return dane.zabawy.filter((z: Zabawa) => {
      if (modul !== "wszystkie" && z.modul !== modul) return false;
      if (parsujCzasMinuty(z.czas) > PROGI_CZASU[progCzasu].max) return false;
      if (wiekDziecka.trim() !== "" && z.wiek !== "dorosły") {
        const wiek = Number(wiekDziecka);
        if (!Number.isNaN(wiek) && (wiek < parsujWiekMin(z.wiek) || wiek > parsujWiekMax(z.wiek))) return false;
      }
      if (tylkoUlubione && !getZabawaStatus(z.tytul).ulubione) return false;
      return true;
    });
  }, [modul, progCzasu, wiekDziecka, tylkoUlubione]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Zabawy</h1>
      <p className="mt-1 text-sm text-ink/60">{dane.zabawy.length} propozycji do wypróbowania z dzieckiem.</p>

      <div className="mt-4 space-y-3 rounded-2xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="wiek" className="mb-1 block text-xs font-medium text-ink/70">
              Wiek dziecka
            </label>
            <input
              id="wiek"
              type="number"
              min={0}
              max={18}
              placeholder="np. 5"
              className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-sm"
              value={wiekDziecka}
              onChange={(e) => setWiekDziecka(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="czas" className="mb-1 block text-xs font-medium text-ink/70">
              Czas trwania
            </label>
            <select id="czas" className="rounded-lg border border-line bg-bg px-3 py-2 text-sm" value={progCzasu} onChange={(e) => setProgCzasu(Number(e.target.value))}>
              {PROGI_CZASU.map((p, idx) => (
                <option key={p.etykieta} value={idx}>
                  {p.etykieta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="modul-filtr" className="mb-1 block text-xs font-medium text-ink/70">
              Moduł
            </label>
            <select
              id="modul-filtr"
              className="rounded-lg border border-line bg-bg px-3 py-2 text-sm"
              value={modul}
              onChange={(e) => setModul(e.target.value === "wszystkie" ? "wszystkie" : Number(e.target.value))}
            >
              <option value="wszystkie">wszystkie</option>
              {dane.moduly.map((m) => (
                <option key={m.nr} value={m.nr}>
                  Moduł {m.nr}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={tylkoUlubione} onChange={(e) => setTylkoUlubione(e.target.checked)} className="h-4 w-4" />
            tylko ulubione
          </label>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {przefiltrowane.map((z) => (
          <ZabawaCard key={z.tytul} zabawa={z} />
        ))}
        {przefiltrowane.length === 0 && <p className="text-sm text-ink/60">Żadna propozycja nie pasuje do wybranych filtrów.</p>}
      </div>
    </div>
  );
}

function ZabawaCard({ zabawa }: { zabawa: Zabawa }) {
  useAppState();
  const status = getZabawaStatus(zabawa.tytul);

  return (
    <div className="rounded-2xl border border-line p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">{zabawa.tytul}</h2>
        <button
          type="button"
          aria-label={status.ulubione ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          aria-pressed={!!status.ulubione}
          onClick={() => setZabawaStatus(zabawa.tytul, { ulubione: !status.ulubione })}
          className="shrink-0 text-xl"
        >
          {status.ulubione ? "★" : "☆"}
        </button>
      </div>
      <p className="mt-1 text-xs text-ink/60">
        wiek {zabawa.wiek} · {zabawa.czas} · {zabawa.materialy}
      </p>
      <p className="mt-3 text-sm leading-relaxed">
        <span className="font-medium">Jak: </span>
        {zabawa.jak}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        <span className="font-medium">Po co: </span>
        {zabawa.poco}
      </p>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!status.wyprobowane}
          onChange={(e) => setZabawaStatus(zabawa.tytul, { wyprobowane: e.target.checked })}
          className="h-4 w-4"
        />
        wypróbowane
      </label>
    </div>
  );
}
