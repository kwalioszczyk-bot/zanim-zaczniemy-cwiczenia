import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { zbudujSerwer } from '../src/aplikacja.ts';

let app: FastifyInstance;
let katalog: string;
let token = '';
let kody: Record<string, string> = {};
let idSesji = '';

const kodStolika = (id: string) => Object.entries(kody).find(([, s]) => s === id)![0];

beforeAll(async () => {
  katalog = mkdtempSync(join(tmpdir(), 'klebkowo-'));
  app = zbudujSerwer({ katalogSesji: katalog, ziarno: 'test-serwer' });
  await app.ready();
  const o = await app.inject({ method: 'POST', url: '/api/sesja', payload: { pin: '4321' } });
  const ciało = o.json();
  token = ciało.token;
  kody = ciało.kody;
  idSesji = ciało.sesja.id;
});

afterAll(async () => {
  await app.close();
  rmSync(katalog, { recursive: true, force: true });
});

const prowadzaca = (url: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', payload?: unknown) =>
  app.inject({ method, url, headers: { 'x-klebkowo-token': token }, ...(payload ? { payload } : {}) });

describe('sesja i PIN', () => {
  it('tworzy sesję z czterema kodami stolików', () => {
    expect(Object.keys(kody)).toHaveLength(4);
    expect(new Set(Object.values(kody))).toEqual(new Set(['A', 'B', 'C', 'D']));
  });

  it('odrzuca PIN o złym formacie', async () => {
    const o = await app.inject({ method: 'POST', url: '/api/sesja', payload: { pin: '12' } });
    expect(o.statusCode).toBe(400);
    expect(o.json().blad).toMatch(/4 do 6 cyfr/);
  });

  it('nie wpuszcza do trybu prowadzącej bez tokenu', async () => {
    const o = await app.inject({ method: 'GET', url: '/api/prowadzaca/stan' });
    expect(o.statusCode).toBe(401);
    const p = await app.inject({ method: 'GET', url: '/api/omowienie' });
    expect(p.statusCode).toBe(401);
  });

  it('wydaje token po poprawnym PIN-ie i blokuje po serii nieudanych prób', async () => {
    const dobry = await app.inject({ method: 'POST', url: `/api/sesja/${idSesji}/pin`, payload: { pin: '4321' } });
    expect(dobry.statusCode).toBe(200);
    expect(dobry.json().token).toBeTruthy();

    let ostatni = 0;
    for (let i = 0; i < 6; i++) {
      const o = await app.inject({ method: 'POST', url: `/api/sesja/${idSesji}/pin`, payload: { pin: '0000' } });
      ostatni = o.statusCode;
    }
    expect(ostatni).toBe(429);
  });

  it('nigdy nie oddaje skrótu PIN-u', async () => {
    const o = await prowadzaca('/api/prowadzaca/stan');
    expect(o.body).not.toMatch(/pinHash/);
  });
});

describe('szczelność API stolika', () => {
  it('treść dla stolika nie zawiera klucza decyzji ani ukrytych liczników', async () => {
    const o = await app.inject({ method: 'GET', url: `/api/stolik/${kodStolika('A')}` });
    expect(o.statusCode).toBe(200);
    expect(o.body).not.toMatch(/opcja_zgodna|skutki_opcji|ryzyko|spotkania/i);
    expect(o.json().tresc.stolik.nazwa).toBe('Ogród Wszystkich');
  });

  it('odpowiedź po decyzji wygląda tak samo dla opcji zgodnej i niezgodnej', async () => {
    await prowadzaca('/api/prowadzaca/faza', 'POST', {});
    const zagraj = async (stolik: string, opcja: string) => {
      const o = await app.inject({
        method: 'POST',
        url: `/api/stolik/${kodStolika(stolik)}/operacja`,
        payload: { opId: `d-${stolik}`, polecenie: { typ: 'decyzja', ktora: 'r1', opcja } },
      });
      return o.json();
    };
    const zgodna = await zagraj('A', 'B'); // zgodna z pełną wiedzą
    const niezgodna = await zagraj('B', 'A'); // niezgodna
    expect(zgodna.wynik.komunikat).toBe('Decyzja zapisana.');
    expect(niezgodna.wynik.komunikat).toBe('Decyzja zapisana.');
    expect(Object.keys(zgodna.wynik).sort()).toEqual(Object.keys(niezgodna.wynik).sort());
    expect(zgodna.stolik.liczniki).toEqual(niezgodna.stolik.liczniki);
    expect(JSON.stringify(niezgodna)).not.toMatch(/ryzyko|zgodna/i);
  });

  it('kod stolika spoza sesji daje 404', async () => {
    const o = await app.inject({ method: 'GET', url: '/api/stolik/ZZZZ' });
    expect(o.statusCode).toBe(404);
  });
});

describe('idempotencja operacji', () => {
  it('to samo opId nie dubluje efektu po zerwaniu połączenia', async () => {
    const kod = kodStolika('C');
    const wyslij = () =>
      app.inject({
        method: 'POST',
        url: `/api/stolik/${kod}/operacja`,
        payload: { opId: 'powtorka-1', polecenie: { typ: 'akcje', akcje: ['A6'] } },
      });
    const pierwsza = (await wyslij()).json();
    const druga = (await wyslij()).json();
    expect(pierwsza.powtorzona).toBe(false);
    expect(druga.powtorzona).toBe(true);
    expect(druga.stolik.liczniki).toEqual(pierwsza.stolik.liczniki);
    expect(druga.stolik.akcje.R1).toEqual(['A6']);
  });

  it('operacja bez identyfikatora jest odrzucana', async () => {
    const o = await app.inject({
      method: 'POST',
      url: `/api/stolik/${kodStolika('C')}/operacja`,
      payload: { polecenie: { typ: 'akcje', akcje: ['A7'] } },
    });
    expect(o.statusCode).toBe(400);
  });

  it('błąd reguł wraca jako czytelny komunikat 400', async () => {
    const o = await app.inject({
      method: 'POST',
      url: `/api/stolik/${kodStolika('C')}/operacja`,
      payload: { opId: 'zle-1', polecenie: { typ: 'akcje', akcje: ['A6'] } },
    });
    expect(o.statusCode).toBe(400);
    expect(o.json().blad).toMatch(/już wybrana/i);
  });
});

describe('ekran sali i prowadząca', () => {
  it('ekran sali nie pokazuje liczników ani zestawień porównawczych', async () => {
    const o = await app.inject({ method: 'GET', url: `/api/ekran/${idSesji}` });
    expect(o.statusCode).toBe(200);
    const dane = o.json();
    expect(dane.stoliki.map((s: { id: string }) => s.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(o.body).not.toMatch(/ryzyko|opcja_zgodna|informacje_unikalne/i);
    expect(JSON.stringify(dane.stoliki)).not.toMatch(/liczniki/);
  });

  it('prowadząca widzi status stolików zawsze w kolejności A–D', async () => {
    const o = await prowadzaca('/api/prowadzaca/stan');
    expect(o.json().status.map((s: { id: string }) => s.id)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('korekta licznika wymaga uzasadnienia', async () => {
    const zle = await prowadzaca('/api/prowadzaca/korekta', 'POST', { stolik: 'A', licznik: 'zaufanie', na: 7, powod: '' });
    expect(zle.statusCode).toBe(400);
    const dobrze = await prowadzaca('/api/prowadzaca/korekta', 'POST', { stolik: 'A', licznik: 'zaufanie', na: 7, powod: 'pomyłka' });
    expect(dobrze.json().stolik.liczniki.zaufanie).toBe(7);
  });

  it('tryb omówienia odsłania mechanizm dopiero po PIN-ie', async () => {
    const o = await prowadzaca('/api/omowienie');
    const dane = o.json();
    expect(dane.stoliki[1].ukryteRyzyko).toBe(2); // stolik B wybrał opcję niezgodną
    expect(dane.stoliki[0].ukryteRyzyko).toBe(0);
    expect(dane.dzien1.nie_ujawniac.length).toBeGreaterThan(0);
  });

  it('eksport JSON i CSV działa tylko dla prowadzącej i jest na poziomie stolików', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/omowienie/eksport.csv' })).statusCode).toBe(401);
    const csv = await prowadzaca('/api/omowienie/eksport.csv');
    expect(csv.headers['content-disposition']).toMatch(/attachment/);
    expect(csv.body).toContain('stolik;nazwa;faza');
    const json = await prowadzaca('/api/omowienie/eksport.json');
    expect(JSON.parse(json.body.replace(/^﻿/, '')).stoliki).toHaveLength(4);
  });
});

describe('bezpieczeństwo i prywatność', () => {
  it('ustawia nagłówki bezpieczeństwa z polityką default-src self', async () => {
    const o = await app.inject({ method: 'GET', url: '/api/zdrowie' });
    expect(o.headers['content-security-policy']).toContain("default-src 'self'");
    expect(o.headers['content-security-policy']).toContain("object-src 'none'");
    expect(o.headers['x-content-type-options']).toBe('nosniff');
    expect(o.headers['referrer-policy']).toBe('no-referrer');
  });

  it('polityka CSP nie dopuszcza zewnętrznych źródeł', async () => {
    const csp = (await app.inject({ method: 'GET', url: '/api/zdrowie' })).headers['content-security-policy'] as string;
    expect(csp).not.toMatch(/https?:\/\//);
    expect(csp).toMatch(/font-src 'self'/);
  });

  it('kod QR powstaje lokalnie', async () => {
    const o = await app.inject({ method: 'GET', url: '/api/qr?tekst=http://192.168.0.2:4173/stolik/ABCD' });
    expect(o.headers['content-type']).toContain('image/svg+xml');
    expect(o.body).toContain('<svg');
  });

  it('lista sesji nie zdradza stanu gry ani PIN-ów', async () => {
    const o = await app.inject({ method: 'GET', url: '/api/sesje' });
    expect(o.body).not.toMatch(/pinHash|liczniki|ryzyko/);
  });

  it('zakończenie sesji usuwa dane', async () => {
    const app2 = zbudujSerwer({ katalogSesji: mkdtempSync(join(tmpdir(), 'klebkowo2-')), ziarno: 'usun' });
    const utworz = (await app2.inject({ method: 'POST', url: '/api/sesja', payload: { pin: '1234' } })).json();
    const o = await app2.inject({ method: 'DELETE', url: '/api/prowadzaca/sesja', headers: { 'x-klebkowo-token': utworz.token } });
    expect(o.json().usunieta).toBe(true);
    const kod = Object.keys(utworz.kody)[0]!;
    expect((await app2.inject({ method: 'GET', url: `/api/stolik/${kod}` })).statusCode).toBe(404);
    await app2.close();
  });
});
