/**
 * Paczka prowadzącej: rozdroże, widok prowadzącej, ekran sali, omówienie, druk, tryb projektora.
 * Urządzenia stolików korzystają z osobnej paczki (`stolik.html`).
 */
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styl/podstawy.css';
import './styl/elementy.css';
import './styl/druk.css';
import { adres, dopasuj, useSciezka } from './lib/router.ts';
import { POKAZ } from './lib/tryb.ts';
import { Rozdroze } from './Rozdroze.tsx';
import { Karteczka } from './ui/podstawowe.tsx';
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

/**
 * W trybie pokazu (aplikacja otwarta bez własnego serwera) widoki wymagające sesji
 * nie mają skąd wziąć danych. Zamiast pokazywać błąd połączenia, mówimy wprost, o co chodzi.
 */
function PotrzebnySerwer({ nazwa }: { nazwa: string }) {
  return (
    <main className="uklad">
      <Karteczka tytul={`${nazwa} — potrzebny własny serwer`} doodle="chmurka" wariant="bez" tasma>
        <p>
          Ten widok żyje z sesją gry: kodami stolików, fazami i synchronizacją między urządzeniami. Sesję prowadzi
          serwer uruchamiany na laptopie prowadzącej poleceniem <strong>npm start</strong>.
        </p>
        <p>
          Tutaj, w pokazie, działają dwie części, które z założenia nie potrzebują serwera:{' '}
          <strong>tryb projektora</strong> (cała gra na jednym urządzeniu) i <strong>materiały do druku</strong>.
        </p>
        <div className="przyciski">
          <a className="przycisk przycisk--glowny" href={adres('/projektor')}>
            Tryb projektora
          </a>
          <a className="przycisk przycisk--spokojny" href={adres('/druk')}>
            Materiały do druku
          </a>
          <a className="przycisk przycisk--spokojny" href={adres('/')}>
            ← Rozdroże
          </a>
        </div>
      </Karteczka>
    </main>
  );
}

function Aplikacja() {
  const sciezka = useSciezka();

  const ekran = dopasuj('/ekran/:id', sciezka);
  if (ekran?.id) return POKAZ ? <PotrzebnySerwer nazwa="Ekran sali" /> : <AplikacjaEkranu idSesji={ekran.id} />;

  const druk = dopasuj('/druk/:arkusz', sciezka);
  if (druk?.arkusz)
    return (
      <Suspense fallback={<Wczytywanie />}>
        <AplikacjaDruku arkusz={druk.arkusz} />
      </Suspense>
    );

  switch (sciezka) {
    case '/prowadzaca':
      return POKAZ ? <PotrzebnySerwer nazwa="Widok prowadzącej" /> : <AplikacjaProwadzacej />;
    case '/omowienie':
      return POKAZ ? <PotrzebnySerwer nazwa="Tryb omówienia" /> : <AplikacjaOmowienia />;
    case '/ekran':
      return POKAZ ? <PotrzebnySerwer nazwa="Ekran sali" /> : <AplikacjaEkranu idSesji="" />;
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

// w trybie pokazu nie ma własnego serwera, więc nie ma też czego buforować
if (!POKAZ) wlaczTrybOffline();

createRoot(document.getElementById('korzen')!).render(
  <StrictMode>
    <Aplikacja />
  </StrictMode>,
);
