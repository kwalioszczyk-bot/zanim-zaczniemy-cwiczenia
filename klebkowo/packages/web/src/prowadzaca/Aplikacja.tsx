/** Widok prowadzącej: sesja, kody stolików, sterowanie fazami, zegar, korekty, eksport. */
import { useCallback, useEffect, useState } from 'react';
import { NAZWY_FAZ } from '@klebkowo/engine/kroki';
import type { IdFazy } from '@klebkowo/engine/typy';
import { BladApi, api, sluchaj } from '../lib/api.ts';
import { Chmurka, EtykietaStolika, Karteczka, Komunikat, Przycisk, Separator } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { Tory } from '../ui/Tory.tsx';
import { Zegar } from '../ui/Zegar.tsx';
import { adres, idz } from '../lib/router.ts';
import { wczytajToken, zapiszToken } from '../lib/token.ts';

interface Stan {
  sesja: { id: string; faza: IdFazy; nazwaFazy: string; minutyFazy: number; sekundyFazy: number; zegarDziala: boolean };
  kody: Record<string, string>;
  status: { id: string; zatwierdzony: boolean; kroki: number }[];
  stoliki: { id: string; nazwa: string; liczniki: Record<string, number>; zobowiazania: unknown[] }[];
  ustawienia: { kartyPrywatneNaPapierze: boolean; trybProjektora: boolean };
}

