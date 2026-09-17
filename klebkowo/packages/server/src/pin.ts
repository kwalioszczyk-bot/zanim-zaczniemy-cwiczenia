/** PIN prowadzącej: przechowywany wyłącznie jako skrót, z limitem prób. */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function zahashujPin(pin: string): string {
  const sol = randomBytes(16);
  const skrot = scryptSync(pin, sol, 32);
  return `${sol.toString('hex')}:${skrot.toString('hex')}`;
}

export function sprawdzPin(pin: string, hash: string | undefined): boolean {
  if (!hash) return false;
  const [solHex, skrotHex] = hash.split(':');
  if (!solHex || !skrotHex) return false;
  const oczekiwany = Buffer.from(skrotHex, 'hex');
  const podany = scryptSync(pin, Buffer.from(solHex, 'hex'), oczekiwany.length);
  return oczekiwany.length === podany.length && timingSafeEqual(oczekiwany, podany);
}

export function poprawnyFormatPin(pin: unknown): pin is string {
  return typeof pin === 'string' && /^\d{4,6}$/.test(pin);
}

/** Prosty licznik nieudanych prób — po przekroczeniu limitu blokada na kilka minut. */
export class LimitProb {
  private proby = new Map<string, { liczba: number; do: number }>();
  constructor(private readonly limit = 5, private readonly blokadaMs = 5 * 60_000) {}

  zablokowany(klucz: string, teraz = Date.now()): number {
    const wpis = this.proby.get(klucz);
    if (!wpis) return 0;
    if (wpis.liczba < this.limit) return 0;
    if (wpis.do <= teraz) {
      this.proby.delete(klucz);
      return 0;
    }
    return Math.ceil((wpis.do - teraz) / 1000);
  }

  nieudana(klucz: string, teraz = Date.now()): void {
    const wpis = this.proby.get(klucz) ?? { liczba: 0, do: 0 };
    wpis.liczba += 1;
    wpis.do = teraz + this.blokadaMs;
    this.proby.set(klucz, wpis);
  }

  udana(klucz: string): void {
    this.proby.delete(klucz);
  }
}
