import { describe, expect, it } from 'vitest';
import {
  dodajZobowiazania,
  ochronaAktywna,
  rozstrzygnijDecyzje,
  rozstrzygnijZdarzenie,
  sprawdzZobowiazania,
  stanWyczerpania,
  wydajSkutek,
  zastosujAkcje,
} from '../src/reguly.ts';
import { zastosujEfekt } from '../src/liczniki.ts';
import { rzutKostka } from '../src/losowosc.ts';
import { stolik, tresc } from './pomoc.ts';

describe('liczniki', () => {
  it('są przycinane do zakresu 0–10 w dół', () => {
    const s = stolik('A');
    const { liczniki, zmiany } = zastosujEfekt(tresc, s.liczniki, { czas: -50 });
    expect(liczniki.czas).toBe(0);
    expect(zmiany.czas).toBe(-10); // rzeczywista zmiana, nie deklarowana
  });

  it('są przycinane do zakresu 0–10 w górę', () => {
    const s = stolik('A');
    const { liczniki } = zastosujEfekt(tresc, s.liczniki, { zaufanie: 99 });
    expect(liczniki.zaufanie).toBe(10);
  });

  it('nie zmieniają się przy pustym efekcie', () => {
    const s = stolik('A');
    const { liczniki, zmiany } = zastosujEfekt(tresc, s.liczniki, {});
    expect(liczniki).toEqual(s.liczniki);
    expect(zmiany).toEqual({});
  });
});

describe('wyczerpanie', () => {
  it('poniżej progu zespół ma pełny limit akcji', () => {
    const w = stanWyczerpania(tresc, stolik('A'));
    expect(w.wyczerpany).toBe(false);
    expect(w.limitAkcji).toBe(3);
  });

  it('od progu zawęża wybór do jednej niedużej akcji, ale nie eliminuje zespołu', () => {
    const s = stolik('A');
    s.liczniki.obciazenie = 8;
    const w = stanWyczerpania(tresc, s);
    expect(w.wyczerpany).toBe(true);
    expect(w.limitAkcji).toBe(1);
    expect(w.duzeZablokowane).toBe(true);
    expect(w.komunikat).toBe(tresc.liczniki.wyczerpanie.komunikat);
    expect(() => zastosujAkcje(tresc, s, 'R2', ['A1'])).toThrow(/przeciążony/i);
    expect(() => zastosujAkcje(tresc, s, 'R2', ['A8', 'A7'])).toThrow(/przeciążony/i);
    // zespół gra dalej — jedno niewielkie działanie jest możliwe
    const wynik = zastosujAkcje(tresc, s, 'R2', ['A8']);
    expect(wynik.stolik.liczniki.obciazenie).toBe(6);
  });
});

describe('akcje', () => {
  it('limit trzech akcji na rundę i brak powtórzeń', () => {
    const s = stolik('A');
    expect(() => zastosujAkcje(tresc, s, 'R1', ['A2', 'A3', 'A4', 'A5'])).toThrow(/najwyżej 3/i);
    expect(() => zastosujAkcje(tresc, s, 'R1', ['A2', 'A2'])).toThrow(/tylko raz/i);
    const po = zastosujAkcje(tresc, s, 'R1', ['A2']).stolik;
    expect(() => zastosujAkcje(tresc, po, 'R1', ['A2'])).toThrow(/już wybrana/i);
  });

  it('A1 zwiększa licznik spotkań i nie rusza ukrytego ryzyka', () => {
    const s = stolik('A');
    const { stolik: po, wyniki } = zastosujAkcje(tresc, s, 'R1', ['A1']);
    expect(po.liczniki.spotkania).toBe(1);
    expect(po.liczniki.ryzyko).toBe(0);
    expect(po.liczniki.czas).toBe(9);
    expect(po.liczniki.obciazenie).toBe(4);
    // stolik nie widzi ukrytych zmian przy karcie akcji
    expect(wyniki[0]!.zmiany).toEqual({ czas: -1, obciazenie: 1 });
  });

  it('A9 bez A2 daje efekt zastępczy i komunikat', () => {
    const s = stolik('A');
    const { stolik: po, wyniki } = zastosujAkcje(tresc, s, 'R1', ['A9']);
    expect(po.liczniki.zaufanie).toBe(4);
    expect(po.liczniki.obciazenie).toBe(3);
    expect(wyniki[0]!.bezWymogu).toBe(true);
    expect(wyniki[0]!.komunikat).toBe(tresc.akcje.find((a) => a.id === 'A9')!.komunikat_bez_wymogu);
  });

  it('A9 po wcześniejszym A2 działa normalnie', () => {
    const po1 = zastosujAkcje(tresc, stolik('A'), 'R1', ['A2']).stolik;
    const { stolik: po2, wyniki } = zastosujAkcje(tresc, po1, 'R2', ['A9']);
    expect(wyniki[0]!.bezWymogu).toBe(false);
    expect(po2.liczniki.zaufanie).toBe(5);
    expect(po2.liczniki.obciazenie).toBe(3); // +1 z A2, −1 z A9
  });

  it('A2 i A9 w tej samej rundzie rozliczają się w kolejności talii', () => {
    const { wyniki } = zastosujAkcje(tresc, stolik('A'), 'R1', ['A9', 'A2']);
    expect(wyniki.map((w) => w.akcja)).toEqual(['A2', 'A9']);
    expect(wyniki[1]!.bezWymogu).toBe(false);
  });
});

