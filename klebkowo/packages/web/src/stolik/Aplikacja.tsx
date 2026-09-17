/**
 * Widok stolika — jedno urządzenie na zespół.
 * Przebieg rundy krok po kroku; liczniki jawne stale pod ręką.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KROKI_FAZY } from '@klebkowo/engine/kroki';
import type { IdFazy, IdRundy } from '@klebkowo/engine/typy';
import { BladApi, api, sluchaj } from '../lib/api.ts';
import { Chmurka, EtykietaStolika, Karteczka, Komunikat, Kroki, Przycisk, Separator } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { Tory } from '../ui/Tory.tsx';
import { Zegar } from '../ui/Zegar.tsx';
import { Wykres } from '../ui/Wykres.tsx';
import { PanelKroku } from './PanelKroku.tsx';
import { pusteKarty, wczytajKarty, zapiszKarty, type KartyRundy, type StanWidoku } from './typy.ts';

export function AplikacjaStolika({ kod }: { kod: string }) {
  const [stan, ustawStan] = useState<StanWidoku | null>(null);
  const [blad, ustawBlad] = useState<string | null>(null);
  const [polaczony, ustawPolaczony] = useState(true);
  const [krokIndeks, ustawKrokIndeks] = useState(0);
  const [karty, ustawKarty] = useState<KartyRundy>(pusteKarty);
  const [zajety, ustawZajety] = useState(false);
  const ostatniaFaza = useRef<IdFazy | null>(null);
  const naglowekRef = useRef<HTMLHeadingElement>(null);

  const pobierz = useCallback(async () => {
    try {
      const dane = await api.get<StanWidoku>(`/api/stolik/${encodeURIComponent(kod)}`);
      ustawStan(dane);
      ustawBlad(null);
    } catch (b) {
      ustawBlad(b instanceof BladApi ? b.message : 'Nie udało się pobrać stanu gry.');
    }
  }, [kod]);

  useEffect(() => {
    void pobierz();
  }, [pobierz]);

  useEffect(() => {
    if (!stan) return;
    const polaczenie = sluchaj(stan.sesja.id, () => void pobierz(), ustawPolaczony);
    return () => polaczenie.rozlacz();
  }, [stan?.sesja.id, pobierz]);

  // zmiana fazy: wracamy na pierwszy krok i odtwarzamy karty zapisane dla tej fazy
  useEffect(() => {
    if (!stan) return;
    if (ostatniaFaza.current === stan.sesja.faza) return;
    ostatniaFaza.current = stan.sesja.faza;
    ustawKrokIndeks(0);
    ustawKarty(wczytajKarty(stan.sesja.id, stan.stolik.id, stan.sesja.faza));
    naglowekRef.current?.focus();
  }, [stan?.sesja.faza, stan?.sesja.id, stan?.stolik.id]);

  const zapamietaj = useCallback(
    (zmiana: (k: KartyRundy) => KartyRundy) => {
      ustawKarty((poprzednie) => {
        const nowe = zmiana(poprzednie);
        if (stan) zapiszKarty(stan.sesja.id, stan.stolik.id, stan.sesja.faza, nowe);
        return nowe;
      });
    },
    [stan?.sesja.id, stan?.stolik.id, stan?.sesja.faza],
  );

  /** Każda operacja ma stabilny identyfikator — powtórka po zerwaniu sieci nic nie zdubluje. */
  const wykonaj = useCallback(
    async <T,>(opId: string, polecenie: unknown): Promise<T | null> => {
      ustawZajety(true);
      try {
        const odpowiedz = await api.post<{ wynik: T } & StanWidoku>(
          `/api/stolik/${encodeURIComponent(kod)}/operacja`,
          { opId, polecenie },
        );
        ustawStan({
          tresc: stan!.tresc,
          sesja: odpowiedz.sesja,
          stolik: odpowiedz.stolik,
          zdarzeniaRundy: odpowiedz.zdarzeniaRundy,
          kronika: odpowiedz.kronika,
        });
        ustawBlad(null);
        return odpowiedz.wynik;
      } catch (b) {
        ustawBlad(b instanceof BladApi ? b.message : 'Nie udało się zapisać operacji.');
        return null;
      } finally {
        ustawZajety(false);
      }
    },
    [kod, stan],
  );

  const definicje = useMemo(() => stan?.tresc.liczniki.jawne ?? [], [stan]);

  if (blad && !stan)
    return (
      <main className="uklad">
        <Karteczka tytul="Nie widzę tej gry" doodle="chmurka" wariant="bez">
          <p>{blad}</p>
          <p>Sprawdźcie kod stolika albo poproście prowadzącą o pomoc. Gra toczy się dalej na papierze.</p>
          <Przycisk wariant="glowny" onClick={() => void pobierz()}>
            Spróbuj jeszcze raz
          </Przycisk>
        </Karteczka>
      </main>
    );

  if (!stan)
    return (
      <main className="uklad">
        <p style={{ fontFamily: "'Patrick Hand', cursive", fontSize: '1.2rem' }}>Wczytuję grę…</p>
      </main>
    );

  const kroki = KROKI_FAZY[stan.sesja.faza];
  const krok = kroki[Math.min(krokIndeks, kroki.length - 1)]!;
  const zatwierdzony = Boolean(stan.stolik.zatwierdzone[stan.sesja.faza]);
  const runda: IdRundy | null =
    stan.sesja.faza === 'R1' || stan.sesja.faza === 'R2' || stan.sesja.faza === 'R3' ? stan.sesja.faza : null;

  return (
    <>
      <a className="pomin-do-tresci" href="#tresc">
        Przejdź do treści
      </a>
      <main className="uklad">
        <header className="pasek">
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <EtykietaStolika id={stan.stolik.id} />
            <div>
              <h1 className="pasek__tytul" tabIndex={-1} ref={naglowekRef} style={{ color: 'inherit', textShadow: 'none' }}>
                {stan.tresc.stolik.nazwa}
              </h1>
              <p className="pasek__opis">
                Stolik {stan.stolik.id} · {stan.sesja.nazwaFazy}
              </p>
            </div>
          </div>
          <Zegar sekundyOd={stan.sesja.sekundyFazy} minuty={stan.sesja.minutyFazy} dziala={stan.sesja.zegarDziala} />
        </header>

        {!polaczony && (
          <Komunikat wariant="uwaga" doodle="chmurka">
            Słaba sieć — aplikacja sama sprawdza stan co trzy sekundy. Możecie grać dalej; nic nie zginie.
          </Komunikat>
        )}
        {blad && (
          <Komunikat wariant="blad" doodle="megafon" rola="alert">
            {blad}
          </Komunikat>
        )}

        <Kroki kroki={kroki} ukonczone={stan.stolik.ukonczoneKroki} biezacy={krok.id} />

        <div id="tresc">
          {zatwierdzony && stan.sesja.faza !== 'Z' ? (
            <EkranOczekiwania nazwaFazy={stan.sesja.nazwaFazy} />
          ) : (
            <PanelKroku
              krok={krok}
              stan={stan}
              runda={runda}
              karty={karty}
              zapamietaj={zapamietaj}
              wykonaj={wykonaj}
              zajety={zajety}
              dalej={() => ustawKrokIndeks((i) => Math.min(i + 1, kroki.length - 1))}
              wstecz={() => ustawKrokIndeks((i) => Math.max(i - 1, 0))}
              pierwszyKrok={krokIndeks === 0}
            />
          )}
        </div>

        {stan.sesja.faza === 'F' && stan.kronika && (
          <>
            <Separator />
            <Wykres dane={stan.kronika.wykres} tytul={`Koszty decyzji — ${stan.tresc.stolik.nazwa}`} />
          </>
        )}

        <div className="podstawka">
          <Tory liczniki={stan.stolik.liczniki} definicje={definicje} />
          <p className="pole__podpowiedz" style={{ marginTop: '0.5rem' }}>
            Liczniki pokazują koszt decyzji, nie ich ocenę.
          </p>
        </div>
      </main>
    </>
  );
}

function EkranOczekiwania({ nazwaFazy }: { nazwaFazy: string }) {
  return (
    <Karteczka tytul="Runda zamknięta" doodle="kot" wariant="zielen" tasma>
      <Chmurka wariant="zielen">
        {nazwaFazy} macie za sobą. Poczekajcie na pozostałe zespoły — kot Kierownik też czeka.
      </Chmurka>
      <p>To dobry moment, żeby porozmawiać przy stoliku o tym, co właśnie się wydarzyło.</p>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <Doodle nazwa="kot" rozmiar={120} kolor="#7db83a" />
      </div>
    </Karteczka>
  );
}
