import { useMemo, useState } from "react";
import trescJson from "../data/tresc-aplikacji.json";
import type { PytanieOdpowiedz, TrescAplikacji } from "../types";
import { search } from "../lib/search";
import { addNotatkaPytania } from "../lib/storage";
import { InlineHelpHint } from "../components/InlineHelpHint";

const dane = trescJson as TrescAplikacji;
const KATEGORIE = Array.from(new Set(dane.pytaniaOdpowiedzi.map((qa) => qa.kategoria)));

export function QAPage() {
  const [zapytanie, setZapytanie] = useState("");
  const [kategoria, setKategoria] = useState<string | "wszystkie">("wszystkie");
  const [rozwiniete, setRozwiniete] = useState<Set<string>>(new Set());
  const [notatka, setNotatka] = useState("");
  const [zapisano, setZapisano] = useState(false);

  const wyniki = useMemo(() => {
    const poKategorii = kategoria === "wszystkie" ? dane.pytaniaOdpowiedzi : dane.pytaniaOdpowiedzi.filter((qa) => qa.kategoria === kategoria);
    return search(
      poKategorii.map((qa) => ({ item: qa, haystacks: [qa.pytanie, qa.odpowiedz, qa.kategoria] })),
      zapytanie
    );
  }, [zapytanie, kategoria]);

  const przelacz = (pytanie: string) => {
    const kopia = new Set(rozwiniete);
    if (kopia.has(pytanie)) kopia.delete(pytanie);
    else kopia.add(pytanie);
    setRozwiniete(kopia);
  };

  const zapiszNotatke = () => {
    if (!notatka.trim()) return;
    addNotatkaPytania(notatka.trim());
    setNotatka("");
    setZapisano(true);
    window.setTimeout(() => setZapisano(false), 2000);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Pytania i odpowiedzi</h1>

      <div className="mt-4 space-y-3">
        <input
          type="search"
          placeholder="Szukaj po słowach kluczowych…"
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          value={zapytanie}
          onChange={(e) => setZapytanie(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setKategoria("wszystkie")}
            className={`rounded-xl border px-3 py-2 text-sm ${kategoria === "wszystkie" ? "border-accent bg-accent/20 font-medium" : "border-line"}`}
          >
            wszystkie
          </button>
          {KATEGORIE.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategoria(k)}
              className={`rounded-xl border px-3 py-2 text-sm ${kategoria === k ? "border-accent bg-accent/20 font-medium" : "border-line"}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {wyniki.map((qa: PytanieOdpowiedz) => {
          const otwarte = rozwiniete.has(qa.pytanie);
          return (
            <div key={qa.pytanie} className="rounded-2xl border border-line">
              <button
                type="button"
                onClick={() => przelacz(qa.pytanie)}
                aria-expanded={otwarte}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <span>
                  <span className="mr-2 text-xs font-medium uppercase tracking-wide text-ink/50">{qa.kategoria}</span>
                  <span className="font-medium">{qa.pytanie}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-ink/50">
                  {otwarte ? "−" : "+"}
                </span>
              </button>
              {otwarte && <p className="border-t border-line px-4 py-4 text-sm leading-relaxed text-ink/90">{qa.odpowiedz}</p>}
            </div>
          );
        })}
      </div>

      {wyniki.length === 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <p className="text-base leading-relaxed">Nie mam na to gotowej odpowiedzi. Zapisz to pytanie i przynieś je na spotkanie.</p>
          <textarea
            rows={3}
            className="mt-3 w-full rounded-xl border border-line bg-bg px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Twoje pytanie…"
            value={notatka}
            onChange={(e) => setNotatka(e.target.value)}
          />
          <InlineHelpHint text={notatka} />
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={zapiszNotatke} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg">
              Zapisz pytanie
            </button>
            {zapisano && <span className="text-sm text-ink/60">zapisano lokalnie</span>}
          </div>
        </div>
      )}
    </div>
  );
}
