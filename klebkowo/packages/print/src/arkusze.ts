/**
 * Wersja papierowa gry — pełnoprawna, nie uproszczona.
 * Wszystkie teksty pochodzą z `content/gra.json`; ten moduł tylko je składa.
 */
import { ID_ROL, ID_STOLIKOW, type IdRoli, type IdStolika } from '@klebkowo/engine/typy';
import type { Tresc } from '@klebkowo/engine';
import { arkuszDlaUczestnikow, kartySciagawki, stronyPelnychZasad } from './zasady.ts';
import {
  KOT,
  NOZYCZKI,
  arkuszKart,
  bezpieczny,
  doodle,
  dokument,
  karta,
  linie,
  naglowekArkusza,
  opiszEfekt,
  strona,
  torDruku,
} from './elementy.ts';

export interface Arkusz {
  plik: string;
  tytul: string;
  opis: string;
  /** Czy arkusz zawiera dane, których uczestnicy nie mogą zobaczyć. */
  tylkoDlaProwadzacej?: boolean;
  poziomo?: boolean;
  zbuduj: (t: Tresc, bazaFontow: string) => string;
}

const PODPIS = 'KŁĘBKOWO. Sprawa się plącze';
const nazwyLicznikow = (t: Tresc): Record<string, string> =>
  Object.fromEntries([...t.liczniki.jawne, ...t.liczniki.ukryte].map((l) => [l.id, l.nazwa]));

const rolaOpis = (t: Tresc, id: IdRoli) => t.role.find((r) => r.id === id)!;
const stolikOpis = (t: Tresc, id: IdStolika) => t.stoliki.find((s) => s.id === id)!;

/* ------------------------------------------------- 00. instrukcja prowadzącej */
/*
 * TODO: do akceptacji prowadzącej — procedura papierowa, opis przygotowania sali
 * i podpisy pomocnicze na planszy są tekstami dopisanymi na potrzeby wersji papierowej.
 * Wszystkie treści fabularne pochodzą dosłownie z content/gra.json.
 */

