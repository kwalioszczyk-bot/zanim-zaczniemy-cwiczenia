/**
 * Wspólny arkusz stylów wersji papierowej.
 * Zasada: bez ciemnych, pełnych teł i bez białego tekstu na czerni — wszystko ma się
 * dobrze wydrukować na zwykłej drukarce, także czarno-białej.
 */
export function stylDruku(bazaFontow: string): string {
  return `
@page { size: A4; margin: 12mm 10mm; }

@font-face { font-family: 'Caveat Brush'; src: url('${bazaFontow}/CaveatBrush-400-latin.woff2') format('woff2'); font-weight: 400; }
@font-face { font-family: 'Caveat Brush'; src: url('${bazaFontow}/CaveatBrush-400-latin-ext.woff2') format('woff2'); font-weight: 400; unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Patrick Hand'; src: url('${bazaFontow}/PatrickHand-400-latin.woff2') format('woff2'); font-weight: 400; }
@font-face { font-family: 'Patrick Hand'; src: url('${bazaFontow}/PatrickHand-400-latin-ext.woff2') format('woff2'); font-weight: 400; unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Caveat'; src: url('${bazaFontow}/Caveat-700-latin.woff2') format('woff2'); font-weight: 700; }
@font-face { font-family: 'Caveat'; src: url('${bazaFontow}/Caveat-700-latin-ext.woff2') format('woff2'); font-weight: 700; unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Carlito'; src: url('${bazaFontow}/Carlito-400-latin.woff2') format('woff2'); font-weight: 400; }
@font-face { font-family: 'Carlito'; src: url('${bazaFontow}/Carlito-400-latin-ext.woff2') format('woff2'); font-weight: 400; unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Carlito'; src: url('${bazaFontow}/Carlito-700-latin.woff2') format('woff2'); font-weight: 700; }
@font-face { font-family: 'Carlito'; src: url('${bazaFontow}/Carlito-700-latin-ext.woff2') format('woff2'); font-weight: 700; unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Carlito', 'Segoe UI', sans-serif;
  font-size: 10.5pt;
  line-height: 1.42;
  color: #232323;
  background: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

h1, h2, h3, h4 { font-family: 'Caveat Brush', cursive; font-weight: 400; margin: 0 0 4mm; line-height: 1.1; }
h1 { font-size: 24pt; }
h2 { font-size: 17pt; }
h3 { font-size: 13.5pt; font-family: 'Patrick Hand', cursive; }
h4 { font-size: 11.5pt; font-family: 'Patrick Hand', cursive; margin-bottom: 2mm; }
p { margin: 0 0 2.6mm; }
ul, ol { margin: 0 0 3mm; padding-left: 5mm; }
li { margin-bottom: 1.4mm; }
strong { font-weight: 700; }

.strona { page-break-after: always; break-after: page; }
.strona:last-child { page-break-after: auto; break-after: auto; }
/* 297mm − marginesy 2×12mm */
.strona--pelna { height: 272mm; display: flex; flex-direction: column; overflow: hidden; }
/* A4 poziomo: 210mm − marginesy drukarskie; zapas, żeby plansza została na jednym arkuszu */
.strona--pozioma { height: 184mm; display: flex; flex-direction: column; overflow: hidden; }

.naglowek-arkusza {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2.5px solid #232323;
  padding-bottom: 2mm;
  margin-bottom: 5mm;
}
.naglowek-arkusza .tytul { font-family: 'Caveat Brush', cursive; font-size: 19pt; }
.naglowek-arkusza .podpis { font-family: 'Patrick Hand', cursive; font-size: 10pt; }

/* --- siatki kart z liniami cięcia ---------------------------------------- */
.siatka-kart { display: grid; gap: 0; flex: 1; min-height: 0; }
.siatka-kart--a6 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.siatka-kart--a5 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
.siatka-kart--a7 { grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); }

.karta-ciecia {
  border: 1px dashed #9a948a;
  padding: 5mm 6mm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* --- karta w stylu flipchartu -------------------------------------------- */
.karta {
  border: 2.5px solid #232323;
  border-radius: 6mm 2mm 5mm 2mm / 2mm 5mm 2mm 6mm;
  padding: 4mm 5mm;
  background: #fdfcf8;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.karta--blekit { background: #f2fafd; }
.karta--zielen { background: #f5faee; }
.karta--bez { background: #faf6ec; }
.karta--brzoskwinia { background: #fff6ef; }
.karta__naglowek {
  font-family: 'Patrick Hand', cursive;
  font-size: 12.5pt;
  border-bottom: 2px dashed #cfc9bd;
  padding-bottom: 1.6mm;
  margin-bottom: 2.4mm;
  display: flex;
  justify-content: space-between;
  gap: 3mm;
  align-items: baseline;
}
.karta__stopka {
  margin-top: auto;
  padding-top: 2mm;
  border-top: 2px dashed #cfc9bd;
  font-family: 'Patrick Hand', cursive;
  font-size: 9pt;
}
.karta__kod { font-family: 'Carlito', sans-serif; font-size: 8.5pt; letter-spacing: 0.08em; }

.etykieta {
  display: inline-block;
  border: 2px solid #232323;
  border-radius: 999px;
  padding: 0.3mm 2.4mm;
  font-family: 'Patrick Hand', cursive;
  font-size: 9pt;
  background: #e6e0d4;
  white-space: nowrap;
}
.etykieta--jasna { background: #cfe7b0; }
.etykieta--brzoskwinia { background: #f9c9a3; }

.ramka {
  border: 2.5px solid #232323;
  border-radius: 4mm 1.5mm 4mm 1.5mm / 1.5mm 4mm 1.5mm 4mm;
  padding: 3.5mm 4.5mm;
  margin-bottom: 4mm;
  background: #fdfcf8;
}
.ramka--uwaga { background: #fff4e8; }
.ramka--cicha { background: #f6f4ee; }

table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 4mm; }
th, td { border: 1.5px solid #232323; padding: 1.4mm 2mm; text-align: left; vertical-align: top; }
th { background: #e6e0d4; font-family: 'Patrick Hand', cursive; font-weight: 400; }
tr { page-break-inside: avoid; }

.kolumny { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.kolumny--3 { grid-template-columns: repeat(3, 1fr); }

.tor-druk { display: flex; align-items: center; gap: 2mm; margin-bottom: 2.6mm; }
.tor-druk__nazwa { font-family: 'Patrick Hand', cursive; font-size: 10.5pt; width: 38mm; }
.tor-druk__pola { display: flex; gap: 1mm; }
.tor-druk__pole {
  width: 9mm;
  height: 9mm;
  border: 2px solid #232323;
  border-radius: 1.5mm 2.5mm 1.5mm 2.5mm;
  display: grid;
  place-items: center;
  font-size: 8pt;
  color: #6a655c;
}
.tor-druk__pole--start { background: #cfe7b0; }

.linie { border-bottom: 1.5px dashed #9a948a; height: 7mm; margin-bottom: 1mm; }

.rewers {
  display: grid;
  place-items: center;
  text-align: center;
  font-family: 'Caveat Brush', cursive;
  font-size: 15pt;
  height: 100%;
  background: #faf6ec;
}

.doodle { display: block; }
.cytat { font-family: 'Caveat', cursive; font-size: 12.5pt; }
.male { font-size: 8.8pt; color: #4a463f; }
.nie-lam { page-break-inside: avoid; break-inside: avoid; }

/* Znaczniki cięcia w narożnikach strony */
.znacznik { position: fixed; width: 6mm; height: 6mm; }
.znacznik--lg { top: 3mm; left: 3mm; border-top: 1px solid #232323; border-left: 1px solid #232323; }
.znacznik--pg { top: 3mm; right: 3mm; border-top: 1px solid #232323; border-right: 1px solid #232323; }
.znacznik--ld { bottom: 3mm; left: 3mm; border-bottom: 1px solid #232323; border-left: 1px solid #232323; }
.znacznik--pd { bottom: 3mm; right: 3mm; border-bottom: 1px solid #232323; border-right: 1px solid #232323; }
`;
}
