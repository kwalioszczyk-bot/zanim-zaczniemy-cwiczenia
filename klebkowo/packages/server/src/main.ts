/** Uruchomienie serwera na laptopie prowadzącej. */
import { networkInterfaces } from 'node:os';
import { BladTresci } from '@klebkowo/engine';
import { zbudujSerwer } from './aplikacja.ts';

const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? '0.0.0.0';

export function adresyWSieciLokalnej(port: number): string[] {
  const adresy: string[] = [];
  for (const karty of Object.values(networkInterfaces()))
    for (const karta of karty ?? [])
      if (karta.family === 'IPv4' && !karta.internal) adresy.push(`http://${karta.address}:${port}`);
  return adresy;
}

async function start() {
  let app;
  try {
    app = zbudujSerwer({ logger: process.env.LOG === '1' });
  } catch (b) {
    if (b instanceof BladTresci) {
      console.error('\n' + b.message + '\n');
      process.exit(1);
    }
    throw b;
  }

  await app.listen({ port: PORT, host: HOST });

  const adresy = adresyWSieciLokalnej(PORT);
  console.log('');
  console.log('  KŁĘBKOWO. Sprawa się plącze — serwer gry działa.');
  console.log('');
  console.log(`  Na tym komputerze:   http://localhost:${PORT}`);
  for (const a of adresy) console.log(`  W sieci lokalnej:    ${a}`);
  console.log('');
  console.log('  Otwórz adres „W sieci lokalnej” na laptopie prowadzącej i wybierz „Prowadząca”.');
  console.log('  Kody i kody QR dla stolików pojawią się po utworzeniu sesji.');
  console.log('  Zatrzymanie serwera: Ctrl + C');
  console.log('');

  for (const sygnal of ['SIGINT', 'SIGTERM'] as const)
    process.on(sygnal, () => {
      app.close().then(() => process.exit(0));
    });
}

start().catch((b) => {
  console.error('Nie udało się uruchomić serwera:', b);
  process.exit(1);
});
