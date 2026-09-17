/**
 * Tryb omówienia — dostępny wyłącznie po PIN-ie prowadzącej.
 * Zakładka „Dzień 1” nie ujawnia mechanizmu. Zakładka „Dzień 2” odsłania go krok po kroku,
 * po dodatkowym potwierdzeniu.
 */
import { useCallback, useEffect, useState } from 'react';
import type { Kronika, OmowienieStolika } from '@klebkowo/engine';
import { BladApi, api } from '../lib/api.ts';
import { Chmurka, EtykietaStolika, Karteczka, Komunikat, Przycisk, Separator } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { Wykres } from '../ui/Wykres.tsx';

interface Dane {
  dzien1: { nazwa: string; pytania: string[]; nie_ujawniac: string[]; powiazania: Record<string, string> };
  dzien2: { nazwa: string; ujawnienie: string[]; odniesienie: string; powiazania: Record<string, string> };
  stoliki: OmowienieStolika[];
  kroniki: Kronika[];
}

export function AplikacjaOmowienia() {
  const [token, ustawToken] = useState(() => {
    try {
      return sessionStorage.getItem('klebkowo:prowadzaca') ?? '';
    } catch {
      return '';
    }
  });
  const [dane, ustawDane] = useState<Dane | null>(null);
  const [zakladka, ustawZakladke] = useState<'dzien1' | 'dzien2'>('dzien1');
  const [blad, ustawBlad] = useState<string | null>(null);

  const pobierz = useCallback(async () => {
    if (!token) return;
    try {
      ustawDane(await api.get<Dane>('/api/omowienie', token));
    } catch (b) {
      if (b instanceof BladApi && b.status === 401) ustawToken('');
      else ustawBlad('Nie udało się pobrać danych omówienia.');
    }
  }, [token]);

  useEffect(() => {
    void pobierz();
  }, [pobierz]);

  if (!token)
    return (
      <main className="uklad">
        <Karteczka tytul="Tryb omówienia" doodle="kartka">
          <p>Wejdź najpierw do widoku prowadzącej i podaj PIN — tryb omówienia otworzy się w tej samej przeglądarce.</p>
          <a className="przycisk przycisk--glowny" href="/prowadzaca">
            Przejdź do widoku prowadzącej
          </a>
        </Karteczka>
      </main>
    );

  if (!dane)
    return (
      <main className="uklad">
        <p>Wczytuję…</p>
        {blad && <Komunikat wariant="blad">{blad}</Komunikat>}
      </main>
    );

  return (
    <main className="uklad uklad--szeroki">
      <h1>Omówienie</h1>

      <Komunikat wariant="uwaga" doodle="megafon" rola="none">
        <strong>Nie ujawniać w dniu 1:</strong>{' '}
        {dane.dzien1.nie_ujawniac.join(' · ')}
      </Komunikat>

      <div className="przyciski" role="tablist" aria-label="Zakładki omówienia" style={{ marginBottom: '1.2rem' }}>
        <Przycisk
          role="tab"
          aria-selected={zakladka === 'dzien1'}
          wariant={zakladka === 'dzien1' ? 'glowny' : ''}
          onClick={() => ustawZakladke('dzien1')}
        >
          Dzień 1
        </Przycisk>
        <Przycisk
          role="tab"
          aria-selected={zakladka === 'dzien2'}
          wariant={zakladka === 'dzien2' ? 'glowny' : ''}
          onClick={() => ustawZakladke('dzien2')}
        >
          Mechanizm ukryty — dzień 2
        </Przycisk>
      </div>

      {zakladka === 'dzien1' ? <Dzien1 dane={dane} /> : <Dzien2 dane={dane} />}
    </main>
  );
}

