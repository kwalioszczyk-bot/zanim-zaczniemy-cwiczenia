/** Karty pokazywane stolikowi: zdarzenie, akcja, skutek, zobowiązanie. */
import { Doodle } from '../ui/Doodle.tsx';
import { Karteczka } from '../ui/podstawowe.tsx';
import type { OpisLicznika } from '../ui/Tory.tsx';

/** Opis zmian liczników — zawsze słowami, nigdy samym kolorem. */
export function Zmiany({ zmiany, definicje }: { zmiany: Record<string, number>; definicje: OpisLicznika[] }) {
  const wpisy = Object.entries(zmiany).filter(([, d]) => d !== 0);
  if (!wpisy.length)
    return (
      <p className="znacznik-ochrony" style={{ marginTop: '0.5rem' }}>
        <Doodle nazwa="gwiazdka" rozmiar={16} /> Liczniki bez zmian
      </p>
    );
  return (
    <ul className="fakty" style={{ marginTop: '0.6rem' }}>
      {wpisy.map(([id, delta]) => {
        const nazwa = definicje.find((d) => d.id === id)?.nazwa ?? id;
        return (
          <li key={id}>
            <strong>
              {nazwa} {delta > 0 ? '+' : '−'}
              {Math.abs(delta)}
            </strong>
          </li>
        );
      })}
    </ul>
  );
}

export function KartaZdarzenia({
  tytul,
  tekst,
  zmiany,
  komentarz,
  ochrona,
  wybor,
  definicje,
}: {
  tytul: string;
  tekst: string;
  zmiany: Record<string, number>;
  komentarz?: string;
  ochrona?: string;
  wybor?: string;
  definicje: OpisLicznika[];
}) {
  return (
    <Karteczka tytul={tytul} etykieta="Zdarzenie" doodle="chmurka" wariant="blekit" ksztalt={2}>
      <p style={{ fontSize: '1.1rem' }}>{tekst}</p>
      {wybor && (
        <p className="pole__podpowiedz">
          Wasza reakcja: <strong>{wybor}</strong>
        </p>
      )}
      {komentarz && (
        <p className="znacznik-ochrony" style={{ marginTop: '0.5rem' }}>
          <Doodle nazwa="gwiazdka" rozmiar={16} />
          {komentarz}
        </p>
      )}
      {ochrona && ochrona !== 'warunek' && (
        <p className="pole__podpowiedz">Zadziałało wcześniejsze działanie {ochrona}.</p>
      )}
      <Zmiany zmiany={zmiany} definicje={definicje} />
    </Karteczka>
  );
}

export function KartaSkutku({
  tytul,
  tekst,
  zmiany,
  zlagodzony,
  definicje,
}: {
  tytul: string;
  tekst: string;
  zmiany: Record<string, number>;
  zlagodzony: boolean;
  definicje: OpisLicznika[];
}) {
  return (
    <Karteczka tytul={tytul} etykieta="Skutek decyzji" doodle="strzalka" wariant="brzoskwinia" ksztalt={3} tasma>
      <p style={{ fontSize: '1.1rem' }}>{tekst}</p>
      {zlagodzony && <p className="pole__podpowiedz">Plan awaryjny złagodził skutek.</p>}
      <Zmiany zmiany={zmiany} definicje={definicje} />
    </Karteczka>
  );
}
