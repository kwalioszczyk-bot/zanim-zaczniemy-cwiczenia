/** Serwer gry: sesje, kody stolików, synchronizacja SSE, tryb omówienia. */
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import QRCode from 'qrcode';
import {
  BladReguly,
  BladTresci,
  ID_STOLIKOW,
  eksportCSV,
  eksportJSON,
  omowienieSesji,
  przejdzDoNastepnejFazy,
  przelaczZegar,
  skorygujLicznik,
  statusStolikow,
  trescDlaEkranu,
  trescDlaStolika,
  ustawFaze,
  utworzSesje,
  wczytajTresc,
  widokSesji,
  widokStolika,
  wykonaj,
  zbudujKronike,
  type IdFazy,
  type IdStolika,
  type StanSesji,
  type Tresc,
} from '@klebkowo/engine';
import { Magazyn } from './magazyn.ts';
import { adresyWSieciLokalnej } from './siec.ts';
import { LimitProb, poprawnyFormatPin, sprawdzPin, zahashujPin } from './pin.ts';
import { Strumienie } from './strumien.ts';

const TU = dirname(fileURLToPath(import.meta.url));
const KORZEN = join(TU, '..', '..', '..');

export function wczytajTrescZPliku(sciezka = join(KORZEN, 'content', 'gra.json')): Tresc {
  try {
    return wczytajTresc(JSON.parse(readFileSync(sciezka, 'utf8')));
  } catch (b) {
    if (b instanceof BladTresci) throw b;
    throw new Error(`Nie udało się wczytać pliku ${sciezka}: ${(b as Error).message}`);
  }
}

export interface OpcjeSerwera {
  tresc?: Tresc;
  katalogSesji?: string;
  katalogWeb?: string;
  logger?: boolean;
  /** Ziarno na potrzeby testów — w sali zawsze losowe. */
  ziarno?: string;
}

interface KontekstProwadzacej {
  sesja: StanSesji;
}

