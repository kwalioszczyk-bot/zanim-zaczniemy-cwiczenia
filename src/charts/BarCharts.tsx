import type { PunktWykresuBar } from "../types";

const AKCENT = "#a8927a";
const OSLABIA = "#a9a098";
const LINIA = "#d6ccc0";
const TEKST = "#24211d";

/** Wykres 1: poziome słupki rozchodzące się od zera, dodatnie w akcencie, ujemne w szarości. */
export function DivergingBarChart({ dane }: { dane: PunktWykresuBar[] }) {
  const maxAbs = Math.max(0.05, ...dane.map((d) => Math.abs(d.wartosc)));
  const rowH = 40;
  const width = 260;
  const height = dane.length * rowH;
  const midX = width / 2;
  const polDlugosc = width / 2 - 44;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-3">
      <div className="flex flex-col justify-between">
        {dane.map((d) => (
          <div key={d.etykieta} style={{ height: rowH }} className="flex items-center text-sm leading-tight">
            {d.etykieta}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
        <line x1={midX} y1={0} x2={midX} y2={height} stroke={LINIA} strokeWidth={1} />
        {dane.map((d, i) => {
          const dodatnia = d.wartosc >= 0;
          const barW = (Math.abs(d.wartosc) / maxAbs) * polDlugosc;
          const x = dodatnia ? midX : midX - barW;
          const y = i * rowH + rowH * 0.28;
          const barH = rowH * 0.44;
          return (
            <g key={d.etykieta}>
              <rect x={x} y={y} width={Math.max(barW, 1)} height={barH} rx={3} fill={dodatnia ? AKCENT : OSLABIA} />
              <text
                x={dodatnia ? x + barW + 6 : x - 6}
                y={y + barH / 2}
                dominantBaseline="middle"
                textAnchor={dodatnia ? "start" : "end"}
                fontSize="11"
                fill={TEKST}
              >
                {d.wartosc.toFixed(3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Wykres 2: poziome słupki z przedziałem ufności — cienka linia dolny–górny, kropka na wartości. */
export function IntervalBarChart({ dane }: { dane: PunktWykresuBar[] }) {
  const maxG = Math.max(...dane.map((d) => d.gorny ?? d.wartosc));
  const rowH = 44;
  const width = 260;
  const height = dane.length * rowH;
  const skaluj = (v: number) => (v / maxG) * (width - 24);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-3">
      <div className="flex flex-col justify-between">
        {dane.map((d) => (
          <div key={d.etykieta} style={{ height: rowH }} className="flex items-center text-sm leading-tight">
            {d.etykieta}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
        {dane.map((d, i) => {
          const y = i * rowH + rowH / 2;
          const x1 = skaluj(d.dolny ?? d.wartosc);
          const x2 = skaluj(d.gorny ?? d.wartosc);
          const xv = skaluj(d.wartosc);
          return (
            <g key={d.etykieta}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={LINIA} strokeWidth={3} strokeLinecap="round" />
              <circle cx={xv} cy={y} r={5} fill={AKCENT} />
              <text x={xv} y={y - 10} textAnchor="middle" fontSize="11" fill={TEKST}>
                {d.wartosc.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Wykres 3: pionowe słupki rosnące — wyższy słupek = większa zmiana. */
export function VerticalBarChart({ dane }: { dane: PunktWykresuBar[] }) {
  const max = Math.max(...dane.map((d) => d.wartosc));
  const barAreaHeight = 150;

  return (
    <div className="flex items-end gap-4">
      {dane.map((d) => {
        const barH = Math.max(4, Math.round((d.wartosc / max) * barAreaHeight));
        return (
          <div key={d.etykieta} className="flex flex-1 flex-col items-center">
            <span className="mb-1 text-xs font-medium">{d.wartosc.toFixed(2)}</span>
            <svg viewBox={`0 0 40 ${barAreaHeight}`} width="100%" height={barAreaHeight} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              <rect x={4} y={barAreaHeight - barH} width={32} height={barH} rx={4} fill={AKCENT} />
              <line x1={0} y1={barAreaHeight} x2={40} y2={barAreaHeight} stroke={LINIA} />
            </svg>
            <span className="mt-2 text-center text-xs leading-tight text-ink/70">{d.etykieta}</span>
          </div>
        );
      })}
    </div>
  );
}
