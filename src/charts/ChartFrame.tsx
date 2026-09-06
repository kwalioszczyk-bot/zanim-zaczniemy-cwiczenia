import { useState, type ReactNode } from "react";

interface Props {
  tytul: string;
  podtytul: string;
  jednostka?: string;
  chart: ReactNode;
  tableHeaders: string[];
  tableRows: (string | number)[][];
  wniosek: string;
  zrodlo: string;
}

/** Wspólna ramka dla wykresów Warstwy A: nagłówek, przełącznik wykres/tabela, wniosek, źródło. */
export function ChartFrame({ tytul, podtytul, jednostka, chart, tableHeaders, tableRows, wniosek, zrodlo }: Props) {
  const [jakoTabela, setJakoTabela] = useState(false);

  return (
    <section className="rounded-2xl border border-line p-5 print-page break-inside-avoid">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold">{tytul}</h3>
          <p className="mt-1 text-sm text-ink/60">{podtytul}</p>
        </div>
        <button
          type="button"
          onClick={() => setJakoTabela((v) => !v)}
          className="no-print shrink-0 rounded-xl border border-line px-3 py-2 text-xs font-medium hover:bg-panel"
          aria-pressed={jakoTabela}
        >
          {jakoTabela ? "Pokaż wykres" : "Pokaż jako tabelę"}
        </button>
      </div>

      <div className="mt-4">
        {jakoTabela ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink/60">
                  {tableHeaders.map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-line/60">
                    {row.map((cell, i) => (
                      <td key={i} className="py-2 pr-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {jednostka && <p className="mt-2 text-xs text-ink/50">Jednostka: {jednostka}</p>}
          </div>
        ) : (
          <div className="print:hidden">{chart}</div>
        )}
        {/* Tabela jest zawsze dołączona do wydruku — SVG bywa nieczytelne na papierze bez koloru. */}
        {!jakoTabela && (
          <div className="hidden print:block">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink/60">
                  {tableHeaders.map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-line/60">
                    {row.map((cell, i) => (
                      <td key={i} className="py-2 pr-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-base leading-relaxed">{wniosek}</p>
      <p className="mt-2 text-xs text-ink/50">Źródło: {zrodlo}</p>
    </section>
  );
}
