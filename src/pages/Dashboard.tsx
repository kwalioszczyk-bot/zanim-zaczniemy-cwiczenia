import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";
import { TileModule } from "../components/TileModule";
import { ProgressBar } from "../components/ProgressBar";
import { policzPostepCalosci } from "../lib/progress";
import { getSeriaDni, odnotujAktywnoscDnia } from "../lib/storage";
import { useAppState } from "../hooks/useAppState";
import { Link } from "../router";

const dane = trescJson as TrescAplikacji;

export function Dashboard() {
  useAppState();
  const seria = getSeriaDni();
  const calosc = policzPostepCalosci();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Pulpit</h1>

      <div className="mt-4 rounded-2xl border border-line bg-panel p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink/70">Twój postęp w programie</span>
          <span className="text-sm text-ink/70">{calosc.procent}%</span>
        </div>
        <ProgressBar procent={calosc.procent} />
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-heading text-lg font-semibold">Na dziś</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink/80">
          Dziesięć minut specjalnego czasu i choć jedna pochwała opisowa. Nie chodzi o perfekcję — chodzi o powtarzalność.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button type="button" onClick={odnotujAktywnoscDnia} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg">
            Dziś się udało
          </button>
          <span className="text-sm text-ink/70">
            {seria > 0 ? (
              <>
                Seria: <strong className="text-ink">{seria}</strong> {seria === 1 ? "dzień" : "dni"} z rzędu
              </>
            ) : (
              "Zacznij dzisiaj — od czegoś trzeba"
            )}
          </span>
        </div>
        <p className="mt-3 text-xs text-ink/50">To licznik informacyjny, nie ocena. Przerwa w serii nic nie kasuje z tego, czego się już nauczyłaś / nauczyłeś.</p>
      </section>

      <Link to="/co-dziala" className="mt-6 flex items-center justify-between rounded-2xl border border-line p-5 hover:bg-panel">
        <div>
          <h2 className="font-heading text-lg font-semibold">Co działa — i skąd to wiadomo</h2>
          <p className="mt-1 text-sm text-ink/60">Przegląd badań oraz Twoja praktyka na ich tle.</p>
        </div>
        <span aria-hidden="true" className="text-ink/50">
          →
        </span>
      </Link>

      <h2 className="mt-8 font-heading text-lg font-semibold">Moduły</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {dane.moduly.map((modul) => (
          <TileModule key={modul.nr} modul={modul} />
        ))}
      </div>
    </div>
  );
}
