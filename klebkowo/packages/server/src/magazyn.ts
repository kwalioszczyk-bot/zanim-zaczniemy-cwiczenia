/**
 * Magazyn sesji: stan w pamięci, migawka do pliku JSON.
 * Brak bazy danych. Migawka zapisywana co 10 sekund i przy każdej zmianie fazy,
 * żeby restart serwera w trakcie szkolenia nie kosztował gry.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { StanSesji } from '@klebkowo/engine';

const DOBA_MS = 24 * 60 * 60 * 1000;

export class Magazyn {
  private sesje = new Map<string, StanSesji>();
  private brudne = new Set<string>();
  private zegar: NodeJS.Timeout | null = null;

  constructor(private readonly katalog: string) {
    mkdirSync(katalog, { recursive: true });
    this.wczytajZDysku();
  }

  private sciezka(id: string): string {
    return join(this.katalog, `${id.replace(/[^A-Za-z0-9_-]/g, '')}.json`);
  }

  private wczytajZDysku(): void {
    let pliki: string[] = [];
    try {
      pliki = readdirSync(this.katalog).filter((p) => p.endsWith('.json'));
    } catch {
      return;
    }
    for (const plik of pliki) {
      try {
        const sesja = JSON.parse(readFileSync(join(this.katalog, plik), 'utf8')) as StanSesji;
        if (Date.now() - new Date(sesja.utworzona).getTime() > DOBA_MS) {
          rmSync(join(this.katalog, plik), { force: true });
          continue;
        }
        this.sesje.set(sesja.id, sesja);
      } catch {
        // uszkodzona migawka nie może zatrzymać startu serwera
      }
    }
  }

  zapisz(sesja: StanSesji, natychmiast = false): void {
    this.sesje.set(sesja.id, sesja);
    if (natychmiast) this.zrzuc(sesja.id);
    else this.brudne.add(sesja.id);
  }

  private zrzuc(id: string): void {
    const sesja = this.sesje.get(id);
    if (!sesja) return;
    try {
      writeFileSync(this.sciezka(id), JSON.stringify(sesja), 'utf8');
    } catch {
      // brak miejsca albo prawa do zapisu — gra toczy się dalej w pamięci
    }
    this.brudne.delete(id);
  }

  pobierz(id: string): StanSesji | undefined {
    return this.sesje.get(id);
  }

  /** Odnajduje sesję po kodzie stolika (kody są unikalne w obrębie sesji). */
  poKodzie(kod: string): { sesja: StanSesji; stolik: string } | undefined {
    const szukany = kod.toUpperCase();
    for (const sesja of this.sesje.values()) {
      const stolik = sesja.kody[szukany];
      if (stolik) return { sesja, stolik };
    }
    return undefined;
  }

  wszystkie(): StanSesji[] {
    return [...this.sesje.values()];
  }

  usun(id: string): void {
    this.sesje.delete(id);
    this.brudne.delete(id);
    try {
      rmSync(this.sciezka(id), { force: true });
    } catch {
      /* nic */
    }
  }

  /** Usuwa sesje starsze niż doba — dane szkolenia nie zostają na dysku dłużej. */
  sprzatnij(teraz = Date.now()): number {
    let usuniete = 0;
    for (const sesja of [...this.sesje.values()])
      if (teraz - new Date(sesja.utworzona).getTime() > DOBA_MS) {
        this.usun(sesja.id);
        usuniete += 1;
      }
    return usuniete;
  }

  start(intervalMs = 10_000): void {
    if (this.zegar) return;
    this.zegar = setInterval(() => {
      for (const id of [...this.brudne]) this.zrzuc(id);
      this.sprzatnij();
    }, intervalMs);
    this.zegar.unref?.();
  }

  stop(): void {
    if (this.zegar) clearInterval(this.zegar);
    this.zegar = null;
    for (const id of [...this.brudne]) this.zrzuc(id);
  }
}
