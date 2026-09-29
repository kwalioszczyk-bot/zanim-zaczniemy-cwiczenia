/**
 * Reguły gry: zdarzenia, akcje, decyzje, zobowiązania.
 * Wszystko jako czyste funkcje — żadnych zależności od UI ani serwera.
 */
import type {
  Efekt,
  IdRoli,
  IdRundy,
  KtoraDecyzja,
  StanStolika,
  Zobowiazanie,
} from './typy.ts';
import { RUNDY } from './typy.ts';
import type { Akcja, Decyzja, Skutek, Tresc, Zdarzenie } from './schemat.ts';
import { polaczEfekty, zastosujEfekt, zlagodzEfekt } from './liczniki.ts';
import { poprzedniaRunda } from './kroki.ts';
import { rzutKostka } from './losowosc.ts';

export class BladReguly extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BladReguly';
  }
}

const indeksRundy = (r: IdRundy) => RUNDY.indexOf(r);

export function znajdzAkcje(t: Tresc, id: string): Akcja {
  const a = t.akcje.find((x) => x.id === id);
  if (!a) throw new BladReguly(`Nie znam akcji „${id}”.`);
  return a;
}

export function znajdzZdarzenie(t: Tresc, id: string): Zdarzenie {
  const z = t.zdarzenia.find((x) => x.id === id);
  if (!z) throw new BladReguly(`Nie znam zdarzenia „${id}”.`);
  return z;
}

export function decyzjaStolika(t: Tresc, stolik: string, ktora: KtoraDecyzja): Decyzja {
  const s = t.stoliki.find((x) => x.id === stolik);
  if (!s) throw new BladReguly(`Nie znam stolika „${stolik}”.`);
  return ktora === 'r1' ? s.decyzja_r1 : s.decyzja_r3;
}

/* ------------------------------------------------------------------ wyczerpanie */

export interface StanWyczerpania {
  wyczerpany: boolean;
  limitAkcji: number;
  duzeZablokowane: boolean;
  komunikat: string | null;
}

/**
 * Wyczerpanie sprawdzamy na początku wyboru akcji.
 * Zespół nigdy nie odpada — zawęża się jedynie pole działania.
 */
export function stanWyczerpania(t: Tresc, stolik: StanStolika): StanWyczerpania {
  const prog = t.liczniki.wyczerpanie.prog_obciazenia;
  const wyczerpany = stolik.liczniki.obciazenie >= prog;
  return {
    wyczerpany,
    limitAkcji: wyczerpany ? 1 : t.limit_akcji_na_runde,
    duzeZablokowane: wyczerpany,
    komunikat: wyczerpany ? t.liczniki.wyczerpanie.komunikat : null,
  };
}

/* -------------------------------------------------------------------- zdarzenia */

export interface WynikZdarzenia {
  zdarzenie: string;
  tytul: string;
  tekst: string;
  /** Rzeczywista zmiana liczników po przycięciu do zakresu. */
  zmiany: Efekt;
  /** Komentarz do odczytania (np. dlaczego zdarzenie nie zaszkodziło). */
  komentarz?: string;
  /** Identyfikator akcji, która zadziałała ochronnie. */
  ochrona?: string;
  /** Etykieta wybranej reakcji, jeśli zdarzenie wymagało wyboru. */
  wybor?: string;
  /** Czy zdarzenie blokuje zobowiązania roli R1 w tej rundzie (E2). */
  blokujeZobowiazaniaR1: boolean;
}

/** Ochrona działa dopiero od rundy NASTĘPNEJ po wybraniu akcji — zdarzenia rozstrzygamy przed akcjami. */
export function ochronaAktywna(stolik: StanStolika, akcja: string, runda: IdRundy): boolean {
  return stolik.ochrony.some((o) => o.akcja === akcja && indeksRundy(o.odRundy) < indeksRundy(runda));
}

/** E6: ochroną jest wskazanie roli R3 w zobowiązaniu bieżącej lub poprzedniej rundy. */
export function rolaWZobowiazaniach(stolik: StanStolika, rola: IdRoli, runda: IdRundy): boolean {
  const poprzednia = poprzedniaRunda(runda);
  return stolik.zobowiazania.some(
    (z) => z.rola === rola && (z.runda === runda || (poprzednia !== null && z.runda === poprzednia)),
  );
}

