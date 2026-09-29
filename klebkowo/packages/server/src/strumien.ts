/** Server-Sent Events: rozgłaszanie zmian stanu. Klient sam wraca do odpytywania, gdy sieć zawodzi. */
import type { FastifyReply } from 'fastify';

interface Sluchacz {
  id: number;
  sesja: string;
  odpowiedz: FastifyReply;
}

export class Strumienie {
  private sluchacze = new Map<number, Sluchacz>();
  private kolejnyId = 1;

  dodaj(sesja: string, odpowiedz: FastifyReply): number {
    const id = this.kolejnyId++;
    this.sluchacze.set(id, { id, sesja, odpowiedz });
    return id;
  }

  usun(id: number): void {
    this.sluchacze.delete(id);
  }

  /** Rozgłasza zdarzenie do wszystkich urządzeń podłączonych do danej sesji. */
  rozgloś(sesja: string, typ: string, dane: unknown): void {
    const ładunek = `event: ${typ}\ndata: ${JSON.stringify(dane)}\n\n`;
    for (const s of this.sluchacze.values()) {
      if (s.sesja !== sesja) continue;
      try {
        s.odpowiedz.raw.write(ładunek);
      } catch {
        this.sluchacze.delete(s.id);
      }
    }
  }

  puls(): void {
    for (const s of this.sluchacze.values()) {
      try {
        s.odpowiedz.raw.write(': puls\n\n');
      } catch {
        this.sluchacze.delete(s.id);
      }
    }
  }

  get liczba(): number {
    return this.sluchacze.size;
  }
}
