/**
 * Tory liczników 0–10. Pokazują koszt decyzji, nie ich ocenę:
 * żadnych kolorów „dobrze/źle”, żadnych ocen, żadnych sum.
 */
import type { Efekt } from '@klebkowo/engine';

export interface OpisLicznika {
  id: string;
  nazwa: string;
  opis: string;
  min: number;
  max: number;
}

export function Tory({
  liczniki,
  definicje,
  zmiany,
  kompaktowe = false,
}: {
  liczniki: Record<string, number>;
  definicje: OpisLicznika[];
  zmiany?: Efekt;
  /** Wariant na pasek przy dolnej krawędzi ekranu stolika. */
  kompaktowe?: boolean;
}) {
  if (kompaktowe) return <ToryKompaktowe liczniki={liczniki} definicje={definicje} />;
  return (
    <div className="tory">
      {definicje.map((d) => {
        const wartosc = liczniki[d.id] ?? 0;
        const zmiana = zmiany?.[d.id as keyof Efekt];
        return (
          <div className="tor" key={d.id}>
            <span className="tor__nazwa" id={`tor-${d.id}`}>
              {d.nazwa}
            </span>
            <span className="tor__pola" aria-hidden="true">
              {Array.from({ length: d.max - d.min + 1 }, (_, i) => (
                <span
                  key={i}
                  className={`tor__pole${i < wartosc ? ` tor__pole--pelne tor__pole--pelne-${d.id}` : ''}`}
                />
              ))}
            </span>
            <span className="tor__wartosc">
              <span className="tylko-dla-czytnika">{d.nazwa}: </span>
              {wartosc}
              <span className="tylko-dla-czytnika"> na {d.max}</span>
              {typeof zmiana === 'number' && zmiana !== 0 && (
                <span className="tor__zmiana">
                  {' '}
                  ({zmiana > 0 ? '+' : '−'}
                  {Math.abs(zmiana)})
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Cztery liczniki w jednym pasku — mieszczą się na telefonie i nie zasłaniają treści. */
function ToryKompaktowe({ liczniki, definicje }: { liczniki: Record<string, number>; definicje: OpisLicznika[] }) {
  return (
    <div className="tory-kompakt">
      {definicje.map((d) => {
        const wartosc = liczniki[d.id] ?? 0;
        return (
          <div className="kompakt" key={d.id}>
            <span className="kompakt__nazwa">{d.nazwa}</span>
            <span className="kompakt__dol">
              <span className="kompakt__pasek" aria-hidden="true">
                <span
                  className={`kompakt__wypelnienie kompakt__wypelnienie--${d.id}`}
                  style={{ width: `${(wartosc / (d.max || 10)) * 100}%` }}
                />
              </span>
              <span className="kompakt__wartosc">
                {wartosc}
                <span className="tylko-dla-czytnika"> na {d.max}</span>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
