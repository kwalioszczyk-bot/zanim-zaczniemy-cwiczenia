/** Pełna rozgrywka czterech stolików przez wszystkie fazy — na poziomie silnika. */
import { describe, expect, it } from 'vitest';
import { przejdzDoNastepnejFazy, widokStolika, wykonaj } from '../src/sesja.ts';
import { zbudujKronike } from '../src/kronika.ts';
import { omowienieSesji } from '../src/omowienie.ts';
import { znajdzZdarzenie } from '../src/reguly.ts';
import { ID_STOLIKOW, type IdRundy, type IdStolika, type StanSesji } from '../src/typy.ts';
import { sesja, tresc } from './pomoc.ts';

function rozegrajRunde(s: StanSesji, runda: IdRundy, wybory: Record<IdStolika, { decyzja?: string; akcje: string[] }>) {
  for (const id of ID_STOLIKOW) {
    let licznik = 0;
    const op = (polecenie: Parameters<typeof wykonaj>[2]['polecenie']) => {
      s = wykonaj(tresc, s, { opId: `${id}-${runda}-${licznik++}`, stolik: id, polecenie }).sesja;
    };
    if (runda !== 'R1') op({ typ: 'sprawdz-zobowiazania' });
    if (runda === 'R2') op({ typ: 'wydaj-skutek', ktora: 'r1' });
    for (const e of tresc.kolejnosc_zdarzen[id]![runda]) {
      const zd = znajdzZdarzenie(tresc, e);
      op({ typ: 'zdarzenie', zdarzenie: e, ...(zd.wybor ? { wybor: 1 } : {}) });
    }
    const w = wybory[id];
    if (w.decyzja) op({ typ: 'decyzja', ktora: runda === 'R1' ? 'r1' : 'r3', opcja: w.decyzja });
    // wyczerpany zespół gra dalej, tylko węziej — bierzemy tyle akcji, ile wolno
    const wyczerpany = s.stoliki[id].liczniki.obciazenie >= tresc.liczniki.wyczerpanie.prog_obciazenia;
    const akcje = wyczerpany ? w.akcje.filter((a) => !tresc.akcje.find((x) => x.id === a)!.duza).slice(0, 1) : w.akcje;
    if (akcje.length) op({ typ: 'akcje', akcje });
    if (runda !== 'R3') op({ typ: 'zobowiazania', lista: [{ rola: 'R3', co: 'plakaty', doKiedy: 'następna runda' }] });
    op({ typ: 'zatwierdz' });
  }
  return s;
}

describe('pełna rozgrywka', () => {
  it('cztery stoliki przechodzą R0 → Z i każdy dostaje Kronikę', () => {
    let s = sesja('rozgrywka');

    // faza wprowadzenia: role rozdaje aplikacja albo prowadząca na papierze
    // wprowadzenie (R0) → runda 1
    s = przejdzDoNastepnejFazy(s);
    expect(s.faza).toBe('R1');

    s = rozegrajRunde(s, 'R1', {
      A: { decyzja: 'B', akcje: ['A2', 'A4', 'A6'] }, // zgodna
      B: { decyzja: 'A', akcje: ['A1', 'A3'] }, // niezgodna
      C: { decyzja: 'B', akcje: ['A5', 'A7'] },
      D: { decyzja: 'C', akcje: ['A6', 'A7', 'A1'] }, // niezgodna
    });
    expect(ID_STOLIKOW.every((id) => s.stoliki[id].zatwierdzone.R1)).toBe(true);

    s = przejdzDoNastepnejFazy(s);
    expect(s.faza).toBe('R2');

    // skutki niezgodnych decyzji z R1 przychodzą właśnie teraz
    s = rozegrajRunde(s, 'R2', {
      A: { akcje: ['A9', 'A8'] },
      B: { akcje: ['A8'] },
      C: { akcje: ['A2', 'A6'] },
      D: { akcje: ['A8', 'A3'] },
    });
    expect(s.stoliki.B.dziennik.some((w) => w.typ === 'skutek' && w.ktora === 'r1')).toBe(true);
    expect(s.stoliki.A.dziennik.some((w) => w.typ === 'skutek')).toBe(false);

    s = przejdzDoNastepnejFazy(s);
    s = rozegrajRunde(s, 'R3', {
      A: { decyzja: 'C', akcje: ['A7'] },
      B: { decyzja: 'A', akcje: ['A8'] },
      C: { decyzja: 'B', akcje: ['A7'] },
      D: { decyzja: 'B', akcje: ['A6'] },
    });

    s = przejdzDoNastepnejFazy(s);
    expect(s.faza).toBe('F');
    for (const id of ID_STOLIKOW)
      s = wykonaj(tresc, s, { opId: `${id}-fin`, stolik: id, polecenie: { typ: 'wydaj-skutek', ktora: 'r3' } }).sesja;

    // Kronika powstaje dla każdego stolika i nikogo nie porównuje
    for (const id of ID_STOLIKOW) {
      const k = zbudujKronike(tresc, s.stoliki[id]);
      expect(k.naglowek.length).toBeGreaterThan(10);
      expect(k.wykres.serie[0]!.wartosci.length).toBeGreaterThanOrEqual(4);
      expect(k.podpis).toContain('nie porównuje stolików');
    }

    s = przejdzDoNastepnejFazy(s);
    expect(s.faza).toBe('Z');

    // liczniki jawne w zakresie 0–10 przez całą grę
    for (const id of ID_STOLIKOW) {
      const w = widokStolika(tresc, s.stoliki[id]);
      for (const h of w.historia)
        for (const wartosc of Object.values(h.liczniki)) {
          expect(wartosc).toBeGreaterThanOrEqual(0);
          expect(wartosc).toBeLessThanOrEqual(10);
        }
    }

    // omówienie widzi mechanizm, stoliki nie
    const o = omowienieSesji(tresc, s);
    expect(o.find((x) => x.id === 'B')!.ukryteRyzyko).toBeGreaterThan(0);
    expect(o.find((x) => x.id === 'A')!.ukryteRyzyko).toBe(0);
    expect(o.map((x) => x.id)).toEqual(['A', 'B', 'C', 'D']);
    for (const id of ID_STOLIKOW) expect(JSON.stringify(widokStolika(tresc, s.stoliki[id]))).not.toMatch(/ryzyko/);
  });

  it('spotkania nie zmniejszają ukrytego ryzyka — nawet gdy zespół spotyka się w każdej rundzie', () => {
    let s = przejdzDoNastepnejFazy(sesja('spotkania'));
    s = wykonaj(tresc, s, { opId: 'd', stolik: 'A', polecenie: { typ: 'decyzja', ktora: 'r1', opcja: 'A' } }).sesja;
    for (const runda of ['R1', 'R2', 'R3'] as const) {
      if (runda !== 'R1') s = przejdzDoNastepnejFazy(s);
      s = wykonaj(tresc, s, { opId: `a-${runda}`, stolik: 'A', polecenie: { typ: 'akcje', akcje: ['A1'] } }).sesja;
    }
    expect(s.stoliki.A.liczniki.spotkania).toBe(3);
    expect(s.stoliki.A.liczniki.ryzyko).toBe(2);
  });
});
