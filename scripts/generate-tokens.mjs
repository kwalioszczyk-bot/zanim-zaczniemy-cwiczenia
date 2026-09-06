#!/usr/bin/env node
// Generuje tokeny dostępu dla uczestników, wypisuje je JAWNIE na konsolę (do wręczenia)
// i zapisuje WYŁĄCZNIE ich skróty SHA-256 do src/tokens.json.
//
// Jedna osoba = jeden token. Token jest jedyną "tożsamością" w systemie — aplikacja nigdy
// nie pyta o imię, nazwisko ani żadne dane kontaktowe, więc to na prowadzącej spoczywa
// przypisanie tokenu do konkretnej osoby, poza tą aplikacją (np. na kartce, przy wręczeniu).
//
// Użycie:
//   node scripts/generate-tokens.mjs [liczbaTokenow] [rok] [waznoscMiesiecy] [--label "opis"]
//   npm run tokens -- 25 2026 9 --label "Grupa A, cykl wiosna 2026"
//
// --label dopisuje pomocniczy opis obok KAŻDEGO wypisanego tokenu — wyłącznie na konsoli,
// dla prowadzącej. Nie trafia do src/tokens.json ani do samej aplikacji.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "src", "tokens.json");

const argv = process.argv.slice(2);
const labelIndex = argv.indexOf("--label");
let etykieta = null;
if (labelIndex !== -1) {
  etykieta = argv[labelIndex + 1] ?? null;
  argv.splice(labelIndex, etykieta != null ? 2 : 1);
}

const liczba = Number(argv[0] ?? 20);
const rok = argv[1] ?? String(new Date().getFullYear());
const waznoscMiesiecy = Number(argv[2] ?? 9);

// Bez znaków mylących się wizualnie: 0/O, 1/I.
const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function losowyFragment(dlugosc) {
  let out = "";
  for (let i = 0; i < dlugosc; i++) {
    out += ALFABET[Math.floor(Math.random() * ALFABET.length)];
  }
  return out;
}

function sha256Hex(text) {
  return createHash("sha256").update(text.trim().toUpperCase()).digest("hex");
}

const tokeny = new Set();
while (tokeny.size < liczba) {
  tokeny.add(`TUR-${rok}-${losowyFragment(4)}`);
}

const listaTokenow = [...tokeny];
const hashe = listaTokenow.map(sha256Hex);

writeFileSync(
  outPath,
  JSON.stringify({ wersja: 1, waznoscMiesiecy, hashe }, null, 2) + "\n",
  "utf-8"
);

console.log(`\nWygenerowano ${listaTokenow.length} tokenów (ważność: ${waznoscMiesiecy} mies. od pierwszego logowania).`);
console.log("Skróty zapisano w src/tokens.json — zbuduj i wdróż aplikację ponownie, żeby zaczęły działać.\n");
console.log("Tokeny do wręczenia uczestnikom (ta lista NIE jest nigdzie zapisywana — skopiuj ją teraz):\n");
listaTokenow.forEach((t) => console.log(etykieta ? `  ${t}   (${etykieta})` : `  ${t}`));
console.log("");