export function rozstrzygnijZdarzenie(
  t: Tresc,
  stolik: StanStolika,
  idZdarzenia: string,
  runda: IdRundy,
  wybor?: number,
): { stolik: StanStolika; wynik: WynikZdarzenia } {
  const z = znajdzZdarzenie(t, idZdarzenia);
  let efekt: Efekt | undefined;
  let komentarz: string | undefined;
  let ochrona: string | undefined;
  let etykietaWyboru: string | undefined;
  let ukryty: Efekt | undefined;

  if (z.wybor) {
    if (typeof wybor !== 'number' || !z.wybor[wybor])
      throw new BladReguly(`Zdarzenie ${z.id} wymaga wybrania jednej z reakcji zespołu.`);
    const w = z.wybor[wybor];
    efekt = w.efekt;
    ukryty = w.ukryty_efekt;
    komentarz = w.komentarz;
    etykietaWyboru = w.etykieta;
  } else if (z.warunek) {
    const wartosc = stolik.liczniki[z.warunek.licznik as keyof typeof stolik.liczniki] ?? 0;
    if (wartosc >= z.warunek.prog) {
      efekt = z.warunek.efekt_gdy_rowny_lub_powyzej;
      komentarz = z.warunek.komentarz_gdy_powyzej;
    } else {
      efekt = z.warunek.efekt_gdy_ponizej;
    }
  } else {
    const chronioneAkcja = z.ochrona ? ochronaAktywna(stolik, z.ochrona, runda) : false;
    const chronioneWarunkiem = z.ochrona_warunek ? rolaWZobowiazaniach(stolik, 'R3', runda) : false;
    if (chronioneAkcja || chronioneWarunkiem) {
      efekt = z.efekt_z_ochrona ?? {};
      komentarz = z.komentarz_z_ochrona;
      ochrona = z.ochrona ?? 'warunek';
    } else {
      efekt = z.efekt;
    }
  }

  const pelny = ukryty ? polaczEfekty(efekt ?? {}, ukryty) : (efekt ?? {});
  const { liczniki, zmiany } = zastosujEfekt(t, stolik.liczniki, pelny);

  const blokuje = z.id === 'E2' && !ochrona;
  const wynik: WynikZdarzenia = {
    zdarzenie: z.id,
    tytul: z.tytul,
    tekst: z.tekst,
    zmiany,
    komentarz,
    ochrona,
    wybor: etykietaWyboru,
    blokujeZobowiazaniaR1: blokuje,
  };

  const nowy: StanStolika = {
    ...stolik,
    liczniki,
    zdarzenia: { ...stolik.zdarzenia, [runda]: [...stolik.zdarzenia[runda], z.id] },
    blokadaZobowiazanR1: blokuje ? runda : stolik.blokadaZobowiazanR1,
    dziennik: [
      ...stolik.dziennik,
      {
        typ: 'zdarzenie',
        runda,
        zdarzenie: z.id,
        tytul: z.tytul,
        wybor: etykietaWyboru,
        efekt: zmiany,
        komentarz,
        ochrona,
      },
    ],
  };
  return { stolik: nowy, wynik };
}

/* ------------------------------------------------------------------------ akcje */

export interface WynikAkcji {
  akcja: string;
  nazwa: string;
  zmiany: Efekt;
  komunikat?: string;
  /** Akcja wykonana mimo niespełnionego wymogu (A9 bez A2). */
  bezWymogu?: boolean;
}

/** Czy akcja jest dostępna w tej rundzie (limit, powtórzenie, wyczerpanie). */
export function dostepneAkcje(t: Tresc, stolik: StanStolika, runda: IdRundy): {
  wyczerpanie: StanWyczerpania;
  niedostepne: Record<string, string>;
} {
  const wyczerpanie = stanWyczerpania(t, stolik);
  const juzWybrane = stolik.akcje[runda];
  const niedostepne: Record<string, string> = {};
  for (const a of t.akcje) {
    if (juzWybrane.includes(a.id)) niedostepne[a.id] = 'Ta akcja została już wybrana w tej rundzie.';
    else if (wyczerpanie.duzeZablokowane && a.duza) niedostepne[a.id] = 'Zespół jest przeciążony — duże działania są w tej rundzie niedostępne.';
  }
  return { wyczerpanie, niedostepne };
}