describe('ochrony A2–A5', () => {
  it('w rundzie 1 ochrona nie działa — akcje rozliczamy po zdarzeniach', () => {
    const po = zastosujAkcje(tresc, stolik('A'), 'R1', ['A4']).stolik;
    expect(ochronaAktywna(po, 'A4', 'R1')).toBe(false);
    const { wynik } = rozstrzygnijZdarzenie(tresc, po, 'E1', 'R1');
    expect(wynik.zmiany).toEqual({ obciazenie: 2 });
    expect(wynik.ochrona).toBeUndefined();
  });

  it('ochrona z A4 działa w kolejnej rundzie i jest trwała', () => {
    const po = zastosujAkcje(tresc, stolik('A'), 'R1', ['A4']).stolik;
    const r2 = rozstrzygnijZdarzenie(tresc, po, 'E1', 'R2');
    expect(r2.wynik.zmiany).toEqual({});
    expect(r2.wynik.ochrona).toBe('A4');
    expect(r2.wynik.komentarz).toContain('Wspólny kanał');
    const r3 = rozstrzygnijZdarzenie(tresc, po, 'E4', 'R3');
    expect(r3.wynik.zmiany).toEqual({});
  });

  it('A3 chroni przed E3, A5 przed E10, A2 przed E2 i E11', () => {
    const paries: [string, string][] = [['A3', 'E3'], ['A5', 'E10'], ['A2', 'E2'], ['A2', 'E11']];
    for (const [akcja, zdarzenie] of paries) {
      const po = zastosujAkcje(tresc, stolik('A'), 'R1', [akcja]).stolik;
      const bez = rozstrzygnijZdarzenie(tresc, stolik('A'), zdarzenie, 'R2');
      const z = rozstrzygnijZdarzenie(tresc, po, zdarzenie, 'R2');
      expect(Object.keys(bez.wynik.zmiany).length).toBeGreaterThan(0);
      expect(z.wynik.zmiany).toEqual({});
    }
  });

  it('E2 bez ochrony blokuje zobowiązania roli R1 w tej rundzie', () => {
    const { stolik: po, wynik } = rozstrzygnijZdarzenie(tresc, stolik('B'), 'E2', 'R2');
    expect(wynik.blokujeZobowiazaniaR1).toBe(true);
    expect(po.blokadaZobowiazanR1).toBe('R2');
    expect(() => dodajZobowiazania(tresc, po, 'R2', [{ rola: 'R1', co: 'x', doKiedy: 'R3' }])).toThrow(/R1 nie może/i);
    expect(() => dodajZobowiazania(tresc, po, 'R2', [{ rola: 'R2', co: 'x', doKiedy: 'R3' }])).not.toThrow();
  });
});

