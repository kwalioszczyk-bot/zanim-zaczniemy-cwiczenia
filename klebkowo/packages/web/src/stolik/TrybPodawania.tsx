/**
 * Tryb podawania urządzenia.
 * Stolik ma jedno urządzenie, a karty prywatne muszą zostać prywatne: treść pokazuje się
 * dopiero po potwierdzeniu przez właściwą osobę i znika po ukryciu albo po 45 sekundach.
 */
import { useEffect, useRef, useState } from 'react';
import { Chmurka, Karteczka, Komunikat, Przycisk } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';

const SEKUNDY_PODGLADU = 45;

export interface KartaPrywatna {
  rola: string;
  naglowek: string;
  tresc: string;
  dodatek?: string;
}

export function TrybPodawania({
  karty,
  naPapierze,
  etykietaKoperty,
  naKoniec,
  zakonczone,
}: {
  karty: KartaPrywatna[];
  naPapierze: boolean;
  etykietaKoperty: string;
  naKoniec: () => void;
  zakonczone: boolean;
}) {
  const [indeks, ustawIndeks] = useState(0);
  const [odslonieta, ustawOdslonieta] = useState(false);
  const [pozostalo, ustawPozostalo] = useState(SEKUNDY_PODGLADU);
  const przyciskRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!odslonieta) return;
    ustawPozostalo(SEKUNDY_PODGLADU);
    const id = setInterval(() => {
      ustawPozostalo((p) => {
        if (p <= 1) {
          ustawOdslonieta(false);
          return SEKUNDY_PODGLADU;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [odslonieta, indeks]);

  useEffect(() => {
    przyciskRef.current?.focus();
  }, [indeks, odslonieta]);

  if (naPapierze) {
    return (
      <Karteczka tytul="Karty prywatne" doodle="koperta" wariant="bez">
        <Chmurka wariant="zielen">
          Odczytajcie swoje karty z koperty nr <strong>{etykietaKoperty}</strong>. Każda osoba czyta wyłącznie swoją
          kartę.
        </Chmurka>
        <p>
          Możecie mówić o wszystkim, co wiecie. <strong>Kart nie pokazujecie.</strong>
        </p>
        {!zakonczone && (
          <Przycisk wariant="glowny" onClick={naKoniec} doodle="strzalka">
            Wszyscy przeczytali — idziemy dalej
          </Przycisk>
        )}
      </Karteczka>
    );
  }

  const karta = karty[indeks];
  if (!karta) return null;
  const ostatnia = indeks === karty.length - 1;

  return (
    <Karteczka tytul="Przekażcie urządzenie" doodle="koperta" wariant="bez">
      <Komunikat wariant="cicho" doodle="kartka" rola="none">
        W wariancie mieszanym karty prywatne rozdaje prowadząca na papierze.
      </Komunikat>

      {!odslonieta ? (
        <>
          <Chmurka>
            Przekaż urządzenie osobie w roli <strong>{karta.rola}</strong>: {karta.naglowek}.
          </Chmurka>
          <Przycisk
            ref={przyciskRef}
            wariant="glowny"
            rozmiar="duzy"
            szeroki
            onClick={() => ustawOdslonieta(true)}
          >
            Jestem {karta.rola} — pokaż moją kartę
          </Przycisk>
          <p className="pole__podpowiedz" style={{ marginTop: '0.8rem' }}>
            Karta {indeks + 1} z {karty.length}. Treść zniknie po {SEKUNDY_PODGLADU} sekundach albo po kliknięciu
            „Ukryj”.
          </p>
        </>
      ) : (
        <>
          <div className="karteczka karteczka--2 karteczka--brzoskwinia" style={{ marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Doodle nazwa="kartka" rozmiar={26} />
              {karta.rola} — {karta.naglowek}
            </h3>
            <p style={{ fontSize: '1.15rem' }}>{karta.tresc}</p>
            {karta.dodatek && <p className="pole__podpowiedz">{karta.dodatek}</p>}
          </div>
          <div className="przyciski">
            <Przycisk
              ref={przyciskRef}
              wariant="glowny"
              onClick={() => {
                ustawOdslonieta(false);
                if (ostatnia) naKoniec();
                else ustawIndeks(indeks + 1);
              }}
            >
              {ostatnia ? 'Ukryj i wróć do wspólnego ekranu' : 'Ukryj i przekaż dalej'}
            </Przycisk>
            <span aria-live="polite" className="pole__podpowiedz">
              Ukryje się samo za {pozostalo} s
            </span>
          </div>
        </>
      )}

      {indeks > 0 && !odslonieta && (
        <p className="pole__podpowiedz" style={{ marginTop: '0.8rem' }}>
          Trzeba pokazać kartę jeszcze raz? Wróćcie do tego kroku — treść otwiera się wyłącznie w tym trybie.
        </p>
      )}
    </Karteczka>
  );
}
