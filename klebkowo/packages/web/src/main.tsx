/**
 * Paczka prowadzącej: rozdroże, widok prowadzącej, ekran sali, omówienie, druk, tryb projektora.
 * Urządzenia stolików korzystają z osobnej paczki (`stolik.html`).
 */
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styl/podstawy.css';
import './styl/elementy.css';
import './styl/druk.css';
import { dopasuj, useSciezka } from './lib/router.ts';
import { Rozdroze } from './Rozdroze.tsx';
import { AplikacjaProwadzacej } from './prowadzaca/Aplikacja.tsx';
import { AplikacjaEkranu } from './ekran/Aplikacja.tsx';
import { AplikacjaOmowienia } from './omowienie/Aplikacja.tsx';
import { wlaczTrybOffline } from './lib/offline.ts';

// tryb projektora i materiały do druku ładują pełną treść gry — osobne paczki, ładowane na żądanie
const AplikacjaProjektora = lazy(() =>
  import('./projektor/Aplikacja.tsx').then((m) => ({ default: m.AplikacjaProjektora })),
);
const AplikacjaDruku = lazy(() => import('./druk/Aplikacja.tsx').then((m) => ({ default: m.AplikacjaDruku })));

function Wczytywanie() {
  return (
    <main className="uklad">
      <p style={{ fontFamily: "'Patrick Hand', cursive", fontSize: '1.2rem' }}>Wczytuję…</p>
    </main>
  );
}

function Aplikacja() {
  const sciezka = useSciezka();

  const ekran = dopasuj('/ekran/:id', sciezka);
  if (ekran?.id) return <AplikacjaEkranu idSesji={ekran.id} />;

  const druk = dopasuj('/druk/:arkusz', sciezka);
  if (druk?.arkusz)
    return (
      <Suspense fallback={<Wczytywanie />}>
        <AplikacjaDruku arkusz={druk.arkusz} />
      </Suspense>
    );

  switch (sciezka) {
    case '/prowadzaca':
      return <AplikacjaProwadzacej />;
    case '/omowienie':
      return <AplikacjaOmowienia />;
    case '/ekran':
      return <AplikacjaEkranu idSesji="" />;
    case '/projektor':
      return (
        <Suspense fallback={<Wczytywanie />}>
          <AplikacjaProjektora />
        </Suspense>
      );
    case '/druk':
      return (
        <Suspense fallback={<Wczytywanie />}>
          <AplikacjaDruku arkusz="" />
        </Suspense>
      );
    default:
      return <Rozdroze />;
  }
}

wlaczTrybOffline();

createRoot(document.getElementById('korzen')!).render(
  <StrictMode>
    <Aplikacja />
  </StrictMode>,
);