describe('zdarzenia szczególne', () => {
  it('E6: ochroną jest wskazanie roli R3 w zobowiązaniu tej lub poprzedniej rundy', () => {
    const bez = rozstrzygnijZdarzenie(tresc, stolik('C'), 'E6', 'R2');
    expect(bez.wynik.zmiany).toEqual({ czas: -1 });

    const zR3 = dodajZobowiazania(tresc, stolik('C'), 'R1', [{ rola: 'R3', co: 'plakaty', doKiedy: 'R2' }]);
    const chronione = rozstrzygnijZdarzenie(tresc, zR3, 'E6', 'R2');
    expect(chronione.wynik.zmiany).toEqual({});
    expect(chronione.wynik.komentarz).toContain('Szkolna pracownia');

    // zobowiązanie sprzed dwóch rund już nie chroni
    const stare = rozstrzygnijZdarzenie(tresc, zR3, 'E6', 'R3');
    expect(stare.wynik.zmiany).toEqual({ czas: -1 });
  });

  it('E7: warunek na liczniku zaufania', () => {
    const niskie = stolik('B');
    niskie.liczniki.zaufanie = 5;
    expect(rozstrzygnijZdarzenie(tresc, niskie, 'E7', 'R3').wynik.zmiany).toEqual({ obciazenie: 1, zasieg: -1 });

    const wysokie = stolik('B');
    wysokie.liczniki.zaufanie = 6;
    const w = rozstrzygnijZdarzenie(tresc, wysokie, 'E7', 'R3');
    expect(w.wynik.zmiany).toEqual({});
    expect(w.wynik.komentarz).toContain('plotka ucichła');
  });

  it('E8: przemilczenie sprawy podnosi ukryte ryzyko, ale stolik tego nie widzi', () => {
    const { stolik: po, wynik } = rozstrzygnijZdarzenie(tresc, stolik('A'), 'E8', 'R2', 2);
    expect(po.liczniki.ryzyko).toBe(1);
    expect(wynik.zmiany).toEqual({ zaufanie: -1, ryzyko: 1 });
    expect(po.liczniki.zaufanie).toBe(4);
  });

  it('zdarzenie z wyborem wymaga wskazania reakcji', () => {
    expect(() => rozstrzygnijZdarzenie(tresc, stolik('B'), 'E5', 'R2')).toThrow(/wymaga wybrania/i);
  });
});

describe('decyzje — mechanizm ukryty', () => {
  it('decyzja zgodna: brak jawnego efektu, brak ryzyka, komunikat „Decyzja zapisana.”', () => {
    const { stolik: po, wynik } = rozstrzygnijDecyzje(tresc, stolik('A'), 'r1', 'B', 'R1');
    expect(wynik.komunikat).toBe('Decyzja zapisana.');
    expect(po.liczniki.ryzyko).toBe(0);
    expect(po.oczekujacySkutek).toBeNull();
    expect({ ...po.liczniki, ryzyko: 0 }).toEqual(stolik('A').liczniki);
  });

  it('decyzja niezgodna: ten sam komunikat, ryzyko +2, skutek dopiero w kolejnej fazie', () => {
    const { stolik: po, wynik } = rozstrzygnijDecyzje(tresc, stolik('A'), 'r1', 'A', 'R1');
    expect(wynik.komunikat).toBe('Decyzja zapisana.');
    expect(po.liczniki.ryzyko).toBe(2);
    expect(po.oczekujacySkutek).toEqual({ ktora: 'r1', opcja: 'A' });
    // jawne liczniki po decyzji są nie do odróżnienia od decyzji zgodnej
    const zgodna = rozstrzygnijDecyzje(tresc, stolik('A'), 'r1', 'B', 'R1').stolik;
    expect(po.liczniki.czas).toBe(zgodna.liczniki.czas);
    expect(po.liczniki.zaufanie).toBe(zgodna.liczniki.zaufanie);
    expect(po.liczniki.obciazenie).toBe(zgodna.liczniki.obciazenie);
    expect(po.liczniki.zasieg).toBe(zgodna.liczniki.zasieg);
  });

  it('skutek niezgodnej decyzji r1 wydawany jest raz', () => {
    const po = rozstrzygnijDecyzje(tresc, stolik('A'), 'r1', 'A', 'R1').stolik;
    const pierwszy = wydajSkutek(tresc, po, 'r1', 'R2');
    expect(pierwszy.wynik?.tytul).toBe('Rusztowanie zamiast grządek');
    expect(pierwszy.wynik?.zmiany).toEqual({ czas: -2, obciazenie: 2 });
    const drugi = wydajSkutek(tresc, pierwszy.stolik, 'r1', 'R2');
    expect(drugi.wynik).toBeNull();
    expect(drugi.stolik.liczniki).toEqual(pierwszy.stolik.liczniki);
  });

  it('decyzja zgodna nie generuje żadnej karty skutku', () => {
    const po = rozstrzygnijDecyzje(tresc, stolik('A'), 'r1', 'B', 'R1').stolik;
    expect(wydajSkutek(tresc, po, 'r1', 'R2').wynik).toBeNull();
  });

  it('A5 łagodzi skutek zwrotu akcji o 1 punkt w każdym ujemnym składniku', () => {
    const zPlanem = zastosujAkcje(tresc, stolik('A'), 'R1', ['A5']).stolik;
    const bezPlanu = stolik('A');
    const dA = rozstrzygnijDecyzje(tresc, zPlanem, 'r3', 'B', 'R3').stolik; // czas −3
    const dB = rozstrzygnijDecyzje(tresc, bezPlanu, 'r3', 'B', 'R3').stolik;
    expect(wydajSkutek(tresc, dA, 'r3', 'F').wynik?.zmiany).toEqual({ czas: -2 });
    expect(wydajSkutek(tresc, dB, 'r3', 'F').wynik?.zmiany).toEqual({ czas: -3 });
  });

  it('A5 nie łagodzi skutku decyzji z rundy 1', () => {
    const zPlanem = zastosujAkcje(tresc, stolik('A'), 'R1', ['A5']).stolik;
    const po = rozstrzygnijDecyzje(tresc, zPlanem, 'r1', 'A', 'R1').stolik;
    expect(wydajSkutek(tresc, po, 'r1', 'R2').wynik?.zmiany).toEqual({ czas: -2, obciazenie: 2 });
  });

  it('nieznana opcja jest odrzucana', () => {
    expect(() => rozstrzygnijDecyzje(tresc, stolik('A'), 'r1', 'Z', 'R1')).toThrow(/nie występuje/i);
  });
});