export function zbudujSerwer(opcje: OpcjeSerwera = {}): FastifyInstance {
  const tresc = opcje.tresc ?? wczytajTrescZPliku();
  const magazyn = new Magazyn(opcje.katalogSesji ?? join(KORZEN, process.env.KATALOG_SESJI ?? '.sesje'));
  const strumienie = new Strumienie();
  const limitProb = new LimitProb();
  /** Token → identyfikator sesji. Token dostaje wyłącznie prowadząca po podaniu PIN-u. */
  const tokenyProwadzacej = new Map<string, string>();

  const app = Fastify({
    logger: opcje.logger ?? false,
    // treść notatek i zobowiązań nigdy nie trafia do logów serwera
    ...(opcje.logger ? { disableRequestLogging: true } : {}),
  });

  magazyn.start();
  const pulsSSE = setInterval(() => strumienie.puls(), 20_000);
  pulsSSE.unref?.();
  app.addHook('onClose', async () => {
    clearInterval(pulsSSE);
    magazyn.stop();
  });

  /* ------------------------------------------------------- nagłówki bezpieczeństwa */

  app.addHook('onSend', async (_zadanie, odpowiedz) => {
    odpowiedz.header(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; object-src 'none'",
    );
    odpowiedz.header('X-Content-Type-Options', 'nosniff');
    odpowiedz.header('Referrer-Policy', 'no-referrer');
    odpowiedz.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
    odpowiedz.header('X-Frame-Options', 'SAMEORIGIN');
  });

  app.setErrorHandler((blad, _zadanie, odpowiedz) => {
    if (blad instanceof BladReguly) return odpowiedz.status(400).send({ blad: blad.message });
    app.log.error(blad);
    return odpowiedz.status(500).send({ blad: 'Coś poszło nie tak po stronie serwera.' });
  });

  /* --------------------------------------------------------------------- pomocnicze */

  const rozgłoś = (sesja: StanSesji, typ: string, dane: unknown) => strumienie.rozgloś(sesja.id, typ, dane);

  function zapiszIRozgłoś(sesja: StanSesji, typ: string, natychmiast = false) {
    magazyn.zapisz(sesja, natychmiast);
    rozgłoś(sesja, typ, { faza: sesja.faza, status: statusStolikow(sesja) });
  }

  function prowadzaca(zadanie: FastifyRequest, odpowiedz: FastifyReply): KontekstProwadzacej | null {
    const token = (zadanie.headers['x-klebkowo-token'] as string | undefined) ?? '';
    const idSesji = tokenyProwadzacej.get(token);
    const sesja = idSesji ? magazyn.pobierz(idSesji) : undefined;
    if (!sesja) {
      odpowiedz.status(401).send({ blad: 'Ta część aplikacji jest dostępna po podaniu PIN-u prowadzącej.' });
      return null;
    }
    return { sesja };
  }

  function stanDlaStolika(sesja: StanSesji, stolik: IdStolika) {
    const runda = sesja.faza === 'R1' || sesja.faza === 'R2' || sesja.faza === 'R3' ? sesja.faza : null;
    return {
      sesja: widokSesji(tresc, sesja),
      stolik: widokStolika(tresc, sesja.stoliki[stolik]),
      // zdarzenia wyłącznie bieżącej rundy — stolik nie wie z góry, co go czeka
      zdarzeniaRundy: runda ? tresc.kolejnosc_zdarzen[stolik]![runda] : [],
      kronika: sesja.faza === 'F' || sesja.faza === 'Z' ? zbudujKronike(tresc, sesja.stoliki[stolik]) : null,
    };
  }

  /* -------------------------------------------------------------- sesja: tworzenie */

  app.post('/api/sesja', async (zadanie, odpowiedz) => {
    const ciało = (zadanie.body ?? {}) as { pin?: string; ustawienia?: Record<string, boolean> };
    if (!poprawnyFormatPin(ciało.pin))
      return odpowiedz.status(400).send({ blad: 'PIN prowadzącej musi mieć od 4 do 6 cyfr.' });
    const sesja = utworzSesje(tresc, {
      pinHash: zahashujPin(ciało.pin),
      ziarno: opcje.ziarno,
      ustawienia: {
        kartyPrywatneNaPapierze: ciało.ustawienia?.kartyPrywatneNaPapierze ?? true,
        trybProjektora: ciało.ustawienia?.trybProjektora ?? false,
      },
    });
    magazyn.zapisz(sesja, true);
    const token = randomUUID();
    tokenyProwadzacej.set(token, sesja.id);
    return { token, sesja: widokSesji(tresc, sesja), kody: sesja.kody };
  });

  app.post('/api/sesja/:id/pin', async (zadanie, odpowiedz) => {
    const { id } = zadanie.params as { id: string };
    const { pin } = (zadanie.body ?? {}) as { pin?: string };
    const klucz = `${zadanie.ip}:${id}`;
    const blokada = limitProb.zablokowany(klucz);
    if (blokada)
      return odpowiedz.status(429).send({ blad: `Za dużo prób. Spróbuj ponownie za ${blokada} s.` });
    const sesja = magazyn.pobierz(id);
    if (!sesja || !poprawnyFormatPin(pin) || !sprawdzPin(pin, sesja.pinHash)) {
      limitProb.nieudana(klucz);
      return odpowiedz.status(401).send({ blad: 'Niepoprawny PIN.' });
    }
    limitProb.udana(klucz);
    const token = randomUUID();
    tokenyProwadzacej.set(token, sesja.id);
    return { token, sesja: widokSesji(tresc, sesja), kody: sesja.kody };
  });

  app.get('/api/sesje', async () => ({
    // lista aktywnych sesji — bez PIN-ów i bez stanu gry
    sesje: magazyn.wszystkie().map((s) => ({ id: s.id, utworzona: s.utworzona, faza: s.faza })),
  }));

  /* ------------------------------------------------------------------ widok stolika */

  app.get('/api/stolik/:kod', async (zadanie, odpowiedz) => {
    const { kod } = zadanie.params as { kod: string };
    const znaleziona = magazyn.poKodzie(kod);
    if (!znaleziona) return odpowiedz.status(404).send({ blad: 'Nie znam takiego kodu stolika.' });
    const stolik = znaleziona.stolik as IdStolika;
    return {
      // treść przycięta: bez klucza decyzji, bez skutków, bez ukrytych liczników
      tresc: trescDlaStolika(tresc, stolik),
      ...stanDlaStolika(znaleziona.sesja, stolik),
    };
  });

  app.post('/api/stolik/:kod/operacja', async (zadanie, odpowiedz) => {
    const { kod } = zadanie.params as { kod: string };
    const znaleziona = magazyn.poKodzie(kod);
    if (!znaleziona) return odpowiedz.status(404).send({ blad: 'Nie znam takiego kodu stolika.' });
    const ciało = (zadanie.body ?? {}) as { opId?: string; polecenie?: unknown };
    if (!ciało.opId || typeof ciało.opId !== 'string')
      return odpowiedz.status(400).send({ blad: 'Operacja musi mieć identyfikator.' });
    const stolik = znaleziona.stolik as IdStolika;

    const wynik = wykonaj(tresc, znaleziona.sesja, {
      opId: ciało.opId,
      stolik,
      polecenie: ciało.polecenie as never,
    });
    zapiszIRozgłoś(wynik.sesja, 'stoliki');
    return { wynik: wynik.wynik, powtorzona: wynik.powtorzona, ...stanDlaStolika(wynik.sesja, stolik) };
  });

  /* ---------------------------------------------------------------- strumień zmian */

  app.get('/api/strumien/:id', async (zadanie, odpowiedz) => {
    const { id } = zadanie.params as { id: string };
    const sesja = magazyn.pobierz(id) ?? magazyn.poKodzie(id)?.sesja;
    if (!sesja) return odpowiedz.status(404).send({ blad: 'Nie znam takiej sesji.' });

    odpowiedz.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    odpowiedz.raw.write(`retry: 3000\n\n`);
    odpowiedz.raw.write(`event: faza\ndata: ${JSON.stringify({ faza: sesja.faza })}\n\n`);
    const sluchacz = strumienie.dodaj(sesja.id, odpowiedz);
    zadanie.raw.on('close', () => strumienie.usun(sluchacz));
    return odpowiedz;
  });

  /* -------------------------------------------------------------- widok prowadzącej */

  app.get('/api/prowadzaca/stan', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    return {
      sesja: widokSesji(tresc, k.sesja),
      kody: k.sesja.kody,
      status: statusStolikow(k.sesja),
      stoliki: ID_STOLIKOW.map((id) => widokStolika(tresc, k.sesja.stoliki[id])),
      ustawienia: k.sesja.ustawienia,
    };
  });

  app.post('/api/prowadzaca/faza', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    const { faza } = (zadanie.body ?? {}) as { faza?: IdFazy };
    const nowa = faza ? ustawFaze(k.sesja, faza) : przejdzDoNastepnejFazy(k.sesja);
    // zmiana fazy zawsze zapisuje migawkę natychmiast
    magazyn.zapisz(nowa, true);
    rozgłoś(nowa, 'faza', { faza: nowa.faza });
    return { sesja: widokSesji(tresc, nowa) };
  });

  app.post('/api/prowadzaca/zegar', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    const nowa = przelaczZegar(k.sesja);
    zapiszIRozgłoś(nowa, 'faza', true);
    return { sesja: widokSesji(tresc, nowa) };
  });

  app.post('/api/prowadzaca/ustawienia', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    const ciało = (zadanie.body ?? {}) as { kartyPrywatneNaPapierze?: boolean; trybProjektora?: boolean };
    const nowa: StanSesji = { ...k.sesja, ustawienia: { ...k.sesja.ustawienia, ...ciało } };
    zapiszIRozgłoś(nowa, 'ustawienia', true);
    return { ustawienia: nowa.ustawienia };
  });

  app.post('/api/prowadzaca/korekta', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    const ciało = (zadanie.body ?? {}) as { stolik?: IdStolika; licznik?: string; na?: number; powod?: string };
    if (!ciało.stolik || !ciało.licznik || typeof ciało.na !== 'number')
      return odpowiedz.status(400).send({ blad: 'Korekta wymaga stolika, licznika i nowej wartości.' });
    const nowa = skorygujLicznik(tresc, k.sesja, ciało.stolik, ciało.licznik, ciało.na, ciało.powod ?? '');
    zapiszIRozgłoś(nowa, 'stoliki', true);
    return { stolik: widokStolika(tresc, nowa.stoliki[ciało.stolik]) };
  });

  /** Tryb projektora z serwerem: prowadząca wykonuje operację w imieniu stolika. */
  app.post('/api/prowadzaca/operacja', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    const ciało = (zadanie.body ?? {}) as { opId?: string; stolik?: IdStolika; polecenie?: unknown };
    if (!ciało.opId || !ciało.stolik) return odpowiedz.status(400).send({ blad: 'Brak stolika lub identyfikatora operacji.' });
    const wynik = wykonaj(tresc, k.sesja, { opId: ciało.opId, stolik: ciało.stolik, polecenie: ciało.polecenie as never });
    zapiszIRozgłoś(wynik.sesja, 'stoliki');
    return { wynik: wynik.wynik, powtorzona: wynik.powtorzona, ...stanDlaStolika(wynik.sesja, ciało.stolik) };
  });

  app.delete('/api/prowadzaca/sesja', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    rozgłoś(k.sesja, 'koniec', { zakonczona: true });
    magazyn.usun(k.sesja.id);
    for (const [token, id] of [...tokenyProwadzacej]) if (id === k.sesja.id) tokenyProwadzacej.delete(token);
    return { usunieta: true };
  });

  /* ------------------------------------------------------------------- ekran sali */

  app.get('/api/ekran/:id', async (zadanie, odpowiedz) => {
    const { id } = zadanie.params as { id: string };
    const sesja = magazyn.pobierz(id);
    if (!sesja) return odpowiedz.status(404).send({ blad: 'Nie znam takiej sesji.' });
    const runda = sesja.faza === 'R1' || sesja.faza === 'R2' || sesja.faza === 'R3' ? sesja.faza : null;
    return {
      tresc: trescDlaEkranu(tresc),
      sesja: widokSesji(tresc, sesja),
      // nagłówki zdarzeń bieżącej rundy, zawsze w kolejności A, B, C, D
      stoliki: ID_STOLIKOW.map((idS) => ({
        id: idS,
        nazwa: tresc.stoliki.find((s) => s.id === idS)?.nazwa ?? idS,
        zdarzenia: runda
          ? sesja.stoliki[idS].zdarzenia[runda].map((e) => tresc.zdarzenia.find((z) => z.id === e)?.tytul ?? e)
          : [],
        zatwierdzony: Boolean(sesja.stoliki[idS].zatwierdzone[sesja.faza]),
      })),
      kroniki:
        sesja.faza === 'F' || sesja.faza === 'Z'
          ? ID_STOLIKOW.map((idS) => zbudujKronike(tresc, sesja.stoliki[idS]))
          : [],
    };
  });

  /* -------------------------------------------------------------- tryb omówienia */

  app.get('/api/omowienie', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    return {
      dzien1: tresc.omowienie.dzien_1,
      dzien2: tresc.omowienie.dzien_2_mechanizm,
      stoliki: omowienieSesji(tresc, k.sesja),
      kroniki: ID_STOLIKOW.map((id) => zbudujKronike(tresc, k.sesja.stoliki[id])),
    };
  });

  app.get('/api/omowienie/eksport.json', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    return odpowiedz
      .header('Content-Type', 'application/json; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="klebkowo-${k.sesja.id}.json"`)
      .send(eksportJSON(tresc, k.sesja));
  });

  app.get('/api/omowienie/eksport.csv', async (zadanie, odpowiedz) => {
    const k = prowadzaca(zadanie, odpowiedz);
    if (!k) return odpowiedz;
    return odpowiedz
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="klebkowo-${k.sesja.id}.csv"`)
      .send('﻿' + eksportCSV(tresc, k.sesja));
  });

  /* -------------------------------------------------------------------- kody QR */

  app.get('/api/qr', async (zadanie, odpowiedz) => {
    const { tekst } = zadanie.query as { tekst?: string };
    if (!tekst) return odpowiedz.status(400).send({ blad: 'Brak tekstu do zakodowania.' });
    // kod QR powstaje lokalnie, bez żadnej usługi zewnętrznej
    const svg = await QRCode.toString(tekst, { type: 'svg', margin: 1, color: { dark: '#232323', light: '#FCFBF7' } });
    return odpowiedz.header('Content-Type', 'image/svg+xml; charset=utf-8').send(svg);
  });

  /* ------------------------------------------------------------- pliki aplikacji */

  const katalogWeb = opcje.katalogWeb ?? join(KORZEN, 'packages', 'web', 'dist');
  if (existsSync(katalogWeb)) {
    app.register(fastifyStatic, { root: katalogWeb, index: false });
    const wyslij = (plik: string) => async (_z: FastifyRequest, o: FastifyReply) => o.sendFile(plik);
    // urządzenie stolika dostaje osobną paczkę, do której pełna treść gry w ogóle nie trafia
    app.get('/stolik', wyslij('stolik.html'));
    app.get('/stolik/*', wyslij('stolik.html'));
    for (const sciezka of ['/', '/prowadzaca', '/ekran', '/ekran/*', '/omowienie', '/druk', '/druk/*', '/projektor'])
      app.get(sciezka, wyslij('index.html'));
  }

  /**
   * Adresy, pod którymi serwer jest widoczny dla telefonów stolików.
   * Kody QR muszą powstawać z tego adresu, a nie z tego, pod którym prowadząca
   * ma otwartą przeglądarkę — inaczej „localhost” trafiłby na kody stolików.
   */
  app.get('/api/adresy', async (zadanie) => {
    const port = Number((zadanie.headers.host ?? '').split(':')[1] ?? process.env.PORT ?? 4173);
    return { adresy: adresyWSieciLokalnej(port), port };
  });

  app.get('/api/zdrowie', async () => ({ dziala: true, sesje: magazyn.wszystkie().length, sluchacze: strumienie.liczba }));

  return app;
}