export function AplikacjaProwadzacej() {
  const [token, ustawToken] = useState(wczytajToken);
  const [stan, ustawStan] = useState<Stan | null>(null);
  const [blad, ustawBlad] = useState<string | null>(null);

  const pobierz = useCallback(async () => {
    if (!token) return;
    try {
      ustawStan(await api.get<Stan>('/api/prowadzaca/stan', token));
      ustawBlad(null);
    } catch (b) {
      if (b instanceof BladApi && b.status === 401) {
        ustawToken('');
        zapiszToken('');
      } else ustawBlad(b instanceof BladApi ? b.message : 'Nie udało się pobrać stanu sesji.');
    }
  }, [token]);

  useEffect(() => {
    void pobierz();
  }, [pobierz]);

  useEffect(() => {
    if (!stan) return;
    const p = sluchaj(stan.sesja.id, () => void pobierz());
    return () => p.rozlacz();
  }, [stan?.sesja.id, pobierz]);

  if (!token) return <Logowanie ustawToken={(t) => { ustawToken(t); zapiszToken(t); }} />;
  if (!stan)
    return (
      <main className="uklad">
        <p>Wczytuję sesję…</p>
        {blad && <Komunikat wariant="blad">{blad}</Komunikat>}
      </main>
    );

  const wykonaj = async (sciezka: string, ciało: unknown = {}) => {
    try {
      await api.post(sciezka, ciało, token);
      await pobierz();
    } catch (b) {
      ustawBlad(b instanceof BladApi ? b.message : 'Nie udało się wykonać operacji.');
    }
  };

  const fazy: IdFazy[] = ['R0', 'R1', 'R2', 'R3', 'F', 'Z'];

  return (
    <main className="uklad uklad--szeroki">
      <header className="pasek">
        <div>
          <h1 className="pasek__tytul" style={{ color: 'inherit', textShadow: 'none' }}>
            {stan.sesja.nazwaFazy}
          </h1>
          <p className="pasek__opis">Sesja {stan.sesja.id} · faza {stan.sesja.faza}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <Zegar sekundyOd={stan.sesja.sekundyFazy} minuty={stan.sesja.minutyFazy} dziala={stan.sesja.zegarDziala} />
          <Przycisk rozmiar="maly" wariant="spokojny" onClick={() => void wykonaj('/api/prowadzaca/zegar')}>
            {stan.sesja.zegarDziala ? 'Zatrzymaj zegar' : 'Wznów zegar'}
          </Przycisk>
        </div>
      </header>

      {blad && <Komunikat wariant="blad" rola="alert">{blad}</Komunikat>}

      <Karteczka tytul="Sterowanie fazami" doodle="zegar" wariant="blekit">
        <div className="przyciski" style={{ marginBottom: '1rem' }}>
          <Przycisk wariant="glowny" rozmiar="duzy" onClick={() => void wykonaj('/api/prowadzaca/faza')} doodle="strzalka">
            Następna faza
          </Przycisk>
        </div>
        <div className="przyciski">
          {fazy.map((f) => (
            <Przycisk
              key={f}
              rozmiar="maly"
              wariant={f === stan.sesja.faza ? 'drugi' : ''}
              aria-current={f === stan.sesja.faza ? 'step' : undefined}
              onClick={() => void wykonaj('/api/prowadzaca/faza', { faza: f })}
            >
              {NAZWY_FAZ[f]}
            </Przycisk>
          ))}
        </div>
      </Karteczka>

      <KodyStolikow kody={stan.kody} />

      <Karteczka tytul="Stoliki" doodle="ludzie" etykieta="zawsze w kolejności A–D">
        <div className="siatka siatka--2">
          {stan.stoliki.map((s) => {
            const status = stan.status.find((x) => x.id === s.id);
            return (
              <div className="karteczka karteczka--2" key={s.id} style={{ margin: 0 }}>
                <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <EtykietaStolika id={s.id} />
                  <div>
                    <strong>{s.nazwa}</strong>
                    <br />
                    <span className="karteczka__etykieta">
                      {status?.zatwierdzony ? 'gotowy' : 'w trakcie'}
                    </span>
                  </div>
                </div>
                <Tory
                  liczniki={s.liczniki}
                  definicje={[
                    { id: 'czas', nazwa: 'Czas', opis: '', min: 0, max: 10 },
                    { id: 'obciazenie', nazwa: 'Obciążenie', opis: '', min: 0, max: 10 },
                    { id: 'zaufanie', nazwa: 'Zaufanie', opis: '', min: 0, max: 10 },
                    { id: 'zasieg', nazwa: 'Współtworzenie', opis: '', min: 0, max: 10 },
                  ]}
                />
                <Korekta stolik={s.id} wykonaj={wykonaj} />
              </div>
            );
          })}
        </div>
      </Karteczka>

      <Karteczka tytul="Ustawienia sesji" doodle="kartka" wariant="bez">
        <label style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', marginBottom: '0.8rem', minHeight: '48px' }}>
          <input
            type="checkbox"
            checked={stan.ustawienia.kartyPrywatneNaPapierze}
            style={{ width: '1.4rem', height: '1.4rem', marginTop: '0.3rem' }}
            onChange={(e) => void wykonaj('/api/prowadzaca/ustawienia', { kartyPrywatneNaPapierze: e.target.checked })}
          />
          <span>
            <strong>Karty prywatne na papierze</strong> (wariant zalecany na sali)
            <br />
            <span className="pole__podpowiedz">
              Aplikacja pomija tryb podawania urządzenia i pokazuje tylko numer koperty.
            </span>
          </span>
        </label>
        <Separator />
        <div className="przyciski">
          <a className="przycisk przycisk--spokojny" href={`/ekran/${stan.sesja.id}`}>
            Otwórz ekran sali
          </a>
          <a className="przycisk przycisk--spokojny" href={adres('/omowienie')}>
            Tryb omówienia
          </a>
          <a className="przycisk przycisk--spokojny" href={adres('/druk')}>
            Materiały do druku
          </a>
        </div>
      </Karteczka>

      <Karteczka tytul="Eksport i koniec sesji" doodle="kartka" wariant="cicho" ksztalt={3}>
        <p className="pole__podpowiedz">
          Eksport obejmuje wyłącznie poziom stolików: fazy, wybory, liczniki, zdarzenia i liczbę zobowiązań. Nie zawiera
          żadnych danych uczestników.
        </p>
        <div className="przyciski">
          <Przycisk onClick={() => void pobierzPlik('/api/omowienie/eksport.json', token)}>Pobierz JSON</Przycisk>
          <Przycisk onClick={() => void pobierzPlik('/api/omowienie/eksport.csv', token)}>Pobierz CSV</Przycisk>
          <Przycisk
            wariant="glowny"
            onClick={() => {
              if (!confirm('Zakończyć sesję i usunąć wszystkie jej dane? Tej operacji nie da się cofnąć.')) return;
              void api.del('/api/prowadzaca/sesja', token).then(() => {
                zapiszToken('');
                ustawToken('');
                ustawStan(null);
              });
            }}
          >
            Zakończ i usuń sesję
          </Przycisk>
        </div>
      </Karteczka>
    </main>
  );
}

async function pobierzPlik(url: string, token: string) {
  const odpowiedz = await fetch(url, { headers: { 'x-klebkowo-token': token } });
  const blob = await odpowiedz.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = url.split('/').pop() ?? 'eksport';
  link.click();
  URL.revokeObjectURL(link.href);
}

