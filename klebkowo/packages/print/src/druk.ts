/**
 * `npm run druk` — generuje komplet PDF-ów do folderu `druk/`.
 * Wszystko lokalnie: Playwright + Chromium zainstalowany w systemie.
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { BladTresci, wczytajTresc } from '@klebkowo/engine';
import { ARKUSZE } from './arkusze.ts';

const TU = dirname(fileURLToPath(import.meta.url));
const KORZEN = join(TU, '..', '..', '..');
const WYJSCIE = join(KORZEN, 'druk');
const HTML = join(WYJSCIE, 'html');
const FONTY = join(KORZEN, 'packages', 'web', 'public', 'fonts');

async function main() {
  const tylkoHtml = process.argv.includes('--tylko-html');
  const filtr = process.argv.find((a) => a.startsWith('--arkusz='))?.split('=')[1];

  let tresc;
  try {
    tresc = wczytajTresc(JSON.parse(readFileSync(join(KORZEN, 'content', 'gra.json'), 'utf8')));
  } catch (b) {
    if (b instanceof BladTresci) {
      console.error('\n' + b.message + '\n');
      process.exit(1);
    }
    throw b;
  }

  mkdirSync(HTML, { recursive: true });
  cpSync(FONTY, join(HTML, 'fonts'), { recursive: true });

  const arkusze = filtr ? ARKUSZE.filter((a) => a.plik.includes(filtr)) : ARKUSZE;
  if (!arkusze.length) {
    console.error(`Nie znam arkusza pasującego do „${filtr}”.`);
    process.exit(1);
  }

  console.log(`\n  Składam ${arkusze.length} arkuszy wersji papierowej…\n`);
  for (const a of arkusze) {
    writeFileSync(join(HTML, `${a.plik}.html`), a.zbuduj(tresc, 'fonts'), 'utf8');
    console.log(`  · ${a.plik}.html`);
  }

  if (tylkoHtml) {
    console.log(`\n  Gotowe. Pliki HTML leżą w ${HTML}\n`);
    return;
  }

  const { chromium } = await import('playwright');
  const przegladarka = await chromium.launch();
  const strona = await przegladarka.newPage();

  console.log('');
  for (const a of arkusze) {
    const plik = join(HTML, `${a.plik}.html`);
    await strona.goto(pathToFileURL(plik).href, { waitUntil: 'networkidle' });
    await strona.emulateMedia({ media: 'print' });
    await strona.pdf({
      path: join(WYJSCIE, `${a.plik}.pdf`),
      format: 'A4',
      landscape: Boolean(a.poziomo),
      printBackground: true,
      preferCSSPageSize: !a.poziomo,
    });
    console.log(`  ✓ ${a.plik}.pdf${a.tylkoDlaProwadzacej ? '   (tylko dla prowadzącej)' : ''}`);
  }

  await przegladarka.close();
  console.log(`\n  Komplet gotowy: ${WYJSCIE}\n`);
  console.log('  Pamiętaj: pliki 00, 07 i 10 są wyłącznie dla prowadzącej.\n');
}

main().catch((b) => {
  console.error('Nie udało się przygotować wersji papierowej:', b);
  process.exit(1);
});
