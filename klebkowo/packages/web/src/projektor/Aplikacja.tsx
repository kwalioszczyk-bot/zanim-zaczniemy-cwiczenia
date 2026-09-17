/**
 * Tryb projektora: stoliki grają na papierze, prowadząca wprowadza ich decyzje.
 * Działa po otwarciu zbudowanej aplikacji bez backendu.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ID_STOLIKOW,
  przejdzDoNastepnejFazy,
  utworzSesje,
  wykonaj,
  zbudujKronike,
  type IdRundy,
  type IdStolika,
  type StanSesji,
  type Tresc,
} from '@klebkowo/engine';
import { KROKI_FAZY, NAZWY_FAZ } from '@klebkowo/engine/kroki';
import { Chmurka, EtykietaStolika, Karteczka, Komunikat, Przycisk, Separator } from '../ui/podstawowe.tsx';
import { Tory } from '../ui/Tory.tsx';
import { Wykres } from '../ui/Wykres.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { usunLokalnie, wczytajLokalnie, wczytajPelnaTresc, zapiszLokalnie } from '../lib/lokalnaGra.ts';

export function AplikacjaProjektora() {
  const [tresc, ustawTresc] = useState<Tresc | null>(null);
  const [sesja, ustawSesje] = useState<StanSesji | null>(null);
  const [blad, ustawBlad] = useState<string | null>(null);
  const [stolik, ustawStolik] = useState<IdStolika>('A');

  useEffect(() => {
    void wczytajPelnaTresc()
      .then((t) => {
        ustawTresc(t);
        ustawSesje(wczytajLokalnie());
      })
      .catch((b: Error) => ustawBlad(b.message));
  }, []);

  const zapisz = (nowa: StanSesji) => {
    ustawSesje(nowa);
    zapiszLokalnie(nowa);
  };

  const wykonajLokalnie = (id: IdStolika, polecenie: unknown, opId: string) => {
    if (!tresc || !sesja) return null;
    try {
      const wynik = wykonaj(tresc, sesja, { opId, stolik: id, polecenie: polecenie as never });
      zapisz(wynik.sesja);
      ustawBlad(null);
      return wynik.wynik;
    } catch (b) {
      ustawBlad((b as Error).message);
      return null;
    }
  };

  if (blad && !tresc)
    return (
      <main className="uklad">
        <Karteczka tytul="Treść gry jest niepoprawna" doodle="megafon" wariant="bez">
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{blad}</pre>
        </Karteczka>
      </main>
    );
  if (!tresc) return <main className="uklad"><p>Wczytuję treść gry…</p></main>;

  if (!sesja)
    return (
      <main className="uklad">
        <h1>Tryb projektora</h1>
        <Karteczka tytul="Gra na jednym urządzeniu" doodle="ekran" tasma>
          <p>
            Stoliki grają na papierze, a Ty wprowadzasz ich decyzje. Ten tryb nie potrzebuje serwera ani sieci — stan
            gry zostaje w tej przeglądarce.
          </p>
          <Przycisk
            wariant="glowny"
            rozmiar="duzy"
            onClick={() => zapisz(utworzSesje(tresc, { ustawienia: { kartyPrywatneNaPapierze: true, trybProjektora: true } }))}
          >
            Zacznij nową grę
          </Przycisk>
        </Karteczka>
      </main>
    );

  const runda: IdRundy | null = sesja.faza === 'R1' || sesja.faza === 'R2' || sesja.faza === 'R3' ? sesja.faza : null;
  const s = sesja.stoliki[stolik];
  const opisStolika = tresc.stoliki.find((x) => x.id === stolik)!;

  return (
    <main className="uklad uklad--szeroki">
      <header className="pasek">
        <div>
          <h1 className="pasek__tytul" style={{ color: 'inherit', textShadow: 'none' }}>
            {NAZWY_FAZ[sesja.faza]}
          </h1>
          <p className="pasek__opis">Tryb projektora · bez serwera · {sesja.id}</p>
        </div>
        <div className="przyciski">
          <Przycisk wariant="glowny" onClick={() => zapisz(przejdzDoNastepnejFazy(sesja))} doodle="strzalka">
            Następna faza
          </Przycisk>
          <Przycisk
            rozmiar="maly"
            onClick={() => {
              if (!confirm('Usunąć zapisaną grę z tej przeglądarki?')) return;
              usunLokalnie();
              ustawSesje(null);
            }}
          >
            Zakończ i usuń
          </Przycisk>
        </div>
      </header>

      {blad && <Komunikat wariant="blad" rola="alert">{blad}</Komunikat>}

      <Chmurka wariant="blekit">
        Kroki tej fazy: {KROKI_FAZY[sesja.faza].map((k) => k.etykieta).join(' → ')}
      </Chmurka>

      <div className="przyciski" role="tablist" aria-label="Stoliki" style={{ marginBottom: '1rem' }}>
        {ID_STOLIKOW.map((id) => (
          <Przycisk
            key={id}
            role="tab"
            aria-selected={id === stolik}
            wariant={id === stolik ? 'glowny' : ''}
            onClick={() => ustawStolik(id)}
          >
            Stolik {id}
          </Przycisk>
        ))}
      </div>

      <Karteczka tytul={opisStolika.nazwa} etykieta={`Stolik ${stolik}`} doodle="kartka" ksztalt={2}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
          <EtykietaStolika id={stolik} />
          {/* tory muszą dostać całą wolną szerokość, inaczej ściskają się do pasków */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tory liczniki={s.liczniki} definicje={tresc.liczniki.jawne} />
          </div>
        </div>

        {runda && (
          <>
            <Separator />
            <h3>Zdarzenia rundy {runda}</h3>
            {tresc.kolejnosc_zdarzen[stolik]![runda].map((idZdarzenia) => {
              const z = tresc.zdarzenia.find((x) => x.id === idZdarzenia)!;
              const juz = s.zdarzenia[runda].includes(idZdarzenia);
              return (
                <div key={idZdarzenia} style={{ marginBottom: '0.8rem' }}>
                  <strong>
                    {z.id} — {z.tytul}
                  </strong>
                  {juz ? (
                    <span className="znacznik-ochrony" style={{ marginLeft: '0.6rem' }}>
                      rozstrzygnięte
                    </span>
                  ) : z.wybor ? (
                    <div className="przyciski" style={{ marginTop: '0.4rem' }}>
                      {z.wybor.map((w, i) => (
                        <Przycisk
                          key={i}
                          rozmiar="maly"
                          onClick={() => wykonajLokalnie(stolik, { typ: 'zdarzenie', zdarzenie: z.id, wybor: i }, `${stolik}:${runda}:${z.id}`)}
                        >
                          {w.etykieta}
                        </Przycisk>
                      ))}
                    </div>
                  ) : (
                    <Przycisk
                      rozmiar="maly"
                      style={{ marginLeft: '0.6rem' }}
                      onClick={() => wykonajLokalnie(stolik, { typ: 'zdarzenie', zdarzenie: z.id }, `${stolik}:${runda}:${z.id}`)}
                    >
                      Rozstrzygnij
                    </Przycisk>
                  )}
                </div>
              );
            })}

            <Separator />
            <h3>Decyzja</h3>
            <PanelDecyzji
              tresc={tresc}
              stolik={stolik}
              runda={runda}
              juzWybrana={runda === 'R3' ? s.decyzje.r3?.opcja : s.decyzje.r1?.opcja}
              wykonaj={wykonajLokalnie}
            />

            <Separator />
            <h3>Działania (wybrane: {s.akcje[runda].join(', ') || 'brak'})</h3>
            <div className="przyciski">
              {tresc.akcje.map((a) => (
                <Przycisk
                  key={a.id}
                  rozmiar="maly"
                  disabled={s.akcje[runda].includes(a.id)}
                  onClick={() => wykonajLokalnie(stolik, { typ: 'akcje', akcje: [a.id] }, `${stolik}:${runda}:akcja:${a.id}`)}
                >
                  {a.id} {a.nazwa}
                </Przycisk>
              ))}
            </div>

            <Separator />
            <div className="przyciski">
              <Przycisk
                wariant="spokojny"
                onClick={() => wykonajLokalnie(stolik, { typ: 'sprawdz-zobowiazania' }, `${stolik}:${runda}:zob`)}
              >
                Sprawdź zobowiązania
              </Przycisk>
              {runda === 'R2' && (
                <Przycisk
                  wariant="spokojny"
                  onClick={() => wykonajLokalnie(stolik, { typ: 'wydaj-skutek', ktora: 'r1' }, `${stolik}:R2:skutek`)}
                >
                  Wydaj skutek decyzji z rundy 1
                </Przycisk>
              )}
            </div>
          </>
        )}

        {sesja.faza === 'F' && (
          <>
            <Separator />
            <Przycisk
              wariant="glowny"
              onClick={() => wykonajLokalnie(stolik, { typ: 'wydaj-skutek', ktora: 'r3' }, `${stolik}:F:skutek`)}
            >
              Wydaj skutek decyzji z rundy 3
            </Przycisk>
            <Kronika tresc={tresc} sesja={sesja} stolik={stolik} />
          </>
        )}
      </Karteczka>

      <Komunikat wariant="cicho" doodle="kot" rola="none">
        Stan gry zostaje wyłącznie w tej przeglądarce. Nic nie jest wysyłane na żaden serwer.
      </Komunikat>
    </main>
  );
}