const instrukcja: Arkusz = {
  plik: '00_instrukcja_prowadzacej',
  tytul: 'Instrukcja prowadzącej',
  opis: 'Cel, przygotowanie sali, przebieg minutowy, klucz decyzji, zasady Kroniki oraz pełne zasady gry.',
  tylkoDlaProwadzacej: true,
  zbuduj(t, baza) {
    const nazwy = nazwyLicznikow(t);
    const minuty = t.struktura_rundy.reduce((s, f) => s + f.minuty, 0);

    const przebieg = `<table>
      <thead><tr><th>Faza</th><th>Min</th><th>Kroki</th></tr></thead>
      <tbody>${t.struktura_rundy
        .map((f) => `<tr><td><strong>${bezpieczny(f.nazwa)}</strong></td><td>${f.minuty}</td><td>${f.kroki.map(bezpieczny).join(' → ')}</td></tr>`)
        .join('')}</tbody>
    </table>`;

    const akcje = `<table>
      <thead><tr><th>Akcja</th><th>Efekt jawny</th><th>Chroni przed</th><th>Uwagi (tylko dla prowadzącej)</th></tr></thead>
      <tbody>${t.akcje
        .map(
          (a) =>
            `<tr><td><strong>${a.id}</strong> ${bezpieczny(a.nazwa)}${a.duza ? ' ✦' : ''}</td>` +
            `<td>${opiszEfekt(a.efekt, nazwy)}</td>` +
            `<td>${(a.chroni_przed ?? []).join(', ') || '—'}</td>` +
            `<td>${[
              a.ukryty_efekt ? `ukryty: ${opiszEfekt(a.ukryty_efekt, nazwy)}` : '',
              a.uwaga_dla_omowienia ?? '',
              a.wymaga ? `wymaga ${a.wymaga}; bez tego: ${opiszEfekt(a.efekt_bez_wymogu ?? {}, nazwy)}` : '',
              a.lagodzi_zwrot_akcji ? `łagodzi zwrot akcji o ${a.lagodzi_zwrot_akcji}` : '',
            ]
              .filter(Boolean)
              .map(bezpieczny)
              .join('; ') || '—'}</td></tr>`,
        )
        .join('')}</tbody></table>
      <p class="male">✦ — działanie duże: niedostępne dla zespołu przeciążonego.</p>`;

    const zdarzenia = `<table>
      <thead><tr><th>Zdarzenie</th><th>Efekt</th><th>Ochrona</th></tr></thead>
      <tbody>${t.zdarzenia
        .map((z) => {
          const efekt = z.wybor
            ? z.wybor.map((w, i) => `${String.fromCharCode(65 + i)}) ${opiszEfekt(w.efekt, nazwy)}${w.ukryty_efekt ? ` [ukryty: ${opiszEfekt(w.ukryty_efekt, nazwy)}]` : ''}`).join('<br>')
            : z.warunek
              ? `${bezpieczny(nazwy[z.warunek.licznik] ?? z.warunek.licznik)} &lt; ${z.warunek.prog}: ${opiszEfekt(z.warunek.efekt_gdy_ponizej, nazwy)}<br>` +
                `${bezpieczny(nazwy[z.warunek.licznik] ?? z.warunek.licznik)} ≥ ${z.warunek.prog}: ${opiszEfekt(z.warunek.efekt_gdy_rowny_lub_powyzej, nazwy)}`
              : opiszEfekt(z.efekt ?? {}, nazwy);
          const ochrona = z.ochrona ? `${z.ochrona} (od kolejnej rundy)` : z.ochrona_warunek ? bezpieczny(z.ochrona_warunek) : '—';
          return `<tr><td><strong>${z.id}</strong> ${bezpieczny(z.tytul)}</td><td>${efekt}</td><td>${ochrona}</td></tr>`;
        })
        .join('')}</tbody></table>`;

    const kolejnosc = `<table>
      <thead><tr><th>Stolik</th><th>Runda 1</th><th>Runda 2</th><th>Runda 3</th></tr></thead>
      <tbody>${ID_STOLIKOW.map((id) => {
        const k = t.kolejnosc_zdarzen[id]!;
        return `<tr><td><strong>${id}</strong> ${bezpieczny(stolikOpis(t, id).nazwa)}</td><td>${k.R1.join(', ')}</td><td>${k.R2.join(', ')}</td><td>${k.R3.join(', ')}</td></tr>`;
      }).join('')}</tbody></table>`;

    const klucz = `<table>
      <thead><tr><th>Stolik</th><th>Decyzja</th><th>Opcja zgodna z pełną wiedzą</th><th>Karty skutków do wydania</th></tr></thead>
      <tbody>${ID_STOLIKOW.flatMap((id) => {
        const s = stolikOpis(t, id);
        return (['r1', 'r3'] as const).map((ktora) => {
          const d = ktora === 'r1' ? s.decyzja_r1 : s.decyzja_r3;
          const skutki = Object.keys(d.skutki_opcji).map((o) => `${id}-${ktora.toUpperCase()}-${o}`).join(', ');
          return `<tr><td><strong>${id}</strong></td><td>${ktora === 'r1' ? 'runda 1' : 'runda 3'}</td><td><strong>${d.opcja_zgodna_z_pelna_wiedza}</strong> — ${bezpieczny(d.opcje[d.opcja_zgodna_z_pelna_wiedza] ?? '')}</td><td>${skutki}</td></tr>`;
        });
      }).join('')}</tbody></table>`;

    const kronika = `<table>
      <thead><tr><th>Warunek</th><th>Nagłówek</th></tr></thead>
      <tbody>${t.kronika.reguly_naglowka
        .map((r) => `<tr><td><code>${bezpieczny(r.warunek)}</code></td><td>${bezpieczny(r.tekst)}</td></tr>`)
        .join('')}</tbody></table>
      <h4>Zdania dodatkowe (dopisz wszystkie pasujące)</h4>
      <table><tbody>${t.kronika.zdania_dodatkowe
        .map((r) => `<tr><td style="width:32mm"><code>${bezpieczny(r.warunek)}</code></td><td>${bezpieczny(r.tekst)}</td></tr>`)
        .join('')}</tbody></table>`;

    return dokument(
      'Instrukcja prowadzącej',
      strona(`${naglowekArkusza('Instrukcja prowadzącej', PODPIS)}
        <div class="ramka ramka--uwaga">
          <h3>Nie ujawniać w dniu 1</h3>
          <ul>${t.omowienie.dzien_1.nie_ujawniac.map((n) => `<li>${bezpieczny(n)}</li>`).join('')}</ul>
        </div>
        <h2>Po co ta gra</h2>
        <p>${bezpieczny(t.meta.podtytul)}. Cztery zespoły międzyinstytucjonalne prowadzą cztery przedsięwzięcia w tej samej dzielnicy. Gra trwa ${minuty} minut i nie ma w niej zwycięzców ani rankingu.</p>
        <div class="ramka">
          <h3>Zasady do odczytania</h3>
          <ul>${t.zasady.map((z) => `<li>${bezpieczny(z)}</li>`).join('')}</ul>
        </div>
        <h2>Przygotowanie sali</h2>
        <ul>
          <li>Cztery stoliki po pięć osób. Przy każdym: plansza, komplet kart ról, karta misji, talia akcji, druki decyzji i zobowiązań, pionki liczników, kostka.</li>
          <li>Koperty „Otworzyć w rundzie 2” — po pięć na stolik.</li>
          <li>Koperty z kartami informacji — osobno na rundę 1 i rundę 3, po pięć na stolik.</li>
          <li>U prowadzącej: arkusz śledzenia (plik 10) i karty skutków (plik 07), posortowane kodem.</li>
          <li>Rozdając karty ról, zadbaj, żeby nikt nie grał własnego zawodu ani własnej instytucji — w razie potrzeby zamieńcie karty.</li>
        </ul>
        <h2>Przebieg minutowy</h2>
        ${przebieg}`) +
      strona(`<h2>Tekst wstępu do odczytania</h2>
        <div class="ramka ramka--cicha"><p class="cytat">${bezpieczny(t.wstep_do_odczytania)}</p></div>
        <h2>Jak rozstrzygać rundę na papierze</h2>
        <ol>
          <li><strong>Zdarzenia</strong> — rozstrzygamy je przed wyborem akcji. Odczytaj kartę zdarzenia stolikowi; jeśli ma opcje reakcji, zespół wybiera jedną. Sprawdź, czy zespół ma znacznik ochrony (A2–A5) wyłożony w <em>poprzedniej</em> rundzie — wtedy zdarzenie nie działa i czytasz komentarz z karty. W rundzie 1 ochrona nie jest jeszcze możliwa.</li>
          <li><strong>Karty informacji</strong> — wspólne odczytuje jedna osoba na głos, prywatne każdy czyta sam. Można mówić o wszystkim, czego się dowiedzieli. Kart nie pokazuje się innym.</li>
          <li><strong>Decyzja</strong> — zespół oddaje kartę decyzji. Sprawdzasz klucz w arkuszu (plik 10), zapisujesz ukryte ryzyko i odkładasz kartę skutku do wydania w kolejnej fazie. <strong>Zespół nie dostaje żadnej informacji o trafności decyzji.</strong> Mów zawsze to samo: „Decyzja zapisana.”</li>
          <li><strong>Akcje</strong> — do ${t.limit_akcji_na_runde} działań na rundę, każde raz. Jeśli Obciążenie wynosi ${t.liczniki.wyczerpanie.prog_obciazenia} lub więcej — tylko jedno i bez działań dużych (✦). Zespół zostaje w grze.</li>
          <li><strong>Zobowiązania</strong> — do ${t.zobowiazania.limit_na_runde} na rundę. ${bezpieczny(t.zobowiazania.zasada)}</li>
          <li><strong>Zatwierdzenie</strong> — przesuńcie pionki na torach i przejdźcie do kolejnej rundy.</li>
        </ol>
        <div class="ramka ramka--uwaga">
          <p><strong>Przy każdej decyzji mów dokładnie to samo zdanie i poświęć tyle samo czasu.</strong> Różnica w tonie albo w tempie zdradza mechanizm, który ma zostać ujawniony dopiero w dniu 2.</p>
        </div>
        <h2>Tabela efektów — akcje</h2>
        ${akcje}`) +
      strona(`<h2>Tabela efektów — zdarzenia</h2>
        ${zdarzenia}
        <h2>Kolejność zdarzeń</h2>
        ${kolejnosc}`) +
      strona(`<h2>Klucz decyzji — tylko dla prowadzącej</h2>
        <div class="ramka ramka--uwaga"><p>Tej strony nie zostawiaj na stoliku. Decyzja niezgodna z pełną wiedzą: ukryte ryzyko +2 i karta skutku w kolejnej fazie. Decyzja zgodna: bez efektu i bez karty.</p></div>
        ${klucz}
        <h2>Zasady Kroniki</h2>
        <p>Nagłówek: pierwsza pasująca reguła od góry. Kolejność ma znaczenie.</p>
        ${kronika}
        <p class="cytat">${bezpieczny(t.kronika.podpis)}</p>
        <div style="text-align:center;margin-top:8mm">${doodle(KOT, 40)}</div>`) +
      stronyPelnychZasad(t),
      baza,
    );
  },
};

