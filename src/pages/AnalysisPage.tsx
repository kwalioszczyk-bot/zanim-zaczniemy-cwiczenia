import { useState } from "react";
import trescJson from "../data/tresc-aplikacji.json";
import analizaJson from "../data/analiza-skutecznosci.json";
import type { AnalizaSkutecznosci, TrescAplikacji } from "../types";
import { ChartFrame } from "../charts/ChartFrame";
import { DivergingBarChart, IntervalBarChart, VerticalBarChart } from "../charts/BarCharts";
import { RadarChart, type PunktRadaru } from "../charts/RadarChart";
import { policzWynikiObszarow, wybierzKomunikat } from "../lib/practiceAnalysis";
import { useAppState } from "../hooks/useAppState";
import { Link } from "../router";

const dane = trescJson as TrescAplikacji;
const analiza = analizaJson as AnalizaSkutecznosci;

export function AnalysisPage() {
  const state = useAppState();
  const [jakCzytacOtwarte, setJakCzytacOtwarte] = useState(false);
  const [warstwaBJakoLista, setWarstwaBJakoLista] = useState(false);

  const wyniki = policzWynikiObszarow(analiza.obszaryPraktyki, dane.kartyPracy, state.wpisyKart);
  const komunikat = wybierzKomunikat(wyniki, analiza.komunikatyZwrotne);

  const daneRadaru: PunktRadaru[] = wyniki.map((w) => ({
    etykieta: w.obszar.nazwa,
    praktyka: w.aktywnoscNorm,
    waga: w.wagaNorm,
  }));

  const pierwszaKartaLuki = komunikat.typ === "luka" ? komunikat.obszar?.zrodlaWpisow[0] : undefined;

  return (
    <div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Co działa</h1>
        <button type="button" onClick={() => window.print()} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium">
          Eksportuj do PDF
        </button>
      </div>
      <p className="mt-1 text-sm text-ink/60">{analiza.meta.opis}</p>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
        <button
          type="button"
          onClick={() => setJakCzytacOtwarte((v) => !v)}
          aria-expanded={jakCzytacOtwarte}
          className="flex w-full items-center justify-between gap-3 text-left font-heading text-base font-semibold"
        >
          Jak czytać te liczby
          <span aria-hidden="true">{jakCzytacOtwarte ? "−" : "+"}</span>
        </button>
        {jakCzytacOtwarte && (
          <div className="mt-3 space-y-3 text-sm leading-relaxed">
            <p>{analiza.jakCzytac.wielkoscEfektu}</p>
            <p>{analiza.jakCzytac.wagaRegresji}</p>
            <p className="rounded-xl border border-accent/40 bg-bg px-4 py-3 font-medium">{analiza.jakCzytac.ostrzezenie}</p>
          </div>
        )}
      </div>

      <h2 className="mt-8 font-heading text-xl font-semibold">Co mówią badania</h2>
      <div className="mt-4 space-y-6">
        <ChartFrame
          tytul={analiza.wykres1_komponenty.tytul}
          podtytul={analiza.wykres1_komponenty.podtytul}
          jednostka={analiza.wykres1_komponenty.jednostka}
          chart={<DivergingBarChart dane={analiza.wykres1_komponenty.dane} />}
          tableHeaders={["Element", "Waga regresji"]}
          tableRows={analiza.wykres1_komponenty.dane.map((d) => [d.etykieta, d.wartosc.toFixed(3)])}
          wniosek={analiza.wykres1_komponenty.wniosek}
          zrodlo={analiza.wykres1_komponenty.zrodlo}
        />

        <ChartFrame
          tytul={analiza.wykres2_techniki.tytul}
          podtytul={analiza.wykres2_techniki.podtytul}
          jednostka={analiza.wykres2_techniki.jednostka}
          chart={<IntervalBarChart dane={analiza.wykres2_techniki.dane} />}
          tableHeaders={["Technika", "β", "Przedział"]}
          tableRows={analiza.wykres2_techniki.dane.map((d) => [d.etykieta, d.wartosc.toFixed(2), `${d.dolny?.toFixed(2)} – ${d.gorny?.toFixed(2)}`])}
          wniosek={analiza.wykres2_techniki.wniosek}
          zrodlo={analiza.wykres2_techniki.zrodlo}
        />

        <ChartFrame
          tytul={analiza.wykres3_poziomy.tytul}
          podtytul={analiza.wykres3_poziomy.podtytul}
          jednostka={analiza.wykres3_poziomy.jednostka}
          chart={<VerticalBarChart dane={analiza.wykres3_poziomy.dane} />}
          tableHeaders={["Grupa", "Wielkość efektu d"]}
          tableRows={analiza.wykres3_poziomy.dane.map((d) => [d.etykieta, d.wartosc.toFixed(2)])}
          wniosek={analiza.wykres3_poziomy.wniosek}
          zrodlo={analiza.wykres3_poziomy.zrodlo}
        />

        <section className="rounded-2xl border border-line p-5 print-page break-inside-avoid">
          <h3 className="font-heading text-lg font-semibold">{analiza.wykres4_kontekst.tytul}</h3>
          <p className="mt-1 text-sm text-ink/60">{analiza.wykres4_kontekst.podtytul}</p>
          <ul className="mt-4 divide-y divide-line">
            {analiza.wykres4_kontekst.dane.map((w) => (
              <li key={w.etykieta} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span>{w.etykieta}</span>
                <span className={w.wynik === "bez różnicy" ? "text-ink/60" : "font-medium text-accent"}>{w.wynik}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base leading-relaxed">{analiza.wykres4_kontekst.wniosek}</p>
          <p className="mt-2 text-xs text-ink/50">Źródło: {analiza.wykres4_kontekst.zrodlo}</p>
        </section>

        <section className="rounded-2xl border border-line bg-panel p-5 print-page break-inside-avoid">
          <h3 className="font-heading text-lg font-semibold">{analiza.wykres5_trwalosc.tytul}</h3>
          <p className="mt-1 text-sm text-ink/60">{analiza.wykres5_trwalosc.podtytul}</p>
          <p className="mt-4 text-base font-medium leading-relaxed">{analiza.wykres5_trwalosc.trescGlowna}</p>
          <p className="mt-3 text-base leading-relaxed">{analiza.wykres5_trwalosc.wniosek}</p>
          <p className="mt-2 text-xs text-ink/50">Źródło: {analiza.wykres5_trwalosc.zrodlo}</p>
        </section>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-ink/70">{analiza.notaKoncowa}</p>

      <h2 className="mt-10 font-heading text-xl font-semibold">Twoja praktyka na tle badań</h2>
      <div className="mt-4 rounded-2xl border border-line p-5 print-page break-inside-avoid">
        <div className="no-print flex items-center justify-end">
          <button
            type="button"
            onClick={() => setWarstwaBJakoLista((v) => !v)}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium hover:bg-panel"
            aria-pressed={warstwaBJakoLista}
          >
            {warstwaBJakoLista ? "Pokaż wykres" : "Pokaż jako listę"}
          </button>
        </div>

        {warstwaBJakoLista ? (
          <ul className="mt-4 divide-y divide-line">
            {wyniki.map((w) => (
              <li key={w.obszar.id} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span>{w.obszar.nazwa}</span>
                  <span className="text-ink/60">Twoja aktywność: {w.aktywnoscNorm}/100</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 print:hidden">
            <RadarChart dane={daneRadaru} />
          </div>
        )}
        {!warstwaBJakoLista && (
          <div className="hidden print:block">
            <ul className="mt-4 divide-y divide-line">
              {wyniki.map((w) => (
                <li key={w.obszar.id} className="py-2.5 text-sm">
                  {w.obszar.nazwa} — Twoja aktywność: {w.aktywnoscNorm}/100
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink/60">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-accent/60" aria-hidden="true" />
            wypełniony obszar — Twoja praktyka
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-[#8a8078]" aria-hidden="true" />
            cienki obrys — waga w badaniach
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-relaxed">
          {komunikat.tresc}
          {komunikat.obszar && pierwszaKartaLuki && (
            <>
              {" "}
              <Link to={`/karta/${pierwszaKartaLuki}`} className="font-medium text-accent underline">
                Zobacz kartę: {komunikat.obszar.nazwa} →
              </Link>
            </>
          )}
        </div>

        <p className="mt-4 text-sm font-medium leading-relaxed">
          To obraz Twoich zapisków, nie Twojego rodzicielstwa. Bardzo dużo dobrego dzieje się w domu i nigdy nie trafia do żadnej karty.
        </p>
      </div>
    </div>
  );
}
