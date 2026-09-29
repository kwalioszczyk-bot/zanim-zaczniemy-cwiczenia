import { describe, expect, it } from 'vitest';
import { przydzielRole } from '../src/role.ts';
import { tresc } from './pomoc.ts';

const sektorRoli = (id: string) => tresc.role.find((r) => r.id === id)!.sektor_wykluczony;

describe('losowanie ról', () => {
  it('nikt nie gra własnego obszaru pracy, gdy jest to możliwe', () => {
    const sektory = ['placowka', 'organizacja', 'szkola', 'samorzad', 'kultura'];
    const w = przydzielRole(tresc, sektory, 'ziarno', 'A');
    expect(w.kolizje).toBe(0);
    for (const [osoba, rola] of Object.entries(w.przydzial))
      expect(sektorRoli(rola)).not.toBe(sektory[Number(osoba) - 1]);
    expect(new Set(Object.values(w.przydzial)).size).toBe(5);
  });

  it('radzi sobie, gdy wszyscy deklarują „inny obszar”', () => {
    const w = przydzielRole(tresc, ['inny', 'inny', 'inny', 'inny', 'inny'], 'ziarno', 'B');
    expect(w.kolizje).toBe(0);
    expect(w.ostrzezenie).toBeUndefined();
  });

  it('minimalizuje kolizje i ostrzega prowadzącą, gdy nie da się ich uniknąć', () => {
    const w = przydzielRole(tresc, ['kultura', 'kultura', 'kultura', 'kultura', 'kultura'], 'ziarno', 'C');
    expect(w.kolizje).toBe(1);
    expect(w.osobyZKolizja).toHaveLength(1);
    expect(w.ostrzezenie).toMatch(/ręczną zamianę/i);
  });

  it('jest deterministyczne dla ziarna i różne dla różnych stolików', () => {
    const s = ['placowka', 'organizacja', 'szkola', 'samorzad', 'kultura'];
    expect(przydzielRole(tresc, s, 'z1', 'A').przydzial).toEqual(przydzielRole(tresc, s, 'z1', 'A').przydzial);
    const warianty = new Set(['A', 'B', 'C', 'D'].map((k) => JSON.stringify(przydzielRole(tresc, s, 'z1', k).przydzial)));
    expect(warianty.size).toBeGreaterThan(1);
  });

  it('wymaga dokładnie pięciu osób', () => {
    expect(() => przydzielRole(tresc, ['inny'], 'z', 'A')).toThrow(/dokładnie 5 osób/i);
  });

  it('nie zwraca obszarów pracy — zostaje tylko mapowanie osoba → rola', () => {
    const w = przydzielRole(tresc, ['placowka', 'organizacja', 'szkola', 'samorzad', 'kultura'], 'z', 'A');
    expect(JSON.stringify(w.przydzial)).not.toMatch(/placowka|organizacja|samorzad/);
  });
});