export function sprawdzWyborAkcji(t: Tresc, stolik: StanStolika, runda: IdRundy, wybrane: readonly string[]): void {
  const { wyczerpanie } = dostepneAkcje(t, stolik, runda);
  const unikalne = new Set(wybrane);
  if (unikalne.size !== wybrane.length) throw new BladReguly('Każdą akcję można wybrać tylko raz w rundzie.');
  const juz = stolik.akcje[runda];
  for (const id of wybrane) {
    znajdzAkcje(t, id);
    if (juz.includes(id)) throw new BladReguly(`Akcja ${id} została już wybrana w tej rundzie.`);
  }
  if (juz.length + wybrane.length > wyczerpanie.limitAkcji)
    throw new BladReguly(
      wyczerpanie.wyczerpany
        ? 'Zespół jest przeciążony — w tej rundzie możliwe jest tylko jedno, niewielkie działanie.'
        : `W jednej rundzie można wybrać najwyżej ${wyczerpanie.limitAkcji} akcje.`,
    );
  if (wyczerpanie.duzeZablokowane)
    for (const id of wybrane)
      if (znajdzAkcje(t, id).duza)
        throw new BladReguly('Zespół jest przeciążony — duże działania są w tej rundzie niedostępne.');
}

/**
 * Nakłada wybrane akcje. Akcje z jednej rundy rozliczamy w kolejności z talii,
 * dzięki czemu A2 wybrane w tej samej rundzie spełnia wymóg akcji A9.
 */
export function zastosujAkcje(
  t: Tresc,
  stolik: StanStolika,
  runda: IdRundy,
  wybrane: readonly string[],
): { stolik: StanStolika; wyniki: WynikAkcji[] } {
  sprawdzWyborAkcji(t, stolik, runda, wybrane);
  const kolejnosc = t.akcje.filter((a) => wybrane.includes(a.id));

  let biezacy: StanStolika = stolik;
  const wyniki: WynikAkcji[] = [];

  for (const a of kolejnosc) {
    const maWymog = a.wymaga
      ? biezacy.ochrony.some((o) => o.akcja === a.wymaga) || biezacy.akcje[runda].includes(a.wymaga)
      : true;
    const efektJawny = maWymog ? a.efekt : (a.efekt_bez_wymogu ?? a.efekt);
    const komunikat = maWymog ? undefined : a.komunikat_bez_wymogu;
    const pelny = polaczEfekty(efektJawny, a.ukryty_efekt ?? {});
    const { liczniki, zmiany } = zastosujEfekt(t, biezacy.liczniki, pelny);

    const nowaOchrona = (a.chroni_przed ?? []).length || a.odblokowuje?.length || a.lagodzi_zwrot_akcji
      ? [...biezacy.ochrony, { akcja: a.id, odRundy: runda }]
      : biezacy.ochrony;

    const widoczneZmiany: Efekt = { ...zmiany };
    delete widoczneZmiany.ryzyko;
    delete widoczneZmiany.spotkania;

    biezacy = {
      ...biezacy,
      liczniki,
      ochrony: nowaOchrona,
      akcje: { ...biezacy.akcje, [runda]: [...biezacy.akcje[runda], a.id] },
      lagodzenie: Math.max(biezacy.lagodzenie, a.lagodzi_zwrot_akcji ?? 0),
      dziennik: [
        ...biezacy.dziennik,
        { typ: 'akcja', runda, akcja: a.id, nazwa: a.nazwa, efekt: zmiany, komunikat, bezWymogu: !maWymog },
      ],
    };
    wyniki.push({ akcja: a.id, nazwa: a.nazwa, zmiany: widoczneZmiany, komunikat, bezWymogu: !maWymog });
  }

  return { stolik: biezacy, wyniki };
}

/* --------------------------------------------------------------------- decyzje */

export interface WynikDecyzji {
  ktora: KtoraDecyzja;
  opcja: string;
  /** Zawsze taki sam, niezależnie od trafności decyzji. */
  komunikat: string;
}

/**
 * Serce mechanizmu ukrytego. Zespół dostaje zawsze ten sam komunikat i zero jawnych efektów.
 * Przy decyzji niezgodnej z pełną wiedzą rośnie ukryty licznik ryzyka, a skutek przychodzi
 * dopiero w kolejnej fazie.
 */