/* ------------------------------------------------------------ 01. plansze A3 */

function plansza(id: IdStolika): Arkusz {
  return {
    plik: `01_plansza_stolika_A3_${id}`,
    tytul: `Plansza stolika ${id}`,
    opis: 'Tory liczników, pola na karty, ramka zasad, znacznik wyczerpania.',
    poziomo: true,
    zbuduj(t, baza) {
      const s = stolikOpis(t, id);
      const tory = t.liczniki.jawne.map((l) => torDruku(l.nazwa, l.start, l.min, l.max)).join('');
      const polaKart = ['Karta zdarzenia', 'Karta decyzji', 'Karty akcji tej rundy', 'Znaczniki ochrony (A2–A5)']
        .map(
          (n) =>
            `<div class="karta karta--bez" style="min-height:22mm;margin-bottom:3mm"><div class="karta__naglowek"><span>${n}</span></div></div>`,
        )
        .join('');

      return dokument(
        `Plansza stolika ${id}`,
        strona(
          `${naglowekArkusza(`Stolik ${id} — ${s.nazwa}`, PODPIS)}
          <div class="kolumny" style="grid-template-columns: 1.15fr 1fr">
            <div>
              <div class="ramka karta--zielen">
                <h3>Wasza misja</h3>
                <p>${bezpieczny(s.misja)}</p>
              </div>
              <h3>Tory liczników</h3>
              <p class="male">Pole podświetlone to wartość startowa. Liczniki pokazują koszt decyzji, nie ich ocenę.</p>
              ${tory}
              <div class="ramka ramka--uwaga">
                <h4>Znacznik wyczerpania</h4>
                <p class="male">Gdy ${bezpieczny(t.liczniki.jawne.find((l) => l.id === 'obciazenie')!.nazwa)} osiągnie ${t.liczniki.wyczerpanie.prog_obciazenia} lub więcej: połóż tu znacznik. ${bezpieczny(t.liczniki.wyczerpanie.skutek)}</p>
              </div>
              <div class="ramka" style="margin-bottom:0">
                <h4>Zasady</h4>
                <ul class="male" style="margin-bottom:0">${t.zasady.map((z) => `<li>${bezpieczny(z)}</li>`).join('')}</ul>
              </div>
            </div>
            <div>
              <div class="ramka karta--blekit">
                <h3>Wspólna wiedza zespołu</h3>
                <p class="male">Zapisujcie tu wszystko, co padło na głos. Kart nie pokazujemy — mówić możemy o wszystkim.</p>
                ${linie(4)}
              </div>
              ${polaKart}
            </div>
          </div>
          <p class="male" style="margin-top:2mm;margin-bottom:0">Planszę można wydrukować na A3 albo na dwóch arkuszach A4 i skleić wzdłuż linii środkowej.</p>`,
          true,
        ),
        baza,
      );
    },
  };
}