describe('zobowiązania', () => {
  it('obciążenie poniżej progu → zrealizowane, zaufanie +1, bez kostki', () => {
    let s = dodajZobowiazania(tresc, stolik('A'), 'R1', [{ rola: 'R2', co: 'plakaty', doKiedy: 'R2' }]);
    expect(s.liczniki.obciazenie).toBe(3);
    const { stolik: po, wyniki } = sprawdzZobowiazania(tresc, s, 'R2', 'ziarno');
    expect(wyniki[0]!.status).toBe('zrealizowane');
    expect(wyniki[0]!.rzut).toBeUndefined();
    expect(po.liczniki.zaufanie).toBe(6);
  });

  it('obciążenie od progu → decyduje kostka; 1–3 to porażka, 4–6 sukces', () => {
    const bazowy = dodajZobowiazania(tresc, stolik('A'), 'R1', [{ rola: 'R2', co: 'plakaty', doKiedy: 'R2' }]);
    bazowy.liczniki.obciazenie = 7;

    const porazka = sprawdzZobowiazania(tresc, bazowy, 'R2', 'z', { 'A-R1-1': { wartosc: 3, zrodlo: 'fizyczna' } });
    expect(porazka.wyniki[0]!.status).toBe('niezrealizowane');
    expect(porazka.stolik.liczniki.zaufanie).toBe(4);

    const sukces = sprawdzZobowiazania(tresc, bazowy, 'R2', 'z', { 'A-R1-1': { wartosc: 4, zrodlo: 'fizyczna' } });
    expect(sukces.wyniki[0]!.status).toBe('zrealizowane');
    expect(sukces.stolik.liczniki.zaufanie).toBe(6);
  });

  it('wirtualna kostka jest deterministyczna dla ziarna sesji', () => {
    const a = rzutKostka('ziarno-1', 'A:A-R1-1');
    const b = rzutKostka('ziarno-1', 'A:A-R1-1');
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(1);
    expect(a).toBeLessThanOrEqual(6);
    expect(rzutKostka('ziarno-2', 'A:A-R1-1')).toBeTypeOf('number');
  });

  it('limit dwóch zobowiązań na rundę', () => {
    const s = dodajZobowiazania(tresc, stolik('A'), 'R1', [
      { rola: 'R2', co: 'a', doKiedy: 'R2' },
      { rola: 'R3', co: 'b', doKiedy: 'R2' },
    ]);
    expect(() => dodajZobowiazania(tresc, s, 'R1', [{ rola: 'R4', co: 'c', doKiedy: 'R2' }])).toThrow(/najwyżej 2/i);
  });

  it('sprawdzane są tylko zobowiązania z poprzedniej rundy', () => {
    const s = dodajZobowiazania(tresc, stolik('A'), 'R2', [{ rola: 'R2', co: 'a', doKiedy: 'R3' }]);
    expect(sprawdzZobowiazania(tresc, s, 'R2', 'z').wyniki).toHaveLength(0);
    expect(sprawdzZobowiazania(tresc, s, 'R3', 'z').wyniki).toHaveLength(1);
  });

  it('odrzuca wynik kostki spoza zakresu 1–6', () => {
    const s = dodajZobowiazania(tresc, stolik('A'), 'R1', [{ rola: 'R2', co: 'a', doKiedy: 'R2' }]);
    s.liczniki.obciazenie = 8;
    expect(() => sprawdzZobowiazania(tresc, s, 'R2', 'z', { 'A-R1-1': { wartosc: 7, zrodlo: 'fizyczna' } })).toThrow(/1–6/);
  });
});