function PanelDecyzji({
  tresc,
  stolik,
  runda,
  juzWybrana,
  wykonaj,
}: {
  tresc: Tresc;
  stolik: IdStolika;
  runda: IdRundy;
  juzWybrana: string | undefined;
  wykonaj: (id: IdStolika, polecenie: unknown, opId: string) => unknown;
}) {
  const ktora = runda === 'R3' ? 'r3' : 'r1';
  const opis = tresc.stoliki.find((x) => x.id === stolik)!;
  const d = ktora === 'r3' ? opis.decyzja_r3 : opis.decyzja_r1;
  if (runda === 'R2') return <p className="pole__podpowiedz">W rundzie 2 nie ma decyzji.</p>;
  if (juzWybrana)
    return (
      <p>
        Zapisano: <strong>{juzWybrana}</strong> — {d.opcje[juzWybrana]}
      </p>
    );
  return (
    <div className="przyciski">
      {Object.entries(d.opcje).map(([klucz, tekst]) => (
        <Przycisk
          key={klucz}
          rozmiar="maly"
          onClick={() => wykonaj(stolik, { typ: 'decyzja', ktora, opcja: klucz }, `${stolik}:${ktora}:decyzja`)}
        >
          {klucz}: {tekst}
        </Przycisk>
      ))}
    </div>
  );
}

function Kronika({ tresc, sesja, stolik }: { tresc: Tresc; sesja: StanSesji; stolik: IdStolika }) {
  const k = useMemo(() => zbudujKronike(tresc, sesja.stoliki[stolik]), [tresc, sesja, stolik]);
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ fontFamily: "'Caveat Brush', cursive", fontSize: '1.6rem' }}>{k.naglowek}</h3>
      {k.zdania.map((z) => (
        <p key={z}>{z}</p>
      ))}
      <Wykres dane={k.wykres} tytul={`Koszty decyzji — stolik ${stolik}`} />
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.2rem' }}>{k.podpis}</p>
      <div style={{ textAlign: 'center' }}>
        <Doodle nazwa="kot" rozmiar={60} kolor="#7db83a" />
      </div>
    </div>
  );
}