/* --------------------------------------------------------------- 02. role */

const kartyRol: Arkusz = {
  plik: '02_karty_rol',
  tytul: 'Karty ról',
  opis: '5 kart ról × 4 komplety (A6, po 4 na stronie A4).',
  zbuduj(t, baza) {
    const karty: string[] = [];
    for (const stolik of ID_STOLIKOW)
      for (const r of t.role)
        karty.push(
          karta({
            naglowek: r.nazwa,
            etykieta: r.id,
            wariant: 'zielen',
            tresc: `<p class="male"><strong>${bezpieczny(t.instytucje[r.instytucja] ?? '')}</strong></p>
              <p><strong>Twoja motywacja.</strong> ${bezpieczny(r.motywacja)}</p>
              <p><strong>Słowo-klucz: „${bezpieczny(r.slowo_klucz)}”.</strong> ${bezpieczny(r.slowo_klucz_opis)}</p>
              ${r.druga_rola ? `<p><strong>Druga rola.</strong> ${bezpieczny(r.druga_rola)}</p>` : ''}`,
            stopka: `Stolik ${stolik} · nie grasz własnego zawodu`,
          }),
        );
    return dokument(
      'Karty ról',
      arkuszKart(karty, 4, naglowekArkusza('Karty ról — 4 komplety', PODPIS)),
      baza,
    );
  },
};

/* -------------------------------------------------------------- 03. misje */

const kartyMisji: Arkusz = {
  plik: '03_karty_misji',
  tytul: 'Karty misji',
  opis: '4 karty misji (A5).',
  zbuduj(t, baza) {
    const karty = t.stoliki.map((s) =>
      karta({
        naglowek: `Stolik ${s.id} — ${s.nazwa}`,
        etykieta: 'Misja',
        wariant: 'zielen',
        tresc: `<p style="font-size:12pt">${bezpieczny(s.misja)}</p>
          <p class="male">Macie wspólny cel, pięć instytucji, ograniczony czas i kilka niespodzianek po drodze.</p>
          <div style="text-align:center;margin-top:4mm">${doodle(KOT, 34)}</div>`,
        stopka: 'Liczniki pokazują koszt decyzji, nie ich ocenę.',
      }),
    );
    return dokument('Karty misji', arkuszKart(karty, 2, naglowekArkusza('Karty misji', PODPIS)), baza);
  },
};

/* --------------------------------------------------------- 04. informacje */

