/** Panele poszczególnych kroków rundy przy stoliku. */
import { useEffect, useMemo, useState } from 'react';
import type { OpisKroku } from '@klebkowo/engine/kroki';
import type { IdRundy } from '@klebkowo/engine/typy';
import { Chmurka, Karteczka, Komunikat, Przycisk, Separator } from '../ui/podstawowe.tsx';
import { Doodle } from '../ui/Doodle.tsx';
import { KartaSkutku, KartaZdarzenia, Zmiany } from './karty.tsx';
import { TrybPodawania, type KartaPrywatna } from './TrybPodawania.tsx';
import type { KartyRundy, StanWidoku } from './typy.ts';

export interface PropsPanelu {
  krok: OpisKroku;
  stan: StanWidoku;
  runda: IdRundy | null;
  karty: KartyRundy;
  zapamietaj: (zmiana: (k: KartyRundy) => KartyRundy) => void;
  wykonaj: <T>(opId: string, polecenie: unknown) => Promise<T | null>;
  zajety: boolean;
  dalej: () => void;
  wstecz: () => void;
  pierwszyKrok: boolean;
}

export function PanelKroku(props: PropsPanelu) {
  const { krok, stan, dalej, wstecz, pierwszyKrok, wykonaj } = props;

  const oznaczKrok = () => {
    void wykonaj(`${stan.stolik.id}:${stan.sesja.faza}:krok:${krok.id}`, { typ: 'krok', krok: krok.id });
    dalej();
  };

  return (
    <>
      <Chmurka wariant="blekit">{krok.wskazowka}</Chmurka>
      {zawartosc(props, oznaczKrok)}
      <div className="przyciski przyciski--rozstrzelone" style={{ marginTop: '1.2rem' }}>
        <Przycisk wariant="spokojny" rozmiar="maly" onClick={wstecz} disabled={pierwszyKrok}>
          ← Poprzedni krok
        </Przycisk>
        {krok.id !== 'zatwierdzenie' && krok.id !== 'wyjscie' && (
          <Przycisk wariant="drugi" onClick={oznaczKrok}>
            Dalej →
          </Przycisk>
        )}
      </div>
    </>
  );
}

