import trescJson from "../data/tresc-aplikacji.json";
import type { TrescAplikacji } from "../types";
import { useAppState } from "../hooks/useAppState";
import { exportStateJSON, removeNotatkaPytania } from "../lib/storage";
import { downloadTextFile, dzisiajDoNazwyPliku } from "../lib/files";
import { podsumujKarte } from "../lib/summarize";

const dane = trescJson as TrescAplikacji;

function czyWpisPusty(w: unknown): boolean {
  if (w == null) return true;
  if (Array.isArray(w)) return w.length === 0;
  if (typeof w === "object") return Object.keys(w as object).length === 0;
  return false;
}

export function MyEntriesPage() {
  const state = useAppState();
  const wypelnioneKarty = dane.kartyPracy.filter((k) => !czyWpisPusty(state.wpisyKart[k.id]));
  const ulubioneZabawy = dane.zabawy.filter((z) => state.zabawy[z.tytul]?.ulubione);
  const wyprobowaneZabawy = dane.zabawy.filter((z) => state.zabawy[z.tytul]?.wyprobowane);
  const ukonczoneQuizy = dane.quizy.filter((q) => state.ukonczoneQuizy[q.modul]);

  const pobierzJSON = () => downloadTextFile(`moje-wpisy-${dzisiajDoNazwyPliku()}.json`, exportStateJSON());

  return (
    <div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Moje wpisy</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium">
            Eksportuj do PDF
          </button>
          <button type="button" onClick={pobierzJSON} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium">
            Pobierz kopię JSON
          </button>
        </div>
      </div>

      <h1 className="hidden print:block font-heading text-2xl font-semibold mb-2">Moje wpisy — {dane.meta.program}</h1>

      {wypelnioneKarty.length === 0 && <p className="mt-6 text-sm text-ink/60">Nie masz jeszcze żadnych wypełnionych kart pracy.</p>}

      <div className="mt-6 space-y-8">
        {wypelnioneKarty.map((karta) => {
          const wiersze = podsumujKarte(karta, state.wpisyKart[karta.id]);
          return (
            <section key={karta.id} className="rounded-2xl border border-line p-5 print-page break-inside-avoid">
              <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Moduł {karta.modul}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold">{karta.tytul}</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {wiersze.map((w, idx) => (
                  <div key={idx}>
                    <dt className="font-medium text-ink/80">{w.etykieta}</dt>
                    <dd className="text-ink/90">{w.wartosc}</dd>
                  </div>
                ))}
              </dl>
              <a href={`#/karta/${karta.id}`} className="no-print mt-4 inline-block text-sm font-medium text-accent underline">
                Otwórz i edytuj →
              </a>
            </section>
          );
        })}
      </div>

      {ukonczoneQuizy.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold">Ukończone quizy</h2>
          <p className="mt-2 text-sm text-ink/70">Moduły: {ukonczoneQuizy.map((q) => q.modul).join(", ")}</p>
        </section>
      )}

      {(wyprobowaneZabawy.length > 0 || ulubioneZabawy.length > 0) && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold">Zabawy</h2>
          {wyprobowaneZabawy.length > 0 && (
            <p className="mt-2 text-sm text-ink/70">Wypróbowane: {wyprobowaneZabawy.map((z) => z.tytul).join(", ")}</p>
          )}
          {ulubioneZabawy.length > 0 && <p className="mt-2 text-sm text-ink/70">Ulubione: {ulubioneZabawy.map((z) => z.tytul).join(", ")}</p>}
        </section>
      )}

      {state.notatkiPytan.length > 0 && (
        <section className="no-print mt-8">
          <h2 className="font-heading text-lg font-semibold">Zapisane pytania</h2>
          <ul className="mt-3 space-y-3">
            {state.notatkiPytan.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 rounded-2xl border border-line p-4">
                <div>
                  <p className="text-sm">{n.tresc}</p>
                  <p className="mt-1 text-xs text-ink/50">{new Date(n.data).toLocaleDateString("pl-PL")}</p>
                </div>
                <button type="button" onClick={() => removeNotatkaPytania(n.id)} className="shrink-0 text-sm text-ink/60 underline">
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
