/**
 * Losowanie ról bez danych osobowych.
 * Jedyne, o co aplikacja pyta, to obszar pracy każdej z pięciu osób — i tylko po to,
 * żeby nikt nie zagrał własnego zawodu. Obszary NIE są zapisywane w stanie sesji;
 * po przydziale zostaje wyłącznie mapowanie „Osoba n → rola”.
 */
import type { IdRoli } from './typy.ts';
import type { Tresc } from './schemat.ts';
import { przetasuj } from './losowosc.ts';

export interface WynikPrzydzialu {
  /** „1”…„5” → identyfikator roli. */
  przydzial: Record<string, IdRoli>;
  /** Liczba osób, które mimo wszystko dostały rolę ze swojego obszaru. */
  kolizje: number;
  /** Numery osób z kolizją — prowadząca może zamienić karty ręcznie. */
  osobyZKolizja: string[];
  ostrzezenie?: string;
}

function permutacje<T>(elementy: readonly T[]): T[][] {
  if (elementy.length <= 1) return [[...elementy]];
  const wynik: T[][] = [];
  for (let i = 0; i < elementy.length; i++) {
    const reszta = [...elementy.slice(0, i), ...elementy.slice(i + 1)];
    for (const p of permutacje(reszta)) wynik.push([elementy[i] as T, ...p]);
  }
  return wynik;
}

/**
 * Dopasowuje role do osób tak, by żadna osoba nie dostała roli z `sektor_wykluczony`
 * równym jej obszarowi pracy. Gdy to niemożliwe — minimalizuje liczbę kolizji
 * i zwraca ostrzeżenie dla prowadzącej.
 */
export function przydzielRole(tresc: Tresc, sektory: readonly string[], ziarno: string, kontekst: string): WynikPrzydzialu {
  const role = tresc.role;
  if (sektory.length !== role.length)
    throw new Error(`Losowanie ról wymaga dokładnie ${role.length} osób, otrzymano ${sektory.length}.`);

  const wykluczenia = role.map((r) => r.sektor_wykluczony);
  const kolizjeDla = (kolejnosc: number[]) =>
    kolejnosc.reduce((suma, indeksRoli, indeksOsoby) => suma + (wykluczenia[indeksRoli] === sektory[indeksOsoby] ? 1 : 0), 0);

  const wszystkie = permutacje(role.map((_, i) => i));
  // Kolejność permutacji zależy od ziarna — losowanie jest losowe, ale odtwarzalne.
  const potasowane = przetasuj(wszystkie, ziarno, `role::${kontekst}`);

  let najlepsza = potasowane[0] as number[];
  let najlepszeKolizje = kolizjeDla(najlepsza);
  for (const kandydat of potasowane) {
    const k = kolizjeDla(kandydat);
    if (k < najlepszeKolizje) {
      najlepsza = kandydat;
      najlepszeKolizje = k;
    }
    if (najlepszeKolizje === 0) break;
  }

  const przydzial: Record<string, IdRoli> = {};
  const osobyZKolizja: string[] = [];
  najlepsza.forEach((indeksRoli, indeksOsoby) => {
    const rola = role[indeksRoli];
    if (!rola) return;
    const numer = String(indeksOsoby + 1);
    przydzial[numer] = rola.id;
    if (rola.sektor_wykluczony === sektory[indeksOsoby]) osobyZKolizja.push(numer);
  });

  return {
    przydzial,
    kolizje: najlepszeKolizje,
    osobyZKolizja,
    ostrzezenie: najlepszeKolizje
      ? `Nie udało się uniknąć wszystkich kolizji obszarów pracy (osoby: ${osobyZKolizja.join(', ')}). ` +
        'Poproś prowadzącą o ręczną zamianę kart ról między stolikami.'
      : undefined,
  };
}