function kartyInformacji(id: IdStolika): Arkusz {
  return {
    plik: `04_karty_informacji_${id}`,
    tytul: `Karty informacji — stolik ${id}`,
    opis: 'Informacje wspólne i unikalne na rundę 1 i rundę 3, z jednolitym rewersem.',
    zbuduj(t, baza) {
      const s = stolikOpis(t, id);
      const czesci: string[] = [];

      for (const [ktora, d, etykietaRundy] of [
        ['r1', s.decyzja_r1, 'runda 1'],
        ['r3', s.decyzja_r3, 'runda 3'],
      ] as const) {
        const wspolne = Array.from({ length: 5 }, () =>
          karta({
            naglowek: `Informacje wspólne — ${etykietaRundy}`,
            etykieta: `Stolik ${id}`,
            wariant: 'blekit',
            tresc: `<p><strong>${bezpieczny(d.pytanie)}</strong></p><ul>${d.informacje_wspolne.map((i) => `<li>${bezpieczny(i)}</li>`).join('')}</ul>`,
            stopka: 'Do odczytania na głos przy stoliku.',
          }),
        );
        const unikalne = ID_ROL.map((rola) =>
          karta({
            naglowek: `Tylko dla roli ${rola}`,
            etykieta: etykietaRundy,
            wariant: 'bez',
            tresc: `<p style="font-size:11.5pt">${bezpieczny(d.informacje_unikalne[rola] ?? '')}</p>`,
            stopka: 'Możesz o tym mówić. Karty nie pokazujesz.',
            kod: `${id}-${ktora.toUpperCase()}-${rola}`,
          }),
        );
        // rewersy: jednolite w obrębie rundy, żeby nie zdradzały znaczenia karty
        const rewersy = ID_ROL.map(
          () => `<div class="rewers"><div>KŁĘBKOWO<br><span style="font-size:11pt">${etykietaRundy}</span><br>${doodle(KOT, 30)}</div></div>`,
        );

        czesci.push(
          arkuszKart(wspolne, 4, naglowekArkusza(`Stolik ${id} — informacje wspólne, ${etykietaRundy}`, PODPIS)),
          arkuszKart(unikalne, 4, naglowekArkusza(`Stolik ${id} — informacje prywatne, ${etykietaRundy}`, PODPIS)),
          arkuszKart(rewersy, 4, naglowekArkusza(`Rewersy — ${etykietaRundy} (druk na odwrocie)`, PODPIS)),
        );
      }

      return dokument(`Karty informacji — stolik ${id}`, czesci.join(''), baza);
    },
  };
}

/* ----------------------------------------------------------- 05. koperty */

const koperty: Arkusz = {
  plik: '05_koperty_przelozonych',
  tytul: 'Koperty od przełożonych',
  opis: '5 wiadomości × 4 komplety oraz etykiety na koperty.',
  zbuduj(t, baza) {
    const wiadomosci: string[] = [];
    const etykiety: string[] = [];
    for (const stolik of ID_STOLIKOW)
      for (const r of t.role) {
        wiadomosci.push(
          karta({
            naglowek: `Wiadomość dla roli ${r.id}`,
            etykieta: `Stolik ${stolik}`,
            wariant: 'brzoskwinia',
            tresc: `<p style="font-size:11.5pt">${bezpieczny(r.wiadomosc_od_przelozonego)}</p>`,
            stopka: 'Czytasz w milczeniu. O treści możesz mówić — karty nie pokazujesz.',
            kod: `${stolik}-${r.id}-KOPERTA`,
          }),
        );
        etykiety.push(
          karta({
            naglowek: 'Otworzyć w rundzie 2',
            etykieta: `${stolik} · ${r.id}`,
            wariant: 'bez',
            tresc: `<p class="cytat" style="text-align:center">${bezpieczny(r.nazwa)}</p><div style="text-align:center">${doodle(KOT, 26)}</div>`,
          }),
        );
      }
    return dokument(
      'Koperty od przełożonych',
      arkuszKart(wiadomosci, 4, naglowekArkusza('Wiadomości od przełożonych', PODPIS)) +
        arkuszKart(etykiety, 8, naglowekArkusza('Etykiety na koperty', PODPIS)),
      baza,
    );
  },
};

/* ---------------------------------------------------------- 06. zdarzenia */

const kartyZdarzen: Arkusz = {
  plik: '06_karty_zdarzen',
  tytul: 'Karty zdarzeń',
  opis: 'Zdarzenia E1–E12 z opcjami reakcji oraz karty zwrotów akcji A–D.',
  zbuduj(t, baza) {
    const karty = t.zdarzenia.map((z) =>
      karta({
        naglowek: z.tytul,
        etykieta: z.id,
        wariant: 'blekit',
        tresc:
          `<p>${bezpieczny(z.tekst)}</p>` +
          (z.wybor
            ? `<p class="male"><strong>Zespół wybiera reakcję:</strong></p><ol class="male">${z.wybor.map((w) => `<li>${bezpieczny(w.etykieta)}</li>`).join('')}</ol>`
            : '') +
          (z.ochrona ? `<p class="male">Możliwa ochrona: działanie ${z.ochrona} wyłożone we wcześniejszej rundzie.</p>` : '') +
          (z.ochrona_warunek ? `<p class="male">Możliwa ochrona: ${bezpieczny(z.ochrona_warunek)}.</p>` : ''),
        stopka: 'Efekt odczytuje prowadząca z tabeli w instrukcji.',
        kod: z.id,
      }),
    );
    const zwroty = t.stoliki.map((s) =>
      karta({
        naglowek: s.zwrot_akcji.tytul,
        etykieta: `Zwrot akcji · stolik ${s.id}`,
        wariant: 'brzoskwinia',
        tresc: `<p style="font-size:11.5pt">${bezpieczny(s.zwrot_akcji.tekst)}</p>`,
        stopka: 'Wydać na początku rundy 3, razem z kartami informacji.',
        kod: `${s.id}-ZWROT`,
      }),
    );
    return dokument(
      'Karty zdarzeń',
      arkuszKart(karty, 4, naglowekArkusza('Karty zdarzeń E1–E12', PODPIS)) +
        arkuszKart(zwroty, 4, naglowekArkusza('Zwroty akcji', PODPIS)),
      baza,
    );
  },
};

