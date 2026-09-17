/** Zegar fazy. Odlicza czas przewidziany w strukturze rundy; po czasie nie blokuje gry. */
import { useEffect, useState } from 'react';

function format(sekundy: number): string {
  const znak = sekundy < 0 ? '−' : '';
  const s = Math.abs(sekundy);
  return `${znak}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function Zegar({
  sekundyOd,
  minuty,
  dziala,
  duzy = false,
}: {
  sekundyOd: number;
  minuty: number;
  dziala: boolean;
  duzy?: boolean;
}) {
  const [teraz, ustawTeraz] = useState(() => Date.now());
  const [start] = useState(() => Date.now());

  useEffect(() => {
    if (!dziala) return;
    const id = setInterval(() => ustawTeraz(Date.now()), 1000);
    return () => clearInterval(id);
  }, [dziala, sekundyOd]);

  const uplynelo = sekundyOd + (dziala ? Math.floor((teraz - start) / 1000) : 0);
  const pozostalo = minuty * 60 - uplynelo;
  const poCzasie = pozostalo < 0;

  return (
    <span
      className={`zegar ${duzy ? 'zegar--duzy' : 'zegar--maly'}${poCzasie ? ' zegar--koniec' : ''}`}
      role="timer"
      aria-live="off"
    >
      <span className="tylko-dla-czytnika">
        {poCzasie ? 'Czas fazy przekroczony o ' : 'Do końca fazy pozostało '}
      </span>
      {format(pozostalo)}
    </span>
  );
}
