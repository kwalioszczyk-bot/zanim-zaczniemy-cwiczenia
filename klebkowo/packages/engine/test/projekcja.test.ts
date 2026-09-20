import { describe, expect, it } from 'vitest';
import { trescDlaEkranu, trescDlaStolika } from '../src/projekcja.ts';
import { ID_ROL, ID_STOLIKOW } from '../src/typy.ts';
import { tresc } from './pomoc.ts';

describe('treść wysyłana do stolika', () => {
  it('nie zawiera klucza decyzji, skutków ani ukrytych liczników', () => {
    for (const id of ID_STOLIKOW) {
      const json = JSON.stringify(trescDlaStolika(tresc, id));
      expect(json).not.toMatch(/opcja_zgodna/);
      expect(json).not.toMatch(/skutki_opcji/);
      expect(json).not.toMatch(/ukryt/i);
      expect(json).not.toMatch(/ryzyko/i);
      expect(json).not.toMatch(/spotkania/i);
      expect(json).not.toMatch(/omowienie|nie_ujawniac|Stasser/i);
      expect(json).not.toMatch(/reguly_naglowka/);
      expect(json).not.toMatch(/uwaga_dla_omowienia/);
    }
  });

  it('nie zdradza treści pozostałych stolików', () => {
    const json = JSON.stringify(trescDlaStolika(tresc, 'A'));
    expect(json).toContain('Ogród Wszystkich');
    for (const inny of ['Kino na Podwórku', 'Pokolenia przy Stole', 'Trasa Bez Barier'])
      expect(json).not.toContain(inny);
  });

  it('zawiera wszystko, czego stolik potrzebuje do gry', () => {
    const t = trescDlaStolika(tresc, 'B');
    expect(t.akcje).toHaveLength(9);
    expect(t.zdarzenia).toHaveLength(12);
    expect(t.role).toHaveLength(5);
    expect(t.role.every((r) => r.wiadomosc_od_przelozonego.length > 0)).toBe(true);
    for (const rola of ID_ROL) {
      expect(t.stolik.decyzja_r1.informacje_unikalne[rola]).toBeTruthy();
      expect(t.stolik.decyzja_r3.informacje_unikalne[rola]).toBeTruthy();
    }
    expect(t.stolik.zwrot_akcji.tytul).toBe('A licencja?');
    expect(t.komunikat_decyzji).toBe('Decyzja zapisana.');
    expect(t.liczniki.jawne).toHaveLength(4);
  });

  it('reakcje na zdarzenia mają etykiety, ale nie mają efektów', () => {
    const e8 = trescDlaStolika(tresc, 'A').zdarzenia.find((z) => z.id === 'E8')!;
    expect(e8.wybor).toHaveLength(3);
    expect(JSON.stringify(e8)).not.toMatch(/efekt/);
  });

  it('treść ekranu sali nie zawiera kart decyzji ani ukrytych danych', () => {
    const json = JSON.stringify(trescDlaEkranu(tresc));
    expect(json).not.toMatch(/opcja_zgodna|informacje_unikalne|ryzyko|skutki_opcji/);
    expect(json).toContain('Nowe Podwórko');
  });
});
