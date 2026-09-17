/**
 * Ekran sali (projektor). Pokazuje fazę, duży zegar, zasady i nagłówki zdarzeń.
 * Nie pokazuje ukrytych liczników ani żadnych zestawień porównawczych.
 */
import { useCallback, useEffect, useState } from 'react';
import type { Kronika } from '@klebkowo/engine';
import { api, sluchaj } from '../lib/api.ts';
import { Karteczka, EtykietaStolika, Chmurka } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { Zegar } from '../ui/Zegar.tsx';

interface Dane {
  tresc: { zasady: string[]; wstep_do_odczytania: string; meta: { tytul: string; podtytul: string } };
  sesja: { id: string; faza: string; nazwaFazy: string; minutyFazy: number; sekundyFazy: number; zegarDziala: boolean };
  stoliki: { id: string; nazwa: string; zdarzenia: string[]; zatwierdzony: boolean }[];
  kroniki: Kronika[];
}

export function AplikacjaEkranu({ idSesji }: { idSesji: string }) {
  const [dane, ustawDane] = useState<Dane | null>(null);
  const [blad, ustawBlad] = useState<string | null>(null);

  const pobierz = useCallback(async () => {
    try {
      ustawDane(await api.get<Dane>(`/api/ekran/${encodeURIComponent(idSesji)}`));
      ustawBlad(null);
    } catch {
      ustawBlad('Nie widzę tej sesji. Sprawdź adres ekranu sali.');
    }
  }, [idSesji]);

  useEffect(() => {
    void pobierz();
  }, [pobierz]);
  useEffect(() => {
    const p = sluchaj(idSesji, () => void pobierz());
    return () => p.rozlacz();
  }, [idSesji, pobierz]);

  if (blad)
    return (
      <main className="uklad">
        <Karteczka tytul="Ekran sali" doodle="ekran">
          <p>{blad}</p>
        </Karteczka>
      </main>
    );
  if (!dane) return <main className="uklad"><p>Wczytuję…</p></main>;

  const finał = dane.sesja.faza === 'F' || dane.sesja.faza === 'Z';

  return (
    <main className="uklad uklad--szeroki" style={{ paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.5rem)' }}>{dane.sesja.nazwaFazy}</h1>
        <Zegar
          sekundyOd={dane.sesja.sekundyFazy}
          minuty={dane.sesja.minutyFazy}
          dziala={dane.sesja.zegarDziala}
          duzy
        />
      </div>

      {dane.sesja.faza === 'R0' && (
        <Karteczka tytul={dane.tresc.meta.tytul} doodle="kot" wariant="zielen" tasma>
          <p style={{ fontSize: '1.3rem', lineHeight: 1.6 }}>{dane.tresc.wstep_do_odczytania}</p>
        </Karteczka>
      )}

      {finał ? (
        <div className="siatka siatka--2">
          {dane.kroniki.map((k) => (
            <Karteczka key={k.stolik} tytul={k.tytul} etykieta={`Stolik ${k.stolik}`} doodle="kartka" wariant="bez" ksztalt={2} tasma>
              <h3 style={{ fontFamily: "'Caveat Brush', cursive", fontSize: '1.7rem', lineHeight: 1.15 }}>{k.naglowek}</h3>
              {k.zdania.map((z) => (
                <p key={z}>{z}</p>
              ))}
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.2rem', marginTop: '0.8rem' }}>{k.podpis}</p>
            </Karteczka>
          ))}
        </div>
      ) : (
        <>
          <div className="siatka siatka--4">
            {dane.stoliki.map((s) => (
              <div className="karteczka karteczka--2" key={s.id} style={{ margin: 0 }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <EtykietaStolika id={s.id} />
                  <strong style={{ fontFamily: "'Patrick Hand', cursive", fontSize: '1.2rem' }}>{s.nazwa}</strong>
                </div>
                {s.zdarzenia.length ? (
                  <ul className="fakty">
                    {s.zdarzenia.map((z) => (
                      <li key={z}>
                        <span>{z}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pole__podpowiedz">Zdarzenia tej rundy jeszcze przed Wami.</p>
                )}
                <p className="karteczka__etykieta" style={{ marginTop: '0.7rem' }}>
                  {s.zatwierdzony ? 'runda zamknięta' : 'przy pracy'}
                </p>
              </div>
            ))}
          </div>

          <Karteczka tytul="Zasady" doodle="gwiazdka" wariant="blekit" ksztalt={3}>
            <ul className="fakty" style={{ fontSize: '1.15rem' }}>
              {dane.tresc.zasady.map((z) => (
                <li key={z}>
                  <span>{z}</span>
                </li>
              ))}
            </ul>
          </Karteczka>
        </>
      )}

      <Chmurka wariant="zielen">
        <span style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <Doodle nazwa="kot" rozmiar={40} />
          Nie ma tu zwycięzców ani rankingu. Liczniki pokazują koszt decyzji, nie ich ocenę.
        </span>
      </Chmurka>
    </main>
  );
}