/* ------------------------------------------------------------ 07. skutki */

const kartySkutkow: Arkusz = {
  plik: '07_karty_skutkow',
  tytul: 'Karty skutków decyzji',
  opis: 'Karty dla każdej niezgodnej opcji, oznaczone kodem, do wydawania przez prowadzącą.',
  tylkoDlaProwadzacej: true,
  zbuduj(t, baza) {
    const nazwy = nazwyLicznikow(t);
    const karty: string[] = [];
    for (const s of t.stoliki)
      for (const [ktora, d] of [
        ['R1', s.decyzja_r1],
        ['R3', s.decyzja_r3],
      ] as const)
        for (const [opcja, skutek] of Object.entries(d.skutki_opcji))
          karty.push(
            karta({
              naglowek: skutek.tytul,
              etykieta: 'Skutek decyzji',
              wariant: 'bez',
              tresc: `<p>${bezpieczny(skutek.tekst)}</p><p class="male"><strong>Efekt:</strong> ${opiszEfekt(skutek.efekt, nazwy)}</p>
                ${ktora === 'R3' ? '<p class="male">Jeśli zespół ma znacznik A5 (plan awaryjny): każdy ujemny składnik łagodniejszy o 1.</p>' : ''}`,
              stopka: `Wydać w ${ktora === 'R1' ? 'rundzie 2' : 'finale'}`,
              kod: `${s.id}-${ktora}-${opcja}`,
            }),
          );
    return dokument(
      'Karty skutków decyzji',
      arkuszKart(karty, 4, naglowekArkusza('Karty skutków — trzyma prowadząca', PODPIS)),
      baza,
    );
  },
};

/* ------------------------------------------------------------- 08. akcje */

const kartyAkcji: Arkusz = {
  plik: '08_karty_akcji',
  tytul: 'Karty akcji',
  opis: 'Talia A1–A9 × 4 komplety; działania duże oznaczone ikoną.',
  zbuduj(t, baza) {
    const nazwy = nazwyLicznikow(t);
    const karty: string[] = [];
    for (const stolik of ID_STOLIKOW)
      for (const a of t.akcje)
        karty.push(
          karta({
            naglowek: a.nazwa,
            etykieta: `${a.id}${a.duza ? ' ✦' : ''}`,
            wariant: a.duza ? 'brzoskwinia' : 'zielen',
            tresc: `<p class="male">${bezpieczny(a.opis)}</p>
              <p><strong>Koszt:</strong> ${opiszEfekt(a.efekt, nazwy)}</p>
              ${a.chroni_przed ? `<p class="male">Chroni przed: ${a.chroni_przed.join(', ')} (od kolejnej rundy). Zostaw znacznik na planszy.</p>` : ''}
              ${a.wymaga ? `<p class="male">Wymaga wcześniejszego ${a.wymaga}.</p>` : ''}`,
            stopka: `Stolik ${stolik}${a.duza ? ' · ✦ działanie duże' : ''}`,
            kod: a.id,
          }),
        );
    return dokument(
      'Karty akcji',
      arkuszKart(karty, 4, naglowekArkusza('Talia działań A1–A9 — 4 komplety', PODPIS)),
      baza,
    );
  },
};

/* ------------------------------------------- 09. druki decyzji i zobowiązań */

const drukiDecyzji: Arkusz = {
  plik: '09_karty_decyzji_i_zobowiazan',
  tytul: 'Druki decyzji i zobowiązań',
  opis: 'Po trzy druki na rundę na stolik.',
  zbuduj(t, baza) {
    const karty: string[] = [];
    for (const s of t.stoliki)
      for (const [ktora, d] of [
        ['R1', s.decyzja_r1],
        ['R3', s.decyzja_r3],
      ] as const)
        for (let egz = 0; egz < 3; egz++)
          karty.push(
            karta({
              naglowek: `Decyzja — ${ktora === 'R1' ? 'runda 1' : 'runda 3'}`,
              etykieta: `Stolik ${s.id}`,
              tresc: `<p><strong>${bezpieczny(d.pytanie)}</strong></p>
                ${Object.entries(d.opcje)
                  .map(
                    ([k, v]) =>
                      `<p>☐ <strong>${k}</strong> — ${bezpieczny(v)}</p>`,
                  )
                  .join('')}`,
              stopka: 'Oddajcie tę kartę prowadzącej.',
              kod: `${s.id}-${ktora}`,
            }),
          );

    const zobowiazania: string[] = [];
    for (const s of t.stoliki)
      for (const runda of ['runda 1', 'runda 2', 'runda 3'])
        zobowiazania.push(
          karta({
            naglowek: `Zobowiązania — ${runda}`,
            etykieta: `Stolik ${s.id}`,
            wariant: 'bez',
            tresc: `<p class="male">${bezpieczny(t.zobowiazania.pola.join(' · '))}</p>${linie(4)}
              <p class="male">${bezpieczny(t.zobowiazania.zasada)}</p>`,
            stopka: `Do ${t.zobowiazania.limit_na_runde} zobowiązań na rundę.`,
          }),
        );

    return dokument(
      'Druki decyzji i zobowiązań',
      arkuszKart(karty, 4, naglowekArkusza('Druki decyzji', PODPIS)) +
        arkuszKart(zobowiazania, 4, naglowekArkusza('Druki zobowiązań', PODPIS)),
      baza,
    );
  },
};

