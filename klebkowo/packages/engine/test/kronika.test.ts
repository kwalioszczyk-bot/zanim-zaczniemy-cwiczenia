import { describe, expect, it } from 'vitest';
import { zbudujKronike } from '../src/kronika.ts';
import { BladWarunku, sprawdzWarunek } from '../src/warunki.ts';
import { stolik, tresc } from './pomoc.ts';

function zLicznikami(l: Partial<Record<string, number>>) {
  const s = stolik('A');
  Object.assign(s.liczniki, l);
  s.historia = [
    { faza: 'R0', etykieta: 'Start', liczniki: { ...stolik('A').liczniki } },
    { faza: 'R3', etykieta: 'R3', liczniki: { ...s.liczniki } },
  ];
  return s;
}

describe('parser warunków', () => {
  it('obsługuje ==, >=, <= oraz &&', () => {
    const l = { czas: 0, zasieg: 7, obciazenie: 8 };
    expect(sprawdzWarunek('czas == 0', l)).toBe(true);
    expect(sprawdzWarunek('czas == 1', l)).toBe(false);
    expect(sprawdzWarunek('zasieg >= 7', l)).toBe(true);
    expect(sprawdzWarunek('zasieg <= 3', l)).toBe(false);
    expect(sprawdzWarunek('zasieg >= 7 && obciazenie >= 8', l)).toBe(true);
    expect(sprawdzWarunek('zasieg >= 7 && obciazenie >= 9', l)).toBe(false);
    expect(sprawdzWarunek('else', l)).toBe(true);
  });

  it('odrzuca wszystko, co nie jest prostym porównaniem — bez eval', () => {
    expect(() => sprawdzWarunek('process.exit(1)', {})).toThrow(BladWarunku);
    expect(() => sprawdzWarunek('czas > 0', { czas: 1 })).toThrow(BladWarunku);
    expect(() => sprawdzWarunek('czas == 0 || zasieg == 1', { czas: 0 })).toThrow(BladWarunku);
    expect(() => sprawdzWarunek('nieznany >= 1', {})).toThrow(/nie znam licznika/);
    expect(() => sprawdzWarunek('', {})).toThrow(BladWarunku);
  });
});

describe('Kronika Kłębkowa', () => {
  it('kolejność reguł nagłówka ma znaczenie — pierwsza pasująca wygrywa', () => {
    const k = zbudujKronike(tresc, zLicznikami({ czas: 0, zasieg: 9, obciazenie: 9 }));
    expect(k.naglowek).toContain('otwarcie przesunięte');
  });

  it('tłumy plus przeciążenie dają nagłówek o herbacie', () => {
    const k = zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 7, obciazenie: 8 }));
    expect(k.naglowek).toContain('herbatę');
    expect(k.naglowek).toContain('Ogród Wszystkich');
  });

  it('sam wysoki zasięg daje nagłówek o świętowaniu', () => {
    const k = zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 8, obciazenie: 3 }));
    expect(k.naglowek).toContain('Nowe Podwórko świętuje');
  });

  it('niski zasięg daje nagłówek kameralny, a stan pośredni — regułę else', () => {
    expect(zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 3 })).naglowek).toContain('kameralna');
    expect(zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 5, obciazenie: 5, zaufanie: 5 })).naglowek).toContain(
      'przygląda się z zainteresowaniem',
    );
  });

  it('dopisuje wszystkie pasujące zdania dodatkowe', () => {
    const k = zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 5, zaufanie: 9, obciazenie: 9, ryzyko: 4 }));
    expect(k.zdania).toHaveLength(3);
    expect(k.zdania.some((z) => z.includes('kolejne wspólne przedsięwzięcie'))).toBe(true);
    expect(k.zdania.some((z) => z.includes('nie dzwonić'))).toBe(true);
    expect(k.zdania.some((z) => z.includes('Niespodzianka dnia'))).toBe(true);
  });

  it('ukryte ryzyko wpływa tylko na tekst — nigdzie nie pada liczba', () => {
    const k = zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 5, ryzyko: 6 }));
    const caly = [k.naglowek, ...k.zdania, k.podpis].join(' ');
    expect(caly).toContain('Niespodzianka dnia');
    expect(caly).not.toMatch(/ryzyk/i);
    expect(JSON.stringify(k)).not.toMatch(/"ryzyko"/);
  });

  it('kronika nie porównuje stolików i kończy się podpisem', () => {
    const k = zbudujKronike(tresc, zLicznikami({ czas: 4, zasieg: 5 }));
    expect(k.podpis).toBe(tresc.kronika.podpis);
    expect(k.wykres.serie.map((s) => s.licznik)).toEqual(['czas', 'obciazenie', 'zaufanie', 'zasieg']);
    expect(k.wykres.opis).toContain('Przebieg liczników');
  });
});
