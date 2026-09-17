/** Podgląd materiałów do druku i instrukcja, jak je wydrukować. */
import { useEffect, useMemo, useState } from 'react';
import type { Tresc } from '@klebkowo/engine';
import { Chmurka, Karteczka, Komunikat, Przycisk } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { idz } from '../lib/router.ts';
import { wczytajPelnaTresc } from '../lib/lokalnaGra.ts';

type Arkusz = typeof import('@klebkowo/print').ARKUSZE[number];

export function AplikacjaDruku({ arkusz }: { arkusz: string }) {
  const [tresc, ustawTresc] = useState<Tresc | null>(null);
  const [arkusze, ustawArkusze] = useState<Arkusz[] | null>(null);
  const [blad, ustawBlad] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([wczytajPelnaTresc(), import('@klebkowo/print')])
      .then(([t, modul]) => {
        ustawTresc(t);
        ustawArkusze(modul.ARKUSZE);
      })
      .catch((b: Error) => ustawBlad(b.message));
  }, []);

  const wybrany = useMemo(() => arkusze?.find((a) => a.plik === arkusz) ?? null, [arkusze, arkusz]);
  const html = useMemo(() => (wybrany && tresc ? wybrany.zbuduj(tresc, '/fonts') : ''), [wybrany, tresc]);

  if (blad)
    return (
      <main className="uklad">
        <Karteczka tytul="Nie mogę złożyć materiałów" doodle="megafon">
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{blad}</pre>
        </Karteczka>
      </main>
    );
  if (!arkusze || !tresc)
    return (
      <main className="uklad">
        <p>Składam materiały…</p>
      </main>
    );

  if (wybrany)
    return (
      <main className="uklad uklad--szeroki">
        <div className="pasek">
          <div>
            <h1 className="pasek__tytul" style={{ color: 'inherit', textShadow: 'none' }}>
              {wybrany.tytul}
            </h1>
            <p className="pasek__opis">{wybrany.plik}.pdf</p>
          </div>
          <div className="przyciski">
            <Przycisk wariant="spokojny" onClick={() => idz('/druk')}>
              ← Wszystkie arkusze
            </Przycisk>
            <Przycisk
              wariant="glowny"
              onClick={() => {
                const ramka = document.getElementById('podglad') as HTMLIFrameElement | null;
                ramka?.contentWindow?.focus();
                ramka?.contentWindow?.print();
              }}
              doodle="kartka"
            >
              Drukuj ten arkusz
            </Przycisk>
          </div>
        </div>
        {wybrany.tylkoDlaProwadzacej && (
          <Komunikat wariant="uwaga" doodle="megafon">
            Ten arkusz jest wyłącznie dla prowadzącej. Nie zostawiaj go na stolikach.
          </Komunikat>
        )}
        <iframe
          id="podglad"
          title={`Podgląd arkusza: ${wybrany.tytul}`}
          srcDoc={html}
          style={{
            width: '100%',
            height: '80vh',
            border: '2.5px solid #232323',
            borderRadius: '10px',
            background: '#fff',
          }}
        />
      </main>
    );

  return (
    <main className="uklad uklad--szeroki">
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Doodle nazwa="kartka" rozmiar={80} kolor="#f07a2b" />
        <h1>Materiały do druku</h1>
        <p style={{ fontFamily: "'Patrick Hand', cursive", fontSize: '1.15rem' }}>
          Gra papierowa jest pełnoprawna — aplikacja nie jest do niej potrzebna.
        </p>
      </header>

      <Chmurka wariant="zielen">
        Komplet PDF-ów powstaje poleceniem <strong>npm run druk</strong> i trafia do folderu <strong>druk/</strong>.
        Tutaj możesz obejrzeć i wydrukować pojedynczy arkusz prosto z przeglądarki.
      </Chmurka>

      <div className="siatka siatka--2">
        {arkusze.map((a) => (
          <button
            key={a.plik}
            type="button"
            className="karteczka karteczka--2"
            style={{ margin: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit', width: '100%' }}
            onClick={() => idz(`/druk/${a.plik}`)}
          >
            <h2 className="karteczka__naglowek">
              <Doodle nazwa={a.tylkoDlaProwadzacej ? 'koperta' : 'kartka'} rozmiar={30} />
              <span>{a.tytul}</span>
              {a.tylkoDlaProwadzacej && <span className="karteczka__etykieta">tylko prowadząca</span>}
            </h2>
            <p>{a.opis}</p>
            <p className="pole__podpowiedz">{a.plik}.pdf{a.poziomo ? ' · orientacja pozioma' : ''}</p>
          </button>
        ))}
      </div>

      <Karteczka tytul="Ile kompletów przygotować" doodle="ludzie" wariant="bez" ksztalt={3}>
        <ul className="fakty">
          <li><span>Plansza: po jednej na stolik (A3 albo dwa A4 sklejone).</span></li>
          <li><span>Karty ról, akcji, druki decyzji i zobowiązań: po jednym komplecie na stolik.</span></li>
          <li><span>Karty informacji: osobno na rundę 1 i rundę 3, w kopertach opisanych rolą.</span></li>
          <li><span>Koperty od przełożonych: pięć na stolik, z etykietą „Otworzyć w rundzie 2”.</span></li>
          <li><span>Karty zdarzeń, skutków i arkusz śledzenia: jeden komplet u prowadzącej.</span></li>
        </ul>
      </Karteczka>
    </main>
  );
}
