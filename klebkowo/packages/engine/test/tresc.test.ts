import { describe, expect, it } from 'vitest';
import { BladTresci, sprawdzSpojnosc, wczytajTresc } from '../src/schemat.ts';
import { ID_ROL, ID_STOLIKOW } from '../src/typy.ts';
import { surowaTresc, tresc } from './pomoc.ts';

describe('walidacja treści gry', () => {
  it('plik content/gra.json przechodzi walidację', () => {
    expect(() => wczytajTresc(surowaTresc)).not.toThrow();
    expect(sprawdzSpojnosc(tresc)).toEqual([]);
  });

  it('każdy stolik ma decyzje r1 i r3 z informacjami unikalnymi dla R1–R5', () => {
    for (const s of tresc.stoliki)
      for (const d of [s.decyzja_r1, s.decyzja_r3])
        for (const rola of ID_ROL) expect(d.informacje_unikalne[rola], `${s.id}/${rola}`).toBeTruthy();
  });

  it('każda niezgodna opcja ma kartę skutku, a opcja zgodna jej nie ma', () => {
    for (const s of tresc.stoliki)
      for (const d of [s.decyzja_r1, s.decyzja_r3]) {
        for (const opcja of Object.keys(d.opcje)) {
          if (opcja === d.opcja_zgodna_z_pelna_wiedza) expect(d.skutki_opcji[opcja]).toBeUndefined();
          else expect(d.skutki_opcji[opcja], `${s.id}/${opcja}`).toBeTruthy();
        }
      }
  });

  it('każde zdarzenie z kolejności istnieje w talii', () => {
    const idZdarzen = new Set(tresc.zdarzenia.map((z) => z.id));
    for (const stolik of ID_STOLIKOW)
      for (const runda of ['R1', 'R2', 'R3'] as const)
        for (const e of tresc.kolejnosc_zdarzen[stolik]![runda]) expect(idZdarzen.has(e), `${stolik}/${runda}/${e}`).toBe(true);
  });

  it('runda 2 ma dwa zdarzenia na każdym stoliku', () => {
    for (const stolik of ID_STOLIKOW) expect(tresc.kolejnosc_zdarzen[stolik]!.R2).toHaveLength(2);
  });

  it('niepoprawny plik zatrzymuje start gry z czytelnym komunikatem po polsku', () => {
    const zepsuta = structuredClone(surowaTresc);
    delete zepsuta.kronika;
    expect(() => wczytajTresc(zepsuta)).toThrow(BladTresci);
    try {
      wczytajTresc(zepsuta);
    } catch (e) {
      expect((e as Error).message).toContain('gra nie może wystartować');
    }
  });

  it('wykrywa brak informacji unikalnej dla roli', () => {
    const zepsuta = structuredClone(surowaTresc);
    delete zepsuta.stoliki[0].decyzja_r1.informacje_unikalne.R3;
    expect(() => wczytajTresc(zepsuta)).toThrow(/brak informacji unikalnej dla roli R3/i);
  });

  it('wykrywa zdarzenie spoza talii w kolejności', () => {
    const zepsuta = structuredClone(surowaTresc);
    zepsuta.kolejnosc_zdarzen.A.R1 = ['E99'];
    expect(() => wczytajTresc(zepsuta)).toThrow(/E99/);
  });
});