function KodyStolikow({ kody }: { kody: Record<string, string> }) {
  const [adresy, ustawAdresy] = useState<string[]>([]);
  const [wybrany, ustawWybrany] = useState('');

  useEffect(() => {
    void api
      .get<{ adresy: string[] }>('/api/adresy')
      .then((d) => {
        ustawAdresy(d.adresy);
        // jeśli prowadząca weszła już adresem z sieci lokalnej, zostajemy przy nim —
        // jest sprawdzony; w przeciwnym razie bierzemy pierwszy adres z serwera
        const wlasny = `${window.location.protocol}//${window.location.host}`;
        ustawWybrany(d.adresy.includes(wlasny) ? wlasny : (d.adresy[0] ?? wlasny));
      })
      .catch(() => ustawWybrany(`${window.location.protocol}//${window.location.host}`));
  }, []);

  const adres = wybrany || `${window.location.protocol}//${window.location.host}`;
  const lokalny = /\/\/(localhost|127\.|\[::1\])/.test(adres);
  const pary = Object.entries(kody).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <Karteczka tytul="Kody stolików" doodle="kartka" wariant="zielen" tasma>
      <p>
        Adres dla stolików: <strong>{adres}/stolik</strong>. Kod QR prowadzi prosto do właściwego stolika.
      </p>

      {adresy.length > 1 && (
        <div className="pole">
          <label className="pole__etykieta" htmlFor="adres-sali">
            Sieć, w której są telefony stolików
          </label>
          <select id="adres-sali" value={wybrany} onChange={(e) => ustawWybrany(e.target.value)}>
            {adresy.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <span className="pole__podpowiedz">
            Laptop bywa w kilku sieciach naraz. Jeśli stoliki nie mogą wejść — wybierz inny adres, kody QR zmienią się
            od razu.
          </span>
        </div>
      )}

      {lokalny && (
        <Komunikat wariant="uwaga" doodle="megafon">
          Ten adres działa tylko na tym komputerze. Telefony stolików go nie znajdą. Podłącz laptop do sieci Wi-Fi sali
          i odśwież stronę — pojawi się adres widoczny dla innych urządzeń.
        </Komunikat>
      )}
      <div className="siatka siatka--4">
        {pary.map(([kod, stolik]) => (
          <div key={kod} style={{ textAlign: 'center' }}>
            <EtykietaStolika id={stolik} />
            <p style={{ fontFamily: "'Caveat Brush', cursive", fontSize: '2rem', letterSpacing: '0.2em', margin: '0.3rem 0' }}>
              {kod}
            </p>
            <img
              src={`/api/qr?tekst=${encodeURIComponent(`${adres}/stolik/${kod}`)}`}
              alt={`Kod QR dla stolika ${stolik}, kod ${kod}`}
              width={140}
              height={140}
              style={{ border: '2.5px solid #232323', borderRadius: '10px', background: '#fff' }}
            />
          </div>
        ))}
      </div>
    </Karteczka>
  );
}

function Korekta({ stolik, wykonaj }: { stolik: string; wykonaj: (s: string, c: unknown) => Promise<void> }) {
  const [otwarte, ustawOtwarte] = useState(false);
  const [licznik, ustawLicznik] = useState('zaufanie');
  const [wartosc, ustawWartosc] = useState('5');
  const [powod, ustawPowod] = useState('');

  if (!otwarte)
    return (
      <Przycisk rozmiar="maly" wariant="spokojny" onClick={() => ustawOtwarte(true)} style={{ marginTop: '0.7rem' }}>
        Popraw licznik
      </Przycisk>
    );

  return (
    <div style={{ marginTop: '0.8rem' }}>
      <div className="pole">
        <label className="pole__etykieta" htmlFor={`korekta-licznik-${stolik}`}>
          Licznik
        </label>
        <select id={`korekta-licznik-${stolik}`} value={licznik} onChange={(e) => ustawLicznik(e.target.value)}>
          <option value="czas">Czas</option>
          <option value="obciazenie">Obciążenie zespołu</option>
          <option value="zaufanie">Zaufanie</option>
          <option value="zasieg">Współtworzenie</option>
        </select>
      </div>
      <div className="pole">
        <label className="pole__etykieta" htmlFor={`korekta-wartosc-${stolik}`}>
          Nowa wartość (0–10)
        </label>
        <input
          id={`korekta-wartosc-${stolik}`}
          type="number"
          min={0}
          max={10}
          value={wartosc}
          onChange={(e) => ustawWartosc(e.target.value)}
        />
      </div>
      <div className="pole">
        <label className="pole__etykieta" htmlFor={`korekta-powod-${stolik}`}>
          Powód korekty (trafia do dziennika zmian)
        </label>
        <input id={`korekta-powod-${stolik}`} value={powod} onChange={(e) => ustawPowod(e.target.value)} />
      </div>
      <div className="przyciski">
        <Przycisk
          rozmiar="maly"
          wariant="glowny"
          disabled={!powod.trim()}
          onClick={() => {
            void wekonajKorekte();
          }}
        >
          Zapisz korektę
        </Przycisk>
        <Przycisk rozmiar="maly" onClick={() => ustawOtwarte(false)}>
          Anuluj
        </Przycisk>
      </div>
    </div>
  );

  async function wekonajKorekte() {
    await wykonaj('/api/prowadzaca/korekta', { stolik, licznik, na: Number(wartosc), powod });
    ustawOtwarte(false);
    ustawPowod('');
  }
}

