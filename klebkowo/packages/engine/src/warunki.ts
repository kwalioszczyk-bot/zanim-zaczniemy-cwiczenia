/**
 * Bezpieczny parser warunków z `gra.json` (Kronika). Bez `eval` i bez `Function`.
 * Gramatyka:  warunek := 'else' | porownanie ('&&' porownanie)*
 *             porownanie := identyfikator ('=='|'>='|'<=') liczba
 */
export class BladWarunku extends Error {
  constructor(warunek: string, powod: string) {
    super(`Nie można odczytać warunku „${warunek}”: ${powod}`);
    this.name = 'BladWarunku';
  }
}

const POROWNANIE = /^([a-z_][a-z0-9_]*)\s*(==|>=|<=)\s*(-?\d+)$/i;

export interface RozbitaCzesc {
  licznik: string;
  operator: '==' | '>=' | '<=';
  wartosc: number;
}

/** Rozbija warunek na części składowe; „else” daje pustą listę i flagę zawsze. */
export function rozbijWarunek(warunek: string): { zawsze: boolean; czesci: RozbitaCzesc[] } {
  const tekst = warunek.trim();
  if (tekst === 'else') return { zawsze: true, czesci: [] };
  if (!tekst) throw new BladWarunku(warunek, 'warunek jest pusty');
  const czesci = tekst.split('&&').map((c) => {
    const dopasowanie = POROWNANIE.exec(c.trim());
    if (!dopasowanie) throw new BladWarunku(warunek, `fragment „${c.trim()}” nie jest poprawnym porównaniem`);
    return {
      licznik: dopasowanie[1] as string,
      operator: dopasowanie[2] as '==' | '>=' | '<=',
      wartosc: Number(dopasowanie[3]),
    };
  });
  return { zawsze: false, czesci };
}

/** Sprawdza warunek względem zestawu liczników. Nieznany licznik = błąd treści. */
export function sprawdzWarunek(warunek: string, liczniki: Record<string, number>): boolean {
  const { zawsze, czesci } = rozbijWarunek(warunek);
  if (zawsze) return true;
  return czesci.every((c) => {
    const wartosc = liczniki[c.licznik];
    if (typeof wartosc !== 'number') throw new BladWarunku(warunek, `nie znam licznika „${c.licznik}”`);
    if (c.operator === '==') return wartosc === c.wartosc;
    if (c.operator === '>=') return wartosc >= c.wartosc;
    return wartosc <= c.wartosc;
  });
}
