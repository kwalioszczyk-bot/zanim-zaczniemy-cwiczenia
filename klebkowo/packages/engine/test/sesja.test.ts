import { describe, expect, it } from 'vitest';
import {
  przejdzDoNastepnejFazy,
  skorygujLicznik,
  statusStolikow,
  utworzSesje,
  widokSesji,
  widokStolika,
  wykonaj,
} from '../src/sesja.ts';
import { eksportCSV, eksportJSON, omowienieSesji } from '../src/omowienie.ts';
import { ID_STOLIKOW } from '../src/typy.ts';
import { sesja, tresc } from './pomoc.ts';

describe('sesja', () => {
  it('startuje w fazie wprowadzenia z czterema stolikami i unikalnymi kodami', () => {
    const s = sesja();
    expect(s.faza).toBe('R0');
    expect(Object.keys(s.stoliki)).toEqual(['A', 'B', 'C', 'D']);
    expect(Object.keys(s.kody)).toHaveLength(4);
    expect(new Set(Object.values(s.kody)).size).toBe(4);
    for (const kod of Object.keys(s.kody)) expect(kod).toMatch(/^[ACDEFHJKLMNPQRTUVWXY34679]{4}$/);
    for (const id of ID_STOLIKOW) expect(s.stoliki[id].liczniki).toEqual({ czas: 10, obciazenie: 3, zaufanie: 5, zasieg: 2, ryzyko: 0, spotkania: 0 });
  });

  it('jest odtwarzalna: to samo ziarno daje te same kody', () => {
    expect(Object.keys(utworzSesje(tresc, { ziarno: 'z' }).kody)).toEqual(Object.keys(utworzSesje(tresc, { ziarno: 'z' }).kody));
  });

  it('ponowne wysłanie tej samej operacji nie dubluje efektów', () => {
    let s = przejdzDoNastepnejFazy(sesja());
    const op = { opId: 'op-1', stolik: 'A' as const, polecenie: { typ: 'akcje' as const, akcje: ['A1'] } };
    const pierwsze = wykonaj(tresc, s, op);
    expect(pierwsze.powtorzona).toBe(false);
    const drugie = wykonaj(tresc, pierwsze.sesja, op);
    expect(drugie.powtorzona).toBe(true);
    expect(drugie.sesja.stoliki.A.liczniki).toEqual(pierwsze.sesja.stoliki.A.liczniki);
    expect(drugie.sesja.stoliki.A.akcje.R1).toEqual(['A1']);
    expect(drugie.wynik).toEqual(pierwsze.wynik);
  });

  it('powtórzone zdarzenie nie nakłada efektu drugi raz nawet przy innym opId', () => {
    let s = przejdzDoNastepnejFazy(sesja());
    s = wykonaj(tresc, s, { opId: 'x1', stolik: 'A', polecenie: { typ: 'zdarzenie', zdarzenie: 'E1' } }).sesja;
    const po = s.stoliki.A.liczniki.obciazenie;
    s = wykonaj(tresc, s, { opId: 'x2', stolik: 'A', polecenie: { typ: 'zdarzenie', zdarzenie: 'E1' } }).sesja;
    expect(s.stoliki.A.liczniki.obciazenie).toBe(po);
  });

  it('powtórzona decyzja nie nakłada ryzyka drugi raz', () => {
    let s = przejdzDoNastepnejFazy(sesja());
    s = wykonaj(tresc, s, { opId: 'd1', stolik: 'A', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'A' } }).sesja;
    s = wykonaj(tresc, s, { opId: 'd2', stolik: 'A', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'C' } }).sesja;
    expect(s.stoliki.A.liczniki.ryzyko).toBe(2);
    expect(s.stoliki.A.decyzje.r1!.opcja).toBe('A');
  });

  it('zapisuje migawkę liczników przy każdej zmianie fazy', () => {
    let s = sesja();
    for (let i = 0; i < 5; i++) s = przejdzDoNastepnejFazy(s);
    expect(s.faza).toBe('Z');
    expect(s.stoliki.A.historia.map((h) => h.faza)).toEqual(['R0', 'R1', 'R2', 'R3', 'F']);
  });

  it('korekta licznika wymaga uzasadnienia i zostawia wpis w dzienniku', () => {
    const s = sesja();
    expect(() => skorygujLicznik(tresc, s, 'A', 'zaufanie', 7, '  ')).toThrow(/uzasadnienia/i);
    const po = skorygujLicznik(tresc, s, 'A', 'zaufanie', 7, 'pomyłka przy zdarzeniu E3');
    expect(po.stoliki.A.liczniki.zaufanie).toBe(7);
    const wpis = po.stoliki.A.dziennik.at(-1)!;
    expect(wpis).toMatchObject({ typ: 'korekta', licznik: 'zaufanie', z: 5, na: 7, powod: 'pomyłka przy zdarzeniu E3' });
    expect(skorygujLicznik(tresc, s, 'A', 'czas', 99, 'test').stoliki.A.liczniki.czas).toBe(10);
  });

  it('status stolików jest zawsze w kolejności A, B, C, D i bez wyników', () => {
    const status = statusStolikow(sesja());
    expect(status.map((s) => s.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(JSON.stringify(status)).not.toMatch(/liczniki|punkt|ryzyko/i);
  });
});