function Dzien1({ dane }: { dane: Dane }) {
  const [pytanie, ustawPytanie] = useState<number | null>(null);

  if (pytanie !== null)
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div>
          <Doodle nazwa="chmurka" rozmiar={80} kolor="#7db83a" />
          <p style={{ fontFamily: "'Caveat Brush', cursive", fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.2 }}>
            {dane.dzien1.pytania[pytanie]}
          </p>
          <div className="przyciski" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <Przycisk onClick={() => ustawPytanie(pytanie > 0 ? pytanie - 1 : null)}>← Poprzednie</Przycisk>
            <Przycisk wariant="spokojny" onClick={() => ustawPytanie(null)}>
              Zamknij pełny ekran
            </Przycisk>
            <Przycisk
              wariant="glowny"
              disabled={pytanie >= dane.dzien1.pytania.length - 1}
              onClick={() => ustawPytanie(pytanie + 1)}
            >
              Następne →
            </Przycisk>
          </div>
          <p className="pole__podpowiedz" style={{ marginTop: '1rem' }}>
            Pytanie {pytanie + 1} z {dane.dzien1.pytania.length}
          </p>
        </div>
      </div>
    );

  return (
    <>
      <Karteczka tytul={dane.dzien1.nazwa} doodle="ludzie" wariant="zielen" tasma>
        <ol style={{ paddingLeft: '1.2rem' }}>
          {dane.dzien1.pytania.map((p, i) => (
            <li key={p} style={{ marginBottom: '0.5rem' }}>
              {p}{' '}
              <Przycisk rozmiar="maly" wariant="spokojny" onClick={() => ustawPytanie(i)}>
                Pokaż na cały ekran
              </Przycisk>
            </li>
          ))}
        </ol>
      </Karteczka>

      {dane.stoliki.map((s) => (
        <Karteczka key={s.id} tytul={s.nazwa} etykieta={`Stolik ${s.id}`} doodle="kartka" ksztalt={2}>
          <Wykres dane={s.wykres} tytul={`Liczniki stolika ${s.id}`} />
          <Separator />
          <h3>Zdarzenia i reakcje</h3>
          {s.zdarzenia.length ? (
            <ul className="fakty">
              {s.zdarzenia.map((z, i) => (
                <li key={`${z.zdarzenie}-${i}`}>
                  <span>
                    <strong>{z.runda}</strong> · {z.tytul}
                    {z.wybor ? ` — reakcja: ${z.wybor}` : ''}
                    {z.ochrona ? ' — zadziałała ochrona' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pole__podpowiedz">Brak zapisanych zdarzeń.</p>
          )}
          <Separator />
          <h3>Zobowiązania</h3>
          {s.zobowiazania.length ? (
            <table className="tabela-danych">
              <thead>
                <tr>
                  <th scope="col">Rola</th>
                  <th scope="col">Co</th>
                  <th scope="col">Status</th>
                  <th scope="col">Obciążenie przy sprawdzeniu</th>
                  <th scope="col">Rzut</th>
                </tr>
              </thead>
              <tbody>
                {s.zobowiazania.map((z) => (
                  <tr key={z.id}>
                    <td>{z.rola}</td>
                    <td>{z.co}</td>
                    <td>{z.status}</td>
                    <td>{z.obciazenie ?? '—'}</td>
                    <td>{z.rzut ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="pole__podpowiedz">Stolik nie podjął zobowiązań.</p>
          )}
          {s.korekty.length > 0 && (
            <>
              <Separator />
              <h3>Dziennik korekt prowadzącej</h3>
              <ul className="fakty">
                {s.korekty.map((k, i) => (
                  <li key={i}>
                    <span>
                      {k.licznik}: {k.z} → {k.na} — {k.powod}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Karteczka>
      ))}

      <Karteczka tytul="Powiązania z modułami" doodle="strzalka" wariant="bez" ksztalt={3}>
        <ul className="fakty">
          {Object.entries(dane.dzien1.powiazania).map(([modul, opis]) => (
            <li key={modul}>
              <span>
                <strong>{modul}</strong> — {opis}
              </span>
            </li>
          ))}
        </ul>
      </Karteczka>
    </>
  );
}

function Dzien2({ dane }: { dane: Dane }) {
  const [potwierdzone, ustawPotwierdzone] = useState(false);
  const [odsloniete, ustawOdsloniete] = useState<Record<string, number>>({});

  if (!potwierdzone)
    return (
      <Karteczka tytul="Uwaga" doodle="megafon" wariant="brzoskwinia" tasma>
        <p style={{ fontSize: '1.2rem' }}>
          Ta zakładka ujawnia mechanizm omawiany w module 5. Kontynuować?
        </p>
        <div className="przyciski">
          <Przycisk wariant="glowny" onClick={() => ustawPotwierdzone(true)}>
            Tak, jesteśmy w dniu 2
          </Przycisk>
        </div>
      </Karteczka>
    );

  return (
    <>
      <Karteczka tytul={dane.dzien2.nazwa} doodle="gwiazdka" wariant="zielen" tasma>
        <ul className="fakty" style={{ fontSize: '1.1rem' }}>
          {dane.dzien2.ujawnienie.map((u) => (
            <li key={u}>
              <span>{u}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.3rem' }}>{dane.dzien2.odniesienie}</p>
      </Karteczka>

      {dane.stoliki.map((s) => {
        const klucz = (ktora: string) => `${s.id}:${ktora}`;
        return (
          <Karteczka key={s.id} tytul={s.nazwa} etykieta={`Stolik ${s.id}`} doodle="sciezka" ksztalt={2}>
            {s.decyzje.map((d) => {
              const ile = odsloniete[klucz(d.ktora)] ?? 0;
              return (
                <div key={d.ktora} style={{ marginBottom: '1.5rem' }}>
                  <h3>
                    {d.ktora === 'r1' ? 'Decyzja z rundy 1' : 'Decyzja z rundy 3'}: {d.pytanie}
                  </h3>
                  <ul className="fakty">
                    <li>
                      <span>
                        Zespół wybrał: <strong>{d.wybrana ?? 'brak decyzji'}</strong>
                        {d.wybrana ? ` — ${d.opcje[d.wybrana]}` : ''}
                      </span>
                    </li>
                    <li>
                      <span>
                        Opcja zgodna z pełną wiedzą zespołu: <strong>{d.zgodnaZPelnaWiedza}</strong> —{' '}
                        {d.opcje[d.zgodnaZPelnaWiedza]}
                      </span>
                    </li>
                  </ul>

                  <Chmurka wariant="blekit">
                    Informacje wspólne wskazywały inną opcję. Rozstrzygające fragmenty miały poszczególne role.
                  </Chmurka>

                  <ol style={{ paddingLeft: '1.2rem' }}>
                    {d.informacjeUnikalne.slice(0, ile).map((i) => (
                      <li key={i.rola} style={{ marginBottom: '0.4rem' }}>
                        <strong>{i.rola}</strong>: {i.tekst}{' '}
                        {i.rozstrzygajaca && <span className="znacznik-ochrony">informacja rozstrzygająca</span>}
                      </li>
                    ))}
                  </ol>

                  {ile < d.informacjeUnikalne.length && (
                    <Przycisk
                      wariant="drugi"
                      onClick={() => ustawOdsloniete((o) => ({ ...o, [klucz(d.ktora)]: ile + 1 }))}
                    >
                      Odsłoń kolejną informację ({ile + 1} z {d.informacjeUnikalne.length})
                    </Przycisk>
                  )}
                </div>
              );
            })}

            <Separator />
            <SpotkaniaARyzyko spotkania={s.liczbaSpotkan} ryzyko={s.ukryteRyzyko} />
          </Karteczka>
        );
      })}

      <Karteczka tytul="Powiązania z modułami dnia 2" doodle="strzalka" wariant="bez" ksztalt={3}>
        <ul className="fakty">
          {Object.entries(dane.dzien2.powiazania).map(([modul, opis]) => (
            <li key={modul}>
              <span>
                <strong>{modul}</strong> — {opis}
              </span>
            </li>
          ))}
        </ul>
      </Karteczka>
    </>
  );
}

/** Zestawienie „spotkania obok ukrytego ryzyka” — z podpisem, że spotkania na ryzyko nie wpływały. */
function SpotkaniaARyzyko({ spotkania, ryzyko }: { spotkania: number; ryzyko: number }) {
  const maks = Math.max(4, spotkania, ryzyko);
  const slupek = (wartosc: number, kolor: string, etykieta: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
      <span style={{ width: '10rem', fontFamily: "'Patrick Hand', cursive" }}>{etykieta}</span>
      <span
        style={{
          display: 'inline-block',
          height: '1.5rem',
          width: `${(wartosc / maks) * 100}%`,
          minWidth: wartosc ? '2px' : 0,
          background: kolor,
          border: '2.5px solid #232323',
          borderRadius: '4px 9px 5px 8px',
        }}
      />
      <strong>{wartosc}</strong>
    </div>
  );
  return (
    <>
      <h3>Spotkania zespołu a ukryte ryzyko</h3>
      {slupek(spotkania, '#bfe2ec', 'Liczba spotkań (A1)')}
      {slupek(ryzyko, '#f9c9a3', 'Ukryte ryzyko')}
      <p className="pole__podpowiedz">
        Spotkania nie wpływały na ukryte ryzyko. Rosło ono wyłącznie wtedy, gdy decyzja nie uwzględniała informacji,
        które zespół już miał.
      </p>
    </>
  );
}