/* ------------------------------------------------- 10. arkusz prowadzącej */

const arkuszProwadzacej: Arkusz = {
  plik: '10_arkusz_prowadzacej',
  tytul: 'Arkusz śledzenia — tylko dla prowadzącej',
  opis: 'Ukryte ryzyko, liczba spotkań i wydane skutki dla stolików A–D.',
  tylkoDlaProwadzacej: true,
  zbuduj(t, baza) {
    const tabela = (id: IdStolika) => {
      const s = stolikOpis(t, id);
      return `<div class="nie-lam" style="margin-bottom:6mm">
        <h3>Stolik ${id} — ${bezpieczny(s.nazwa)}</h3>
        <table>
          <thead><tr><th style="width:26mm">Runda</th><th>Decyzja zespołu</th><th style="width:34mm">Zgodna z pełną wiedzą</th><th style="width:26mm">Ukryte ryzyko</th><th style="width:26mm">Spotkania (A1)</th><th style="width:30mm">Wydany skutek</th></tr></thead>
          <tbody>
            <tr><td>Runda 1</td><td></td><td><strong>${s.decyzja_r1.opcja_zgodna_z_pelna_wiedza}</strong></td><td></td><td></td><td></td></tr>
            <tr><td>Runda 2</td><td>—</td><td>—</td><td></td><td></td><td></td></tr>
            <tr><td>Runda 3</td><td></td><td><strong>${s.decyzja_r3.opcja_zgodna_z_pelna_wiedza}</strong></td><td></td><td></td><td></td></tr>
            <tr><td>Finał</td><td>—</td><td>—</td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>`;
    };
    return dokument(
      'Arkusz prowadzącej',
      strona(`${naglowekArkusza('Arkusz śledzenia — tylko dla prowadzącej', PODPIS)}
        <div class="ramka ramka--uwaga">
          <p>Decyzja niezgodna z pełną wiedzą: <strong>ukryte ryzyko +2</strong> oraz karta skutku w kolejnej fazie (dla decyzji z rundy 1 — w rundzie 2; dla decyzji z rundy 3 — w finale). Decyzja zgodna: bez efektu i bez karty.</p>
          <p>Liczba spotkań (A1) <strong>nie wpływa</strong> na ukryte ryzyko. Zapisujesz ją wyłącznie na potrzeby omówienia w dniu 2.</p>
          <p>Przemilczenie sprawy w zdarzeniu E8 również podnosi ukryte ryzyko o 1.</p>
        </div>
        ${ID_STOLIKOW.map(tabela).join('')}
        <p class="male">Tej kartki nie zostawiamy na stolikach.</p>`),
      baza,
    );
  },
};

/* ------------------------------------------------------ 11. szablon Kroniki */

const szablonKroniki: Arkusz = {
  plik: '11_kronika_szablon',
  tytul: 'Kronika — szablon',
  opis: 'Wydanie specjalne „Kuriera Kłębkowskiego” do wypełnienia.',
  zbuduj(t, baza) {
    const reguly = `<table>
      <thead><tr><th style="width:46mm">Warunek</th><th>Nagłówek</th></tr></thead>
      <tbody>${t.kronika.reguly_naglowka.map((r) => `<tr><td><code>${bezpieczny(r.warunek)}</code></td><td>${bezpieczny(r.tekst)}</td></tr>`).join('')}</tbody>
    </table>`;
    const strony = ID_STOLIKOW.map((id) =>
      strona(`${naglowekArkusza(t.kronika.tytul, `Stolik ${id} — ${stolikOpis(t, id).nazwa}`)}
        <div class="ramka" style="min-height:40mm">
          <h4>Nagłówek (pierwsza pasująca reguła od góry)</h4>
          ${linie(2)}
        </div>
        <div class="ramka" style="min-height:44mm">
          <h4>Zdania dodatkowe (wszystkie pasujące)</h4>
          ${linie(4)}
        </div>
        <div class="kolumny">
          <div class="ramka">
            <h4>Liczniki na koniec</h4>
            ${t.liczniki.jawne.map((l) => `<p>${bezpieczny(l.nazwa)}: __________</p>`).join('')}
          </div>
          <div class="ramka ramka--cicha">
            <h4>Reguły nagłówka</h4>
            <p class="male">${t.kronika.reguly_naglowka.map((r) => `${bezpieczny(r.warunek)}`).join(' → ')}</p>
            <h4>Zdania dodatkowe</h4>
            <p class="male">${t.kronika.zdania_dodatkowe.map((r) => bezpieczny(r.warunek)).join(' · ')}</p>
          </div>
        </div>
        <p class="cytat">${bezpieczny(t.kronika.podpis)}</p>
        <div style="text-align:center">${doodle(KOT, 34)}</div>`),
    ).join('');
    return dokument(
      'Kronika — szablon',
      strony +
        strona(`${naglowekArkusza('Tabela reguł nagłówków', PODPIS)}${reguly}
          <h3>Zdania dodatkowe</h3>
          <table><tbody>${t.kronika.zdania_dodatkowe.map((r) => `<tr><td style="width:46mm"><code>${bezpieczny(r.warunek)}</code></td><td>${bezpieczny(r.tekst)}</td></tr>`).join('')}</tbody></table>
          <p class="male">Warunek <code>ryzyko &gt;= 4</code> sprawdza prowadząca ze swojego arkusza. Liczby ukrytego ryzyka nie podajemy.</p>`),
      baza,
    );
  },
};