function zawartosc(p: PropsPanelu, oznaczKrok: () => void) {
  switch (p.krok.id) {
    case 'role':
      return <KrokRole {...p} />;
    case 'karty':
      return <KrokKarty {...p} naKoniec={oznaczKrok} />;
    case 'sprawdzenie-zobowiazan':
      return <KrokSprawdzenia {...p} />;
    case 'skutek':
      return <KrokPoczty {...p} />;
    case 'koperty':
      return <KrokKopert {...p} naKoniec={oznaczKrok} />;
    case 'zdarzenia':
      return <KrokZdarzen {...p} />;
    case 'informacje':
      return <KrokInformacji {...p} naKoniec={oznaczKrok} />;
    case 'zwrot':
      return <KrokZwrotu {...p} />;
    case 'decyzja':
      return <KrokDecyzji {...p} />;
    case 'akcje':
      return <KrokAkcji {...p} />;
    case 'zobowiazania':
      return <KrokZobowiazan {...p} />;
    case 'zatwierdzenie':
      return <KrokZatwierdzenia {...p} />;
    case 'kronika':
      return <KrokKroniki {...p} />;
    case 'wykres':
      return <KrokWykresu {...p} />;
    case 'wyjscie':
      return <KrokWyjscia {...p} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ R0: role */

function KrokRole({ stan, wykonaj, zajety }: PropsPanelu) {
  const [sektory, ustawSektory] = useState<string[]>(() => Array(5).fill('inny'));
  const [ostrzezenie, ustawOstrzezenie] = useState<string | null>(null);
  const przydzielone = Object.keys(stan.stolik.przydzialRol).length > 0;
  const naPapierze = stan.sesja.ustawienia.kartyPrywatneNaPapierze;

  const losuj = async () => {
    const wynik = await wykonaj<{ ostrzezenie?: string }>(`${stan.stolik.id}:role`, { typ: 'losuj-role', sektory });
    ustawOstrzezenie(wynik?.ostrzezenie ?? null);
  };

  if (przydzielone)
    return (
      <Karteczka tytul="Role rozdane" doodle="ludzie" wariant="zielen">
        <ul className="fakty">
          {Object.entries(stan.stolik.przydzialRol).map(([osoba, rola]) => {
            const opis = stan.tresc.role.find((r) => r.id === rola);
            return (
              <li key={osoba}>
                <span>
                  <strong>Osoba {osoba}</strong> → {rola}: {opis?.nazwa}
                </span>
              </li>
            );
          })}
        </ul>
        {ostrzezenie && (
          <Komunikat wariant="uwaga" doodle="megafon">
            {ostrzezenie}
          </Komunikat>
        )}
        <p className="pole__podpowiedz" style={{ marginTop: '0.8rem' }}>
          Obszary pracy nie zostały nigdzie zapisane — w pamięci gry jest wyłącznie „Osoba → rola”.
        </p>
      </Karteczka>
    );

  if (naPapierze)
    return (
      <Karteczka tytul="Karty ról rozdaje prowadząca" doodle="koperta" wariant="bez">
        <p>Weźcie po jednej karcie roli. Jeśli ktoś dostał rolę ze swojej własnej branży — zamieńcie się kartami.</p>
        <Chmurka wariant="zielen">Nikt nie gra własnego zawodu ani własnej instytucji.</Chmurka>
      </Karteczka>
    );

  return (
    <Karteczka tytul="Kto przy stoliku pracuje gdzie?" doodle="ludzie">
      <p>
        Aplikacja pyta wyłącznie o obszar pracy — i tylko po to, żeby nikt nie zagrał własnego zawodu. Nie pytamy o
        imiona ani o nic więcej, a odpowiedzi nie są zapisywane.
      </p>
      {sektory.map((wartosc, i) => (
        <div className="pole" key={i}>
          <label className="pole__etykieta" htmlFor={`osoba-${i}`}>
            Osoba {i + 1} — obszar pracy
          </label>
          <select
            id={`osoba-${i}`}
            value={wartosc}
            onChange={(e) => ustawSektory((s) => s.map((x, j) => (j === i ? e.target.value : x)))}
          >
            {stan.tresc.sektory_uczestnikow.map((s) => (
              <option key={s.id} value={s.id}>
                {s.etykieta}
              </option>
            ))}
          </select>
        </div>
      ))}
      <Przycisk wariant="glowny" onClick={() => void losuj()} disabled={zajety} doodle="kostka">
        Rozdaj role
      </Przycisk>
    </Karteczka>
  );
}

/* ------------------------------------------------------------- R0: karty ról */

function KrokKarty({ stan, naKoniec }: PropsPanelu & { naKoniec: () => void }) {
  const naPapierze = stan.sesja.ustawienia.kartyPrywatneNaPapierze;
  const przydzial = stan.stolik.przydzialRol;

  const karty: KartaPrywatna[] = useMemo(
    () =>
      Object.entries(przydzial).map(([osoba, idRoli]) => {
        const r = stan.tresc.role.find((x) => x.id === idRoli)!;
        return {
          rola: `Osoba ${osoba}`,
          naglowek: r.nazwa,
          tresc: `${r.motywacja} Twoje słowo-klucz: „${r.slowo_klucz}”. ${r.slowo_klucz_opis}`,
          dodatek: r.druga_rola ?? undefined,
        };
      }),
    [przydzial, stan.tresc.role],
  );

  return (
    <>
      <Karteczka tytul={stan.tresc.stolik.nazwa} etykieta="Wasza misja" doodle="gwiazdka" wariant="zielen" tasma>
        <p style={{ fontSize: '1.15rem' }}>{stan.tresc.stolik.misja}</p>
      </Karteczka>

      <Karteczka tytul="Role przy tym stoliku" doodle="ludzie" ksztalt={2}>
        <ul className="fakty">
          {stan.tresc.role.map((r) => (
            <li key={r.id}>
              <span>
                <strong>{r.id}</strong> — {r.nazwa} ({stan.tresc.instytucje[r.instytucja]})
              </span>
            </li>
          ))}
        </ul>
      </Karteczka>

      {karty.length > 0 && (
        <TrybPodawania
          karty={karty}
          naPapierze={naPapierze}
          etykietaKoperty={`${stan.stolik.id} — karty ról`}
          naKoniec={naKoniec}
          zakonczone={false}
        />
      )}
    </>
  );
}

/* --------------------------------------------------- sprawdzenie zobowiązań */

function KrokSprawdzenia({ stan, runda, karty, zapamietaj, wykonaj, zajety }: PropsPanelu) {
  const poprzednia = runda === 'R2' ? 'R1' : runda === 'R3' ? 'R2' : null;
  const doSprawdzenia = stan.stolik.zobowiazania.filter((z) => z.runda === poprzednia && z.status === 'oczekuje');
  const prog = stan.tresc.zobowiazania.prog_obciazenia;
  const obciazenie = stan.stolik.liczniki.obciazenie ?? 0;
  const kostkaPotrzebna = obciazenie >= prog;
  const [rzuty, ustawRzuty] = useState<Record<string, string>>({});

  if (!poprzednia || (!doSprawdzenia.length && !karty.zobowiazania.length))
    return (
      <Karteczka tytul="Brak zobowiązań do sprawdzenia" doodle="kartka" wariant="cicho">
        <p>W poprzedniej rundzie nie podjęliście żadnych zobowiązań. Idziemy dalej.</p>
      </Karteczka>
    );

  const sprawdz = async () => {
    const podane: Record<string, { wartosc: number; zrodlo: 'fizyczna' | 'wirtualna' }> = {};
    for (const [id, wartosc] of Object.entries(rzuty))
      if (wartosc) podane[id] = { wartosc: Number(wartosc), zrodlo: 'fizyczna' };
    const wynik = await wykonaj<KartyRundy['zobowiazania']>(`${stan.stolik.id}:${runda}:zobowiazania-sprawdzenie`, {
      typ: 'sprawdz-zobowiazania',
      rzuty: podane,
    });
    if (wynik) zapamietaj((k) => ({ ...k, zobowiazania: wynik }));
  };

  return (
    <>
      {doSprawdzenia.length > 0 && (
        <Karteczka tytul="Co obiecaliście w poprzedniej rundzie" doodle="kartka" wariant="bez">
          <ul className="fakty">
            {doSprawdzenia.map((z) => (
              <li key={z.id}>
                <span>
                  <strong>{z.rola}</strong>: {z.co} — {z.doKiedy}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          {kostkaPotrzebna ? (
            <>
              <Komunikat wariant="uwaga" doodle="kostka">
                Obciążenie wynosi {obciazenie}, czyli {prog} lub więcej. Dla każdego zobowiązania
                rzućcie kostką: 1–3 niezrealizowane, 4–6 zrealizowane.
              </Komunikat>
              {doSprawdzenia.map((z) => (
                <div className="pole" key={z.id}>
                  <label className="pole__etykieta" htmlFor={`rzut-${z.id}`}>
                    Wynik rzutu dla: {z.co}
                  </label>
                  <input
                    id={`rzut-${z.id}`}
                    type="number"
                    min={1}
                    max={6}
                    inputMode="numeric"
                    value={rzuty[z.id] ?? ''}
                    placeholder="wpisz 1–6 albo zostaw puste"
                    onChange={(e) => ustawRzuty((r) => ({ ...r, [z.id]: e.target.value }))}
                  />
                  <span className="pole__podpowiedz">
                    Rzućcie fizyczną kostką i wpiszcie wynik albo zostawcie pole puste — wtedy zagra kostka wirtualna.
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p>
              Obciążenie wynosi {obciazenie}, czyli mniej niż {prog}. Zobowiązania są zrealizowane
              — kostka nie jest potrzebna.
            </p>
          )}
          <Przycisk wariant="glowny" onClick={() => void sprawdz()} disabled={zajety} doodle="kostka">
            {kostkaPotrzebna ? 'Rozstrzygnij zobowiązania' : 'Zapisz zobowiązania jako zrealizowane'}
          </Przycisk>
        </Karteczka>
      )}

      {karty.zobowiazania.map((z) => (
        <Karteczka
          key={z.id}
          tytul={z.status === 'zrealizowane' ? 'Zobowiązanie zrealizowane' : 'Zobowiązanie niezrealizowane'}
          etykieta={`${z.rola}`}
          doodle={z.status === 'zrealizowane' ? 'gwiazdka' : 'chmurka'}
          wariant={z.status === 'zrealizowane' ? 'zielen' : 'bez'}
          ksztalt={3}
        >
          <p>{z.co}</p>
          <p className="pole__podpowiedz">
            Obciążenie przy sprawdzeniu: {z.obciazenie}
            {z.rzut ? ` · rzut kostką: ${z.rzut}` : ''}
          </p>
          <Zmiany zmiany={z.zmiany} definicje={stan.tresc.liczniki.jawne} />
        </Karteczka>
      ))}
    </>
  );
}

/* ------------------------------------------------------------ poczta / skutek */

function KrokPoczty({ stan, runda, karty, zapamietaj, wykonaj }: PropsPanelu) {
  const ktora = stan.sesja.faza === 'F' ? 'r3' : 'r1';
  const [pobrane, ustawPobrane] = useState(false);

  useEffect(() => {
    if (pobrane || karty.skutek) return;
    ustawPobrane(true);
    void (async () => {
      const wynik = await wykonaj<KartyRundy['skutek']>(`${stan.stolik.id}:${stan.sesja.faza}:skutek:${ktora}`, {
        typ: 'wydaj-skutek',
        ktora,
      });
      if (wynik) zapamietaj((k) => ({ ...k, skutek: wynik }));
    })();
  }, [pobrane, karty.skutek, ktora, stan.sesja.faza, stan.stolik.id, wykonaj, zapamietaj]);

  if (karty.skutek)
    return (
      <KartaSkutku
        tytul={karty.skutek.tytul}
        tekst={karty.skutek.tekst}
        zmiany={karty.skutek.zmiany}
        zlagodzony={karty.skutek.zlagodzony}
        definicje={stan.tresc.liczniki.jawne}
      />
    );

  return (
    <Karteczka tytul="Poczta dzielnicowa" doodle="koperta" wariant="cicho" ksztalt={2}>
      <p>Dziś bez pilnych wiadomości. Praca toczy się dalej.</p>
    </Karteczka>
  );
}

/* ------------------------------------------------------------------- koperty */

function KrokKopert({ stan, naKoniec }: PropsPanelu & { naKoniec: () => void }) {
  const przydzial = stan.stolik.przydzialRol;
  const pary = Object.entries(przydzial);
  const karty: KartaPrywatna[] = (pary.length ? pary : stan.tresc.role.map((r, i) => [String(i + 1), r.id] as const)).map(
    ([osoba, idRoli]) => {
      const r = stan.tresc.role.find((x) => x.id === idRoli)!;
      return {
        rola: pary.length ? `Osoba ${osoba}` : r.id,
        naglowek: `wiadomość dla roli ${r.id}`,
        tresc: r.wiadomosc_od_przelozonego,
      };
    },
  );

  return (
    <>
      <Karteczka tytul="Koperty od przełożonych" doodle="koperta" wariant="brzoskwinia" ksztalt={2} tasma>
        <p>
          Każda instytucja ma swoje oczekiwania. Przeczytajcie wiadomość w milczeniu — o treści możecie mówić, kart nie
          pokazujecie.
        </p>
      </Karteczka>
      <TrybPodawania
        karty={karty}
        naPapierze={stan.sesja.ustawienia.kartyPrywatneNaPapierze}
        etykietaKoperty={`${stan.stolik.id} — koperty „Otworzyć w rundzie 2”`}
        naKoniec={naKoniec}
        zakonczone={false}
      />
    </>
  );
}

/* ----------------------------------------------------------------- zdarzenia */

function KrokZdarzen({ stan, runda, karty, zapamietaj, wykonaj, zajety }: PropsPanelu) {
  const [wybor, ustawWybor] = useState<Record<string, number>>({});
  if (!runda) return null;

  const rozstrzygniete = stan.stolik.zdarzenia[runda];
  const doRozstrzygniecia = stan.zdarzeniaRundy.filter((id) => !rozstrzygniete.includes(id));
  const biezace = doRozstrzygniecia[0];
  const opis = biezace ? stan.tresc.zdarzenia.find((z) => z.id === biezace) : null;

  const rozstrzygnij = async () => {
    if (!opis) return;
    const wynik = await wykonaj<KartyRundy['zdarzenia'][number]>(`${stan.stolik.id}:${runda}:zdarzenie:${opis.id}`, {
      typ: 'zdarzenie',
      zdarzenie: opis.id,
      ...(opis.wybor ? { wybor: wybor[opis.id] ?? 0 } : {}),
    });
    if (wynik) zapamietaj((k) => ({ ...k, zdarzenia: [...k.zdarzenia, wynik] }));
  };

  return (
    <>
      {karty.zdarzenia.map((z) => (
        <KartaZdarzenia key={z.zdarzenie} {...z} definicje={stan.tresc.liczniki.jawne} />
      ))}

      {opis && (
        <Karteczka tytul={opis.tytul} etykieta="Nowe zdarzenie" doodle="chmurka" wariant="blekit" ksztalt={2} tasma>
          <p style={{ fontSize: '1.1rem' }}>{opis.tekst}</p>
          {opis.wybor && (
            <>
              <h3>Jak reagujecie?</h3>
              <div className="wybor" role="group" aria-label="Reakcja zespołu">
                {opis.wybor.map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    className="wybor__opcja"
                    aria-pressed={(wybor[opis.id] ?? -1) === i}
                    onClick={() => ustawWybor((s) => ({ ...s, [opis.id]: i }))}
                  >
                    <span className="wybor__znak" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{w.etykieta}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <Przycisk
            wariant="glowny"
            onClick={() => void rozstrzygnij()}
            disabled={zajety || (Boolean(opis.wybor) && wybor[opis.id] === undefined)}
          >
            {opis.wybor ? 'Zapisz naszą reakcję' : 'Przyjmujemy do wiadomości'}
          </Przycisk>
        </Karteczka>
      )}

      {!opis && karty.zdarzenia.length === 0 && (
        <Karteczka tytul="Spokojna runda" doodle="slonce" wariant="cicho">
          <p>W tej rundzie nic Was nie zaskoczyło.</p>
        </Karteczka>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- informacje */

function KrokInformacji({ stan, runda, naKoniec }: PropsPanelu & { naKoniec: () => void }) {
  const ktora = runda === 'R3' ? 'decyzja_r3' : 'decyzja_r1';
  const d = stan.tresc.stolik[ktora];
  const karty: KartaPrywatna[] = Object.entries(d.informacje_unikalne).map(([rola, tekst]) => ({
    rola,
    naglowek: `informacja tylko dla roli ${rola}`,
    tresc: tekst,
  }));

  return (
    <>
      <Karteczka tytul="Co wiedzą wszyscy" doodle="ludzie" wariant="zielen" ksztalt={2}>
        <ul className="fakty">
          {d.informacje_wspolne.map((i) => (
            <li key={i}>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </Karteczka>
      <TrybPodawania
        karty={karty}
        naPapierze={stan.sesja.ustawienia.kartyPrywatneNaPapierze}
        etykietaKoperty={`${stan.stolik.id} — informacje, ${runda === 'R3' ? 'runda 3' : 'runda 1'}`}
        naKoniec={naKoniec}
        zakonczone={false}
      />
      <Chmurka>
        Możecie mówić o wszystkim, co wiecie. <strong>Kart nie pokazujecie.</strong>
      </Chmurka>
    </>
  );
}

/* --------------------------------------------------------------- zwrot akcji */

function KrokZwrotu({ stan }: PropsPanelu) {
  return (
    <Karteczka
      tytul={stan.tresc.stolik.zwrot_akcji.tytul}
      etykieta="Zwrot akcji"
      doodle="megafon"
      wariant="brzoskwinia"
      ksztalt={3}
      tasma
    >
      <p style={{ fontSize: '1.15rem' }}>{stan.tresc.stolik.zwrot_akcji.tekst}</p>
    </Karteczka>
  );
}

/* ------------------------------------------------------------------- decyzja */

function KrokDecyzji({ stan, runda, karty, zapamietaj, wykonaj, zajety }: PropsPanelu) {
  const ktora = runda === 'R3' ? 'r3' : 'r1';
  const d = ktora === 'r3' ? stan.tresc.stolik.decyzja_r3 : stan.tresc.stolik.decyzja_r1;
  const juz = stan.stolik.decyzje.find((x) => x.ktora === ktora);
  const [wybrana, ustawWybrana] = useState<string | null>(null);

  const zapisz = async () => {
    if (!wybrana) return;
    const wynik = await wykonaj<{ komunikat: string }>(`${stan.stolik.id}:${ktora}:decyzja`, {
      typ: 'decyzja',
      ktora,
      opcja: wybrana,
    });
    if (wynik) zapamietaj((k) => ({ ...k, decyzja: { komunikat: wynik.komunikat } }));
  };

  if (juz)
    return (
      <Karteczka tytul="Decyzja zapisana." doodle="kartka" wariant="cicho" ksztalt={2}>
        <p>
          Wybraliście opcję <strong>{juz.opcja}</strong>: {d.opcje[juz.opcja]}
        </p>
        <p className="pole__podpowiedz">{stan.tresc.komunikat_decyzji}</p>
      </Karteczka>
    );

  return (
    <Karteczka tytul={d.pytanie} etykieta="Decyzja zespołu" doodle="sciezka" ksztalt={2}>
      <div className="wybor" role="group" aria-label={d.pytanie}>
        {Object.entries(d.opcje).map(([klucz, tekst]) => (
          <button
            key={klucz}
            type="button"
            className="wybor__opcja"
            aria-pressed={wybrana === klucz}
            onClick={() => ustawWybrana(klucz)}
          >
            <span className="wybor__znak" aria-hidden="true">
              {klucz}
            </span>
            <span>{tekst}</span>
          </button>
        ))}
      </div>
      <Przycisk wariant="glowny" onClick={() => void zapisz()} disabled={zajety || !wybrana}>
        Zapisz decyzję zespołu
      </Przycisk>
      {karty.decyzja && <Komunikat doodle="kartka">{karty.decyzja.komunikat}</Komunikat>}
    </Karteczka>
  );
}

/* --------------------------------------------------------------------- akcje */

function KrokAkcji({ stan, runda, karty, zapamietaj, wykonaj, zajety }: PropsPanelu) {
  const [wybrane, ustawWybrane] = useState<string[]>([]);
  if (!runda) return null;

  const juz = stan.stolik.akcje[runda];
  const prog = stan.tresc.liczniki.wyczerpanie.prog_obciazenia;
  const wyczerpany = (stan.stolik.liczniki.obciazenie ?? 0) >= prog;
  const limit = wyczerpany ? 1 : stan.tresc.limit_akcji_na_runde;
  const zostalo = limit - juz.length;

  const przelacz = (id: string) =>
    ustawWybrane((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < zostalo ? [...s, id] : s));

  const zapisz = async () => {
    const wynik = await wykonaj<KartyRundy['akcje']>(`${stan.stolik.id}:${runda}:akcje:${wybrane.join('-')}`, {
      typ: 'akcje',
      akcje: wybrane,
    });
    if (wynik) {
      zapamietaj((k) => ({ ...k, akcje: [...k.akcje, ...wynik] }));
      ustawWybrane([]);
    }
  };

  return (
    <>
      {wyczerpany && (
        <Komunikat wariant="uwaga" doodle="kawa">
          {stan.tresc.liczniki.wyczerpanie.komunikat}
        </Komunikat>
      )}

      <Karteczka
        tytul="Co robicie w tej rundzie?"
        etykieta={zostalo > 0 ? `Zostało działań: ${zostalo}` : 'Komplet działań'}
        doodle="strzalka"
      >
        <div className="wybor" role="group" aria-label="Działania zespołu">
          {stan.tresc.akcje.map((a) => {
            const juzWybrana = juz.includes(a.id);
            const zablokowana = juzWybrana || (wyczerpany && a.duza);
            const zaznaczona = wybrane.includes(a.id);
            const chroniona = stan.stolik.ochrony.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                className={`wybor__opcja${zaznaczona ? ' wybor__opcja--wybrana' : ''}`}
                aria-pressed={zaznaczona}
                disabled={zablokowana || (!zaznaczona && wybrane.length >= zostalo)}
                onClick={() => przelacz(a.id)}
              >
                <span className="wybor__znak" aria-hidden="true">
                  {a.id.replace('A', '')}
                </span>
                <span>
                  <strong>{a.nazwa}</strong>
                  {a.duza && <span className="karteczka__etykieta" style={{ marginLeft: '0.5rem' }}>duże działanie</span>}
                  {chroniona && (
                    <span className="znacznik-ochrony" style={{ marginLeft: '0.5rem' }}>
                      <Doodle nazwa="gwiazdka" rozmiar={14} /> już macie
                    </span>
                  )}
                  <br />
                  <span style={{ fontSize: '0.98rem' }}>{a.opis}</span>
                  <br />
                  <span className="pole__podpowiedz">{opiszKoszt(a.efekt, stan.tresc.liczniki.jawne)}</span>
                  {juzWybrana && <span className="pole__podpowiedz"> · wybrane w tej rundzie</span>}
                </span>
              </button>
            );
          })}
        </div>
        <Przycisk wariant="glowny" onClick={() => void zapisz()} disabled={zajety || !wybrane.length}>
          Zapisz działania
        </Przycisk>
      </Karteczka>

      {karty.akcje.map((a, i) => (
        <Karteczka key={`${a.akcja}-${i}`} tytul={a.nazwa} etykieta="Działanie" doodle="strzalka" wariant="zielen" ksztalt={3}>
          {a.komunikat && <p>{a.komunikat}</p>}
          <Zmiany zmiany={a.zmiany} definicje={stan.tresc.liczniki.jawne} />
        </Karteczka>
      ))}
    </>
  );
}

function opiszKoszt(efekt: Record<string, number>, definicje: { id: string; nazwa: string }[]): string {
  const wpisy = Object.entries(efekt).filter(([, d]) => d !== 0);
  if (!wpisy.length) return 'Bez wpływu na liczniki.';
  return wpisy
    .map(([id, d]) => `${definicje.find((x) => x.id === id)?.nazwa ?? id} ${d > 0 ? '+' : '−'}${Math.abs(d)}`)
    .join(' · ');
}

/* -------------------------------------------------------------- zobowiązania */

function KrokZobowiazan({ stan, runda, wykonaj, zajety }: PropsPanelu) {
  const [lista, ustawListe] = useState([{ rola: 'R1', co: '', doKiedy: '' }]);
  if (!runda) return null;

  const wRundzie = stan.stolik.zobowiazania.filter((z) => z.runda === runda);
  const limit = stan.tresc.zobowiazania.limit_na_runde;
  const zostalo = limit - wRundzie.length;
  const blokadaR1 = stan.stolik.blokadaZobowiazanR1 === runda;

  const zapisz = async () => {
    const doWyslania = lista.filter((z) => z.co.trim());
    if (!doWyslania.length) return;
    await wykonaj(`${stan.stolik.id}:${runda}:zobowiazania:${wRundzie.length}`, {
      typ: 'zobowiazania',
      lista: doWyslania,
    });
    ustawListe([{ rola: 'R1', co: '', doKiedy: '' }]);
  };

  return (
    <Karteczka tytul="Kto co robi do następnej rundy?" doodle="kartka" etykieta={`Zostało: ${Math.max(0, zostalo)}`}>
      {blokadaR1 && (
        <Komunikat wariant="uwaga" doodle="chmurka">
          W tej rundzie rola R1 nie może podejmować zobowiązań.
        </Komunikat>
      )}

      {wRundzie.length > 0 && (
        <ul className="fakty" style={{ marginBottom: '1rem' }}>
          {wRundzie.map((z) => (
            <li key={z.id}>
              <span>
                <strong>{z.rola}</strong>: {z.co} — {z.doKiedy}
              </span>
            </li>
          ))}
        </ul>
      )}

      {zostalo > 0 ? (
        <>
          {lista.slice(0, zostalo).map((z, i) => (
            <fieldset key={i} style={{ border: 0, padding: 0, margin: '0 0 1rem' }}>
              <legend className="pole__etykieta">Zobowiązanie {wRundzie.length + i + 1}</legend>
              <div className="pole">
                <label className="pole__etykieta" htmlFor={`rola-${i}`}>
                  Kto (rola)
                </label>
                <select
                  id={`rola-${i}`}
                  value={z.rola}
                  onChange={(e) => ustawListe((s) => s.map((x, j) => (j === i ? { ...x, rola: e.target.value } : x)))}
                >
                  {stan.tresc.role
                    .filter((r) => !(blokadaR1 && r.id === 'R1'))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id} — {r.nazwa}
                      </option>
                    ))}
                </select>
              </div>
              <div className="pole">
                <label className="pole__etykieta" htmlFor={`co-${i}`}>
                  Co
                </label>
                <input
                  id={`co-${i}`}
                  value={z.co}
                  maxLength={160}
                  onChange={(e) => ustawListe((s) => s.map((x, j) => (j === i ? { ...x, co: e.target.value } : x)))}
                />
              </div>
              <div className="pole">
                <label className="pole__etykieta" htmlFor={`kiedy-${i}`}>
                  Do kiedy
                </label>
                <input
                  id={`kiedy-${i}`}
                  value={z.doKiedy}
                  maxLength={80}
                  placeholder="np. do następnej rundy"
                  onChange={(e) => ustawListe((s) => s.map((x, j) => (j === i ? { ...x, doKiedy: e.target.value } : x)))}
                />
              </div>
            </fieldset>
          ))}
          <div className="przyciski">
            <Przycisk wariant="glowny" onClick={() => void zapisz()} disabled={zajety}>
              Zapisz zobowiązanie
            </Przycisk>
            {lista.length < zostalo && (
              <Przycisk wariant="spokojny" rozmiar="maly" onClick={() => ustawListe((s) => [...s, { rola: 'R1', co: '', doKiedy: '' }])}>
                + Jeszcze jedno
              </Przycisk>
            )}
          </div>
        </>
      ) : (
        <p>Macie komplet zobowiązań na tę rundę.</p>
      )}
      <p className="pole__podpowiedz" style={{ marginTop: '0.8rem' }}>
        {stan.tresc.zobowiazania.zasada}
      </p>
    </Karteczka>
  );
}

/* --------------------------------------------------------------- zatwierdzenie */

function KrokZatwierdzenia({ stan, runda, wykonaj, zajety }: PropsPanelu) {
  return (
    <Karteczka tytul="Zamykamy rundę?" doodle="gwiazdka" wariant="zielen" tasma>
      <p>Sprawdźcie, czy wszystko jest zapisane. Po zatwierdzeniu poczekacie na pozostałe zespoły.</p>
      {runda && (
        <ul className="fakty">
          <li>
            <span>Działania: {stan.stolik.akcje[runda].join(', ') || 'brak'}</span>
          </li>
          <li>
            <span>Zobowiązania: {stan.stolik.zobowiazania.filter((z) => z.runda === runda).length}</span>
          </li>
        </ul>
      )}
      <Przycisk
        wariant="glowny"
        rozmiar="duzy"
        szeroki
        disabled={zajety}
        onClick={() => void wykonaj(`${stan.stolik.id}:${stan.sesja.faza}:zatwierdz`, { typ: 'zatwierdz' })}
      >
        Zatwierdzamy rundę
      </Przycisk>
    </Karteczka>
  );
}

/* -------------------------------------------------------------------- finał */

function KrokKroniki({ stan }: PropsPanelu) {
  if (!stan.kronika) return null;
  return (
    <Karteczka tytul={stan.kronika.tytul} doodle="kartka" wariant="bez" ksztalt={2} tasma>
      <h3 style={{ fontFamily: "'Caveat Brush', cursive", fontSize: '1.8rem', lineHeight: 1.15 }}>
        {stan.kronika.naglowek}
      </h3>
      {stan.kronika.zdania.map((z) => (
        <p key={z} style={{ fontSize: '1.1rem' }}>
          {z}
        </p>
      ))}
      <Separator />
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.35rem' }}>{stan.kronika.podpis}</p>
    </Karteczka>
  );
}

function KrokWykresu({ stan }: PropsPanelu) {
  return (
    <Karteczka tytul="Jak zmieniały się Wasze liczniki" doodle="zegar" ksztalt={3}>
      <p>To nie jest ocena. To zapis tego, ile kosztowały Was kolejne decyzje.</p>
    </Karteczka>
  );
}

function KrokWyjscia({ stan }: PropsPanelu) {
  return (
    <Karteczka tytul="Wychodzimy z ról" doodle="ludzie" wariant="zielen" tasma>
      <p style={{ fontSize: '1.15rem' }}>
        Powiedzcie po kolei: <strong>„Nie jestem już…”</strong> i podajcie nazwę swojej roli. Zostawcie karty na stole.
      </p>
      <Chmurka wariant="zielen">
        Instytucje, postaci i sytuacje w Kłębkowie są fikcyjne. Za chwilę wracamy do własnych imion i własnej pracy.
      </Chmurka>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Doodle nazwa="slonce" rozmiar={90} kolor="#f07a2b" />
      </div>
    </Karteczka>
  );
}