describe('szczelność mechanizmu ukrytego', () => {
  it('widok stolika nie zawiera ukrytych liczników ani trafności decyzji', () => {
    let s = przejdzDoNastepnejFazy(sesja());
    s = wykonaj(tresc, s, { opId: '1', stolik: 'A', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'A' } }).sesja;
    s = wykonaj(tresc, s, { opId: '2', stolik: 'A', polecenie: { typ: 'akcje', akcje: ['A1'] } }).sesja;
    const widok = widokStolika(tresc, s.stoliki.A);
    const json = JSON.stringify(widok);
    expect(json).not.toMatch(/ryzyko/i);
    expect(json).not.toMatch(/spotkania/i);
    expect(json).not.toMatch(/zgodna/i);
    expect(json).not.toMatch(/oczekujacySkutek|wydaneSkutki|dziennik/i);
    expect(Object.keys(widok.liczniki).sort()).toEqual(['czas', 'obciazenie', 'zasieg', 'zaufanie']);
    expect(widok.historia.every((h) => Object.keys(h.liczniki).length === 4)).toBe(true);
  });

  it('decyzja zgodna i niezgodna dają identyczny widok stolika', () => {
    const wybierz = (opcja: string) => {
      let s = przejdzDoNastepnejFazy(sesja());
      s = wykonaj(tresc, s, { opId: 'd', stolik: 'A', polecenie: { typ: 'decyzja', ktora: 'r1', opcja } }).sesja;
      return widokStolika(tresc, s.stoliki.A);
    };
    const zgodna = wybierz('B');
    const niezgodna = wybierz('A');
    expect(zgodna.liczniki).toEqual(niezgodna.liczniki);
    expect(JSON.stringify({ ...zgodna, decyzje: [] })).toBe(JSON.stringify({ ...niezgodna, decyzje: [] }));
  });

  it('widok sesji nie zdradza treści kart ani ukrytych danych', () => {
    const w = widokSesji(tresc, sesja());
    expect(JSON.stringify(w)).not.toMatch(/ryzyko|opcja_zgodna/i);
    expect(w.nazwaFazy).toBe('Wprowadzenie');
    expect(w.minutyFazy).toBe(7);
  });

  it('ukryte dane są dostępne dopiero w trybie omówienia', () => {
    let s = przejdzDoNastepnejFazy(sesja());
    s = wykonaj(tresc, s, { opId: '1', stolik: 'A', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'A' } }).sesja;
    s = wykonaj(tresc, s, { opId: '2', stolik: 'A', polecenie: { typ: 'akcje', akcje: ['A1'] } }).sesja;
    const o = omowienieSesji(tresc, s)[0]!;
    expect(o.ukryteRyzyko).toBe(2);
    expect(o.liczbaSpotkan).toBe(1);
    expect(o.decyzje[0]!.byłaZgodna).toBe(false);
    expect(o.decyzje[0]!.zgodnaZPelnaWiedza).toBe('B');
    expect(o.decyzje[0]!.informacjeUnikalne).toHaveLength(5);
    expect(o.decyzje[0]!.informacjeUnikalne.some((i) => i.rozstrzygajaca)).toBe(true);
  });
});

describe('eksport', () => {
  it('JSON zawiera dane stolików i nie zawiera mapowania osób na role', () => {
    let s = przejdzDoNastepnejFazy(sesja());
    s = wykonaj(tresc, s, { opId: 'r', stolik: 'A', polecenie: { typ: 'krok', krok: 'akcje' } }).sesja;
    s = przejdzDoNastepnejFazy(s);
    const json = JSON.parse(eksportJSON(tresc, s));
    expect(json.stoliki.map((x: { stolik: string }) => x.stolik)).toEqual(['A', 'B', 'C', 'D']);
    expect(JSON.stringify(json)).not.toMatch(/przydzialRol|Osoba 1/);
    expect(json.stoliki[0].licznikiPoFazach.length).toBeGreaterThan(0);
  });

  it('CSV ma nagłówek i wiersze na poziomie stolików', () => {
    const s = przejdzDoNastepnejFazy(przejdzDoNastepnejFazy(sesja()));
    const csv = eksportCSV(tresc, s);
    const linie = csv.split('\n');
    expect(linie[0]).toContain('stolik;nazwa;faza');
    expect(linie.length).toBeGreaterThan(4);
    expect(csv).not.toMatch(/przydzial/i);
  });
});
