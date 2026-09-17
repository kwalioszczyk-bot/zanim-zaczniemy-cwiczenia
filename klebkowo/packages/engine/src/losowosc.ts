/**
 * Deterministyczny generator losowy. Wynik zależy wyłącznie od ziarna sesji
 * i od tekstowego kontekstu — nie od kolejności wywołań. Dzięki temu ta sama
 * sesja odtworzona z migawki daje identyczne wyniki, a testy są powtarzalne.
 */

/** FNV-1a — mały, szybki i stabilny skrót tekstu. */
export function skrotTekstu(tekst: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — zwraca liczbę z przedziału [0, 1). */
export function generator(ziarno: number): () => number {
  let a = ziarno >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Liczba z [0, 1) dla danego ziarna i kontekstu. */
export function losowa(ziarno: string, kontekst: string): number {
  return generator(skrotTekstu(`${ziarno}::${kontekst}`))();
}

/** Rzut sześcienną kostką (1–6), deterministyczny dla pary ziarno + kontekst. */
export function rzutKostka(ziarno: string, kontekst: string): number {
  return 1 + Math.floor(losowa(ziarno, kontekst) * 6);
}

/** Tasowanie Fishera–Yatesa na kopii tablicy, deterministyczne. */
export function przetasuj<T>(tablica: readonly T[], ziarno: string, kontekst: string): T[] {
  const kopia = [...tablica];
  const rnd = generator(skrotTekstu(`${ziarno}::${kontekst}`));
  for (let i = kopia.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = kopia[i] as T;
    kopia[i] = kopia[j] as T;
    kopia[j] = a;
  }
  return kopia;
}

const ALFABET_KODU = 'ACDEFHJKLMNPQRTUVWXY34679';

/** Kod stolika: 4 znaki bez mylących liter (brak B/8, I/1, O/0, S/5, Z/2, G/6). */
export function kodStolika(ziarno: string, kontekst: string): string {
  const rnd = generator(skrotTekstu(`${ziarno}::kod::${kontekst}`));
  let kod = '';
  for (let i = 0; i < 4; i++) kod += ALFABET_KODU[Math.floor(rnd() * ALFABET_KODU.length)];
  return kod;
}