export function rozstrzygnijDecyzje(
  t: Tresc,
  stolik: StanStolika,
  ktora: KtoraDecyzja,
  opcja: string,
  runda: IdRundy,
): { stolik: StanStolika; wynik: WynikDecyzji } {
  const d = decyzjaStolika(t, stolik.id, ktora);
  if (!Object.keys(d.opcje).includes(opcja)) throw new BladReguly(`Opcja „${opcja}” nie występuje w tej decyzji.`);
  const zgodna = opcja === d.opcja_zgodna_z_pelna_wiedza;
  const zasady = zgodna ? t.decyzje_zasady.gdy_zgodna : t.decyzje_zasady.gdy_niezgodna;
  const ukryty: Efekt = zgodna ? {} : t.decyzje_zasady.gdy_niezgodna.ukryty_efekt;

  // Jawny efekt jest pusty w obu przypadkach — różnicę robi wyłącznie licznik ukryty.
  const { liczniki } = zastosujEfekt(t, stolik.liczniki, polaczEfekty(zasady.jawny_efekt, ukryty));

  const nowy: StanStolika = {
    ...stolik,
    liczniki,
    decyzje: { ...stolik.decyzje, [ktora]: { ktora, opcja, zgodna, runda } },
    oczekujacySkutek: zgodna ? stolik.oczekujacySkutek : { ktora, opcja },
    dziennik: [...stolik.dziennik, { typ: 'decyzja', runda, ktora, opcja, komunikat: zasady.komunikat }],
  };
  return { stolik: nowy, wynik: { ktora, opcja, komunikat: zasady.komunikat } };
}

export interface WynikSkutku {
  ktora: KtoraDecyzja;
  opcja: string;
  tytul: string;
  tekst: string;
  zmiany: Efekt;
  zlagodzony: boolean;
}

/**
 * Wydaje kartę „Skutek decyzji”, jeśli czeka w kolejce.
 * Skutek decyzji z rundy 3 jest łagodzony przez plan awaryjny (A5).
 */
export function wydajSkutek(
  t: Tresc,
  stolik: StanStolika,
  ktora: KtoraDecyzja,
  faza: IdRundy | 'F',
): { stolik: StanStolika; wynik: WynikSkutku | null } {
  const oczekuje = stolik.oczekujacySkutek;
  if (!oczekuje || oczekuje.ktora !== ktora || stolik.wydaneSkutki.includes(ktora))
    return { stolik: { ...stolik, oczekujacySkutek: oczekuje?.ktora === ktora ? null : oczekuje }, wynik: null };

  const d = decyzjaStolika(t, stolik.id, ktora);
  const skutek: Skutek | undefined = d.skutki_opcji[oczekuje.opcja];
  if (!skutek) return { stolik: { ...stolik, oczekujacySkutek: null }, wynik: null };

  const lagodzenie = ktora === 'r3' ? stolik.lagodzenie : 0;
  const efekt = zlagodzEfekt(skutek.efekt, lagodzenie);
  const { liczniki, zmiany } = zastosujEfekt(t, stolik.liczniki, efekt);

  const wynik: WynikSkutku = {
    ktora,
    opcja: oczekuje.opcja,
    tytul: skutek.tytul,
    tekst: skutek.tekst,
    zmiany,
    zlagodzony: lagodzenie > 0,
  };

  return {
    stolik: {
      ...stolik,
      liczniki,
      oczekujacySkutek: null,
      wydaneSkutki: [...stolik.wydaneSkutki, ktora],
      dziennik: [
        ...stolik.dziennik,
        { typ: 'skutek', runda: faza, ktora, opcja: oczekuje.opcja, tytul: skutek.tytul, tekst: skutek.tekst, efekt: zmiany, zlagodzony: lagodzenie > 0 },
      ],
    },
    wynik,
  };
}

/* ----------------------------------------------------------------- zobowiązania */

export interface NoweZobowiazanie {
  rola: IdRoli;
  co: string;
  doKiedy: string;
}

export function dodajZobowiazania(
  t: Tresc,
  stolik: StanStolika,
  runda: IdRundy,
  nowe: readonly NoweZobowiazanie[],
): StanStolika {
  const wRundzie = stolik.zobowiazania.filter((z) => z.runda === runda);
  if (wRundzie.length + nowe.length > t.zobowiazania.limit_na_runde)
    throw new BladReguly(`W jednej rundzie można podjąć najwyżej ${t.zobowiazania.limit_na_runde} zobowiązania.`);
  for (const z of nowe) {
    if (!z.co.trim()) throw new BladReguly('Zobowiązanie musi mieć opis („co”).');
    if (stolik.blokadaZobowiazanR1 === runda && z.rola === 'R1')
      throw new BladReguly('W tej rundzie rola R1 nie może podejmować zobowiązań.');
  }
  const dopisane: Zobowiazanie[] = nowe.map((z, i) => ({
    id: `${stolik.id}-${runda}-${wRundzie.length + i + 1}`,
    runda,
    rola: z.rola,
    co: z.co.trim(),
    doKiedy: z.doKiedy.trim(),
    status: 'oczekuje',
  }));
  return { ...stolik, zobowiazania: [...stolik.zobowiazania, ...dopisane] };
}

