/** Rozdroże — pierwszy ekran po wejściu na adres gry. */
import { Chmurka, Karteczka } from './ui/podstawowe.tsx';
import { Doodle } from './ui/Doodle.tsx';
import { adres } from './lib/router.ts';
import { POKAZ } from './lib/tryb.ts';

const wejscia = [
  { adres: '/prowadzaca', tytul: 'Prowadząca', opis: 'Sesja, kody stolików, sterowanie fazami, zegar, omówienie.', doodle: 'megafon' },
  { adres: '/stolik', tytul: 'Stolik', opis: 'Jedno urządzenie na zespół. Potrzebny czteroznakowy kod.', doodle: 'ludzie' },
  { adres: '/ekran', tytul: 'Ekran sali', opis: 'Duży zegar, faza, zasady, a na koniec Kroniki.', doodle: 'ekran' },
  { adres: '/druk', tytul: 'Druk', opis: 'Komplet materiałów papierowych do wydrukowania.', doodle: 'kartka' },
] as const;

export function Rozdroze() {
  return (
    <main className="uklad">
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Doodle nazwa="kot" rozmiar={110} kolor="#7db83a" />
        <h1>KŁĘBKOWO</h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.7rem', marginTop: '-0.5rem' }}>Sprawa się plącze</p>
        <p style={{ fontFamily: "'Patrick Hand', cursive", fontSize: '1.15rem' }}>
          Symulacja współpracy międzyinstytucjonalnej
        </p>
      </header>

      <div className="siatka siatka--2">
        {wejscia.map((w) => (
          <a
            key={w.adres}
            href={adres(w.adres)}
            className="karteczka karteczka--2"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit', margin: 0 }}
          >
            <h2 className="karteczka__naglowek">
              <Doodle nazwa={w.doodle} rozmiar={34} />
              {w.tytul}
            </h2>
            <p>{w.opis}</p>
          </a>
        ))}
      </div>

      <Karteczka tytul="Tryb projektora" doodle="ekran" wariant="bez" ksztalt={3}>
        <p>
          Cała gra na jednym urządzeniu, bez serwera i bez sieci. Stoliki grają na papierze, a prowadząca wprowadza ich
          decyzje.
        </p>
        <a className="przycisk przycisk--spokojny" href={adres('/projektor')}>
          Otwórz tryb projektora
        </a>
      </Karteczka>

      {POKAZ && (
        <Chmurka>
          To jest pokaz gry, otwarty bez własnego serwera. Klikalne są <strong>tryb projektora</strong> i{' '}
          <strong>materiały do druku</strong>. Widok prowadzącej, stolika i ekran sali potrzebują sesji, którą prowadzi
          serwer uruchamiany na laptopie prowadzącej.
        </Chmurka>
      )}

      <Chmurka wariant="zielen">
        Aplikacja zapisuje stan gry, a nie dane uczestników. Nie ma tu kont, logowania uczestników ani analityki.
      </Chmurka>
    </main>
  );
}
