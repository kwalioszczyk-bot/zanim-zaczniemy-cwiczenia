export interface PunktRadaru {
  etykieta: string;
  praktyka: number; // 0–100
  waga: number; // 0–100
}

function podzielEtykiete(etykieta: string): string[] {
  if (etykieta.length <= 16) return [etykieta];
  const slowa = etykieta.split(" ");
  let linia1 = "";
  let linia2 = "";
  for (const slowo of slowa) {
    if (!linia2 && (linia1 + " " + slowo).trim().length <= etykieta.length / 2 + 3) {
      linia1 = (linia1 + " " + slowo).trim();
    } else {
      linia2 = (linia2 + " " + slowo).trim();
    }
  }
  return linia2 ? [linia1, linia2] : [linia1];
}

export function RadarChart({ dane }: { dane: PunktRadaru[] }) {
  const n = dane.length;
  const size = 360;
  const center = size / 2;
  const R = 108;
  const kat = (i: number) => -Math.PI / 2 + i * ((2 * Math.PI) / n);
  const punkt = (i: number, wartosc: number): [number, number] => {
    const r = (wartosc / 100) * R;
    const a = kat(i);
    return [center + r * Math.cos(a), center + r * Math.sin(a)];
  };

  const punktyPraktyka = dane.map((d, i) => punkt(i, d.praktyka).join(",")).join(" ");
  const punktyWaga = dane.map((d, i) => punkt(i, d.waga).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" role="img" aria-hidden="true">
      {[25, 50, 75, 100].map((poziom) => (
        <polygon
          key={poziom}
          points={dane.map((_, i) => punkt(i, poziom).join(",")).join(" ")}
          fill="none"
          stroke="#d6ccc0"
          strokeWidth={1}
        />
      ))}

      {dane.map((_, i) => {
        const [x, y] = punkt(i, 100);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#d6ccc0" strokeWidth={1} />;
      })}

      <polygon points={punktyWaga} fill="none" stroke="#8a8078" strokeWidth={2} strokeDasharray="4 3" />
      <polygon points={punktyPraktyka} fill="#a8927a" fillOpacity={0.35} stroke="#a8927a" strokeWidth={2} />

      {dane.map((d, i) => {
        const [x, y] = punkt(i, 122);
        const cos = Math.cos(kat(i));
        const kotwica = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const linie = podzielEtykiete(d.etykieta);
        return (
          <text key={d.etykieta} x={x} y={y} textAnchor={kotwica} fontSize="9.5" fill="#24211d">
            {linie.map((linia, li) => (
              <tspan key={li} x={x} dy={li === 0 ? (linie.length > 1 ? "-0.4em" : "0") : "1.1em"}>
                {linia}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}
