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
}: {
  liczniki: Record<string, number>;
  definicje: OpisLicznika[];
  zmiany?: Efekt;
}) {
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