export interface WynikZobowiazania {
  id: string;
  rola: IdRoli;
  co: string;
  status: 'zrealizowane' | 'niezrealizowane';
  obciazenie: number;
  rzut?: number;
  zrodloRzutu?: 'fizyczna' | 'wirtualna';
  zmiany: Efekt;
}

/**
 * Sprawdza zobowiązania podjęte w poprzedniej rundzie.
 * Obciążenie poniżej progu → zobowiązanie zrealizowane. Na progu i wyżej → decyduje kostka.
 */
export function sprawdzZobowiazania(
  t: Tresc,
  stolik: StanStolika,
  runda: IdRundy,
  ziarno: string,
  rzuty: Record<string, { wartosc: number; zrodlo: 'fizyczna' | 'wirtualna' }> = {},
): { stolik: StanStolika; wyniki: WynikZobowiazania[] } {
  const poprzednia = poprzedniaRunda(runda);
  if (!poprzednia) return { stolik, wyniki: [] };
  const doSprawdzenia = stolik.zobowiazania.filter((z) => z.runda === poprzednia && z.status === 'oczekuje');

  let biezacy = stolik;
  const wyniki: WynikZobowiazania[] = [];

  for (const z of doSprawdzenia) {
    const obciazenie = biezacy.liczniki.obciazenie;
    const potrzebnaKostka = obciazenie >= t.zobowiazania.prog_obciazenia;
    let rzut: number | undefined;
    let zrodlo: 'fizyczna' | 'wirtualna' | undefined;
    let zrealizowane: boolean;
    if (potrzebnaKostka) {
      const podany = rzuty[z.id];
      rzut = podany ? podany.wartosc : rzutKostka(ziarno, `${stolik.id}:${z.id}`);
      zrodlo = podany ? podany.zrodlo : 'wirtualna';
      if (rzut < 1 || rzut > 6) throw new BladReguly('Wynik rzutu kostką musi mieścić się w zakresie 1–6.');
      zrealizowane = rzut >= 4;
    } else {
      zrealizowane = true;
    }
    const efekt: Efekt = { zaufanie: zrealizowane ? 1 : -1 };
    const { liczniki, zmiany } = zastosujEfekt(t, biezacy.liczniki, efekt);
    const status = zrealizowane ? ('zrealizowane' as const) : ('niezrealizowane' as const);

    biezacy = {
      ...biezacy,
      liczniki,
      zobowiazania: biezacy.zobowiazania.map((x) =>
        x.id === z.id
          ? { ...x, status, obciazeniePrzySprawdzeniu: obciazenie, rzut, zrodloRzutu: zrodlo, sprawdzoneWRundzie: runda }
          : x,
      ),
      dziennik: [
        ...biezacy.dziennik,
        { typ: 'zobowiazanie', runda, zobowiazanie: z.id, rola: z.rola, status, obciazenie, rzut, efekt: zmiany },
      ],
    };
    wyniki.push({ id: z.id, rola: z.rola, co: z.co, status, obciazenie, rzut, zrodloRzutu: zrodlo, zmiany });
  }

  return { stolik: biezacy, wyniki };
}

/** Które zobowiązania czekają na sprawdzenie w tej rundzie i czy trzeba rzucać kostką. */
export function zobowiazaniaDoSprawdzenia(t: Tresc, stolik: StanStolika, runda: IdRundy) {
  const poprzednia = poprzedniaRunda(runda);
  const lista = poprzednia
    ? stolik.zobowiazania.filter((z) => z.runda === poprzednia && z.status === 'oczekuje')
    : [];
  return {
    lista,
    kostkaPotrzebna: lista.length > 0 && stolik.liczniki.obciazenie >= t.zobowiazania.prog_obciazenia,
    prog: t.zobowiazania.prog_obciazenia,
  };
}