function Logowanie({ ustawToken }: { ustawToken: (t: string) => void }) {
  const [pin, ustawPin] = useState('');
  const [idSesji, ustawIdSesji] = useState('');
  const [naPapierze, ustawNaPapierze] = useState(true);
  const [blad, ustawBlad] = useState<string | null>(null);
  const [sesje, ustawSesje] = useState<{ id: string; faza: string }[]>([]);

  useEffect(() => {
    void api.get<{ sesje: { id: string; faza: string }[] }>('/api/sesje').then((d) => {
      ustawSesje(d.sesje);
      if (d.sesje[0]) ustawIdSesji(d.sesje[0].id);
    });
  }, []);

  const utworz = async () => {
    try {
      const d = await api.post<{ token: string }>('/api/sesja', {
        pin,
        ustawienia: { kartyPrywatneNaPapierze: naPapierze },
      });
      ustawToken(d.token);
    } catch (b) {
      ustawBlad(b instanceof BladApi ? b.message : 'Nie udało się utworzyć sesji.');
    }
  };

  const dolacz = async () => {
    try {
      const d = await api.post<{ token: string }>(`/api/sesja/${encodeURIComponent(idSesji)}/pin`, { pin });
      ustawToken(d.token);
    } catch (b) {
      ustawBlad(b instanceof BladApi ? b.message : 'Nie udało się wejść do sesji.');
    }
  };

  return (
    <main className="uklad">
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Doodle nazwa="megafon" rozmiar={70} kolor="#f07a2b" />
        <h1>Prowadząca</h1>
      </header>

      {blad && <Komunikat wariant="blad" rola="alert">{blad}</Komunikat>}

      <Karteczka tytul="Nowa sesja" doodle="gwiazdka" tasma>
        <p>PIN chroni sterowanie grą i tryb omówienia. Zapamiętaj go — nie da się go odczytać z serwera.</p>
        <div className="pole">
          <label className="pole__etykieta" htmlFor="pin">
            PIN prowadzącej (4–6 cyfr)
          </label>
          <input
            id="pin"
            inputMode="numeric"
            value={pin}
            maxLength={6}
            onChange={(e) => ustawPin(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <label style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', minHeight: '48px' }}>
          <input
            type="checkbox"
            checked={naPapierze}
            style={{ width: '1.4rem', height: '1.4rem' }}
            onChange={(e) => ustawNaPapierze(e.target.checked)}
          />
          <span>Karty prywatne rozdaję na papierze (zalecane)</span>
        </label>
        <Przycisk wariant="glowny" rozmiar="duzy" szeroki disabled={pin.length < 4} onClick={() => void utworz()}>
          Utwórz sesję
        </Przycisk>
      </Karteczka>

      {sesje.length > 0 && (
        <Karteczka tytul="Wróć do trwającej sesji" doodle="zegar" wariant="bez" ksztalt={2}>
          <div className="pole">
            <label className="pole__etykieta" htmlFor="sesja">
              Sesja
            </label>
            <select id="sesja" value={idSesji} onChange={(e) => ustawIdSesji(e.target.value)}>
              {sesje.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} (faza {s.faza})
                </option>
              ))}
            </select>
          </div>
          <Przycisk disabled={pin.length < 4} onClick={() => void dolacz()}>
            Wejdź podanym PIN-em
          </Przycisk>
        </Karteczka>
      )}

      <Chmurka>
        Gra może się w całości odbyć na papierze. Aplikacja jest wygodą, nie warunkiem.
      </Chmurka>
      <Przycisk wariant="spokojny" onClick={() => idz('/')}>
        ← Wróć na rozdroże
      </Przycisk>
    </main>
  );
}
