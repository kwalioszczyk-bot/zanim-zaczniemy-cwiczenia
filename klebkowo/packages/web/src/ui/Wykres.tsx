/**
 * Wykres kosztów — SVG rysowane w projekcie, bez bibliotek zewnętrznych.
 * Każda seria ma własny kolor ORAZ własny kształt znacznika, a pod wykresem
 * zawsze stoi tabela z danymi dla czytnika ekranu.
 */
import { useId } from 'react';
import type { DaneWykresu } from '@klebkowo/engine';

const BARWY: Record<string, string> = {
  czas: '#2f6f86',
  obciazenie: '#c85c15',
  zaufanie: '#4e7a17',
  zasieg: '#8a5a12',
};

type Ksztalt = 'kolo' | 'kwadrat' | 'romb' | 'trojkat';
const KSZTALTY: Record<string, Ksztalt> = {
  czas: 'kolo',
  obciazenie: 'kwadrat',
  zaufanie: 'romb',
  zasieg: 'trojkat',
};

function Znacznik({ x, y, ksztalt, kolor }: { x: number; y: number; ksztalt: Ksztalt; kolor: string }) {
  const r = 5;
  if (ksztalt === 'kolo') return <circle cx={x} cy={y} r={r} fill={kolor} stroke="#232323" strokeWidth={1.5} />;
  if (ksztalt === 'kwadrat')
    return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill={kolor} stroke="#232323" strokeWidth={1.5} />;
  if (ksztalt === 'romb')
    return (
      <polygon
        points={`${x},${y - r - 1} ${x + r + 1},${y} ${x},${y + r + 1} ${x - r - 1},${y}`}
        fill={kolor}
        stroke="#232323"
        strokeWidth={1.5}
      />
    );
  return (
    <polygon
      points={`${x},${y - r - 1} ${x + r + 1},${y + r} ${x - r - 1},${y + r}`}
      fill={kolor}
      stroke="#232323"
      strokeWidth={1.5}
    />
  );
}

export function Wykres({ dane, tytul, wysokosc = 260 }: { dane: DaneWykresu; tytul: string; wysokosc?: number }) {
  const idOpisu = useId();
  if (!dane.etykiety.length) return null;

  const szer = 620;
  const wys = wysokosc;
  const margL = 44;
  const margR = 16;
  const margG = 16;
  const margD = 38;
  const w = szer - margL - margR;
  const h = wys - margG - margD;
  const maks = Math.max(10, dane.max);
  const x = (i: number) => margL + (dane.etykiety.length === 1 ? w / 2 : (i * w) / (dane.etykiety.length - 1));
  const y = (v: number) => margG + h - (v / maks) * h;

  return (
    <figure style={{ margin: '0.5rem 0 0' }}>
      <svg
        viewBox={`0 0 ${szer} ${wys}`}
        width="100%"
        role="img"
        aria-labelledby={idOpisu}
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <title id={idOpisu}>{`${tytul}. ${dane.opis}`}</title>
        {/* siatka pozioma co 2 punkty */}
        {Array.from({ length: Math.floor(maks / 2) + 1 }, (_, i) => i * 2).map((v) => (
          <g key={v}>
            <line x1={margL} y1={y(v)} x2={szer - margR} y2={y(v)} stroke="#e6e0d4" strokeWidth={2} />
            <text x={margL - 8} y={y(v) + 5} textAnchor="end" fontSize="13" fill="#4a463f" fontFamily="Carlito, sans-serif">
              {v}
            </text>
          </g>
        ))}
        {/* osie */}
        <line x1={margL} y1={margG} x2={margL} y2={margG + h} stroke="#232323" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={margL} y1={margG + h} x2={szer - margR} y2={margG + h} stroke="#232323" strokeWidth={2.5} strokeLinecap="round" />
        {dane.etykiety.map((e, i) => (
          <text key={e + i} x={x(i)} y={wys - 14} textAnchor="middle" fontSize="15" fill="#232323" fontFamily="'Patrick Hand', cursive">
            {e}
          </text>
        ))}
        {dane.serie.map((s) => {
          const kolor = BARWY[s.licznik] ?? '#232323';
          const sciezka = s.wartosci.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
          return (
            <g key={s.licznik}>
              <path d={sciezka} fill="none" stroke={kolor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              {s.wartosci.map((v, i) => (
                <Znacznik key={i} x={x(i)} y={y(v)} ksztalt={KSZTALTY[s.licznik] ?? 'kolo'} kolor={kolor} />
              ))}
            </g>
          );
        })}
      </svg>

      <figcaption>
        <ul className="fakty" style={{ gridAutoFlow: 'column', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', marginTop: '0.4rem' }}>
          {dane.serie.map((s) => (
            <li key={s.licznik} style={{ alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: '0 0 auto' }}>
                <Znacznik x={10} y={10} ksztalt={KSZTALTY[s.licznik] ?? 'kolo'} kolor={BARWY[s.licznik] ?? '#232323'} />
              </svg>
              <span style={{ fontFamily: "'Patrick Hand', cursive" }}>{s.nazwa}</span>
            </li>
          ))}
        </ul>

        <details className="szczegoly">
          <summary>Te same dane w tabeli</summary>
          <table className="tabela-danych">
            <caption className="tylko-dla-czytnika">{tytul}</caption>
            <thead>
              <tr>
                <th scope="col">Licznik</th>
                {dane.etykiety.map((e, i) => (
                  <th scope="col" key={e + i}>
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dane.serie.map((s) => (
                <tr key={s.licznik}>
                  <th scope="row">{s.nazwa}</th>
                  {s.wartosci.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figcaption>
    </figure>
  );
}