/* ------------------------------------------------------------- 12. żetony */

const zetony: Arkusz = {
  plik: '12_zetony',
  tytul: 'Żetony i znaczniki',
  opis: 'Pionki liczników, znaczniki ochrony A2–A5 i znacznik wyczerpania.',
  zbuduj(t, baza) {
    const zeton = (tekst: string, opis: string, wariant: string) =>
      `<div class="karta-ciecia" style="padding:3mm">
        <div class="karta karta--${wariant}" style="border-radius:50%;text-align:center;justify-content:center;padding:3mm">
          <div style="font-family:'Patrick Hand',cursive;font-size:11pt">${bezpieczny(tekst)}</div>
          <div class="male">${bezpieczny(opis)}</div>
        </div>
      </div>`;

    const pionki = ID_STOLIKOW.flatMap((id) =>
      t.liczniki.jawne.map((l) => zeton(`${id} · ${l.nazwa}`, 'pionek toru', 'blekit')),
    );
    const ochrony = ID_STOLIKOW.flatMap((id) =>
      t.akcje
        .filter((a) => a.chroni_przed?.length || a.lagodzi_zwrot_akcji)
        .map((a) => zeton(`${id} · ${a.id}`, (a.chroni_przed ?? ['zwrot akcji']).join(', '), 'zielen')),
    );
    const wyczerpanie = ID_STOLIKOW.map((id) => zeton(`${id} · wyczerpanie`, `obciążenie ≥ ${t.liczniki.wyczerpanie.prog_obciazenia}`, 'brzoskwinia'));

    const naStronie = (elementy: string[], tytul: string) => {
      const strony: string[] = [];
      for (let i = 0; i < elementy.length; i += 12) {
        const grupa = elementy.slice(i, i + 12);
        strony.push(
          strona(
            `${i === 0 ? naglowekArkusza(tytul, PODPIS) : ''}
             <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:42mm">${grupa.join('')}</div>`,
          ),
        );
      }
      return strony.join('');
    };

    return dokument(
      'Żetony i znaczniki',
      naStronie(pionki, 'Pionki liczników') +
        naStronie(ochrony, 'Znaczniki ochrony') +
        naStronie(wyczerpanie, 'Znaczniki wyczerpania') +
        strona(`<div class="ramka"><h3>Jak używać</h3>
          <ul>
            <li>Pionek toru kładziecie na polu z wartością startową i przesuwacie po każdej zmianie.</li>
            <li>Znacznik ochrony wykładacie w rundzie, w której wybraliście działanie. Chroni od <strong>kolejnej</strong> rundy.</li>
            <li>Znacznik wyczerpania kładziecie, gdy obciążenie osiągnie ${t.liczniki.wyczerpanie.prog_obciazenia}. ${bezpieczny(t.liczniki.wyczerpanie.skutek)}</li>
          </ul>
          <div style="text-align:center">${doodle(NOZYCZKI, 34)}</div>
        </div>`),
      baza,
    );
  },
};

const zasadyUczestnikow: Arkusz = {
  ...arkuszDlaUczestnikow,
  zbuduj: (t, baza) =>
    arkuszDlaUczestnikow.zbuduj(t, baza).replace(
      '</body>',
      arkuszKart(kartySciagawki(t), 4, naglowekArkusza('Ściągawki na stolik — do wycięcia', PODPIS)) + '</body>',
    ),
};

export const ARKUSZE: Arkusz[] = [
  instrukcja,
  ...ID_STOLIKOW.map(plansza),
  kartyRol,
  kartyMisji,
  ...ID_STOLIKOW.map(kartyInformacji),
  koperty,
  kartyZdarzen,
  kartySkutkow,
  kartyAkcji,
  drukiDecyzji,
  arkuszProwadzacej,
  szablonKroniki,
  zetony,
  zasadyUczestnikow,
];

export function znajdzArkusz(plik: string): Arkusz | undefined {
  return ARKUSZE.find((a) => a.plik === plik);
}
