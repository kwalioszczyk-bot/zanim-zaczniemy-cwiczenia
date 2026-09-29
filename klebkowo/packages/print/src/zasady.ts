/**
 * Dwa dokumenty z zasadami, składane z tego samego `content/gra.json`:
 *
 *  • „Pełne zasady gry” — strony dołączane do instrukcji prowadzącej. Zawierają WSZYSTKO,
 *    łącznie z mechanizmem ukrytym, kluczem decyzji i licznikami, których stoliki nie widzą.
 *  • „Scenariusz i zasady dla uczestników” — osobny arkusz do rozdania przy stolikach.
 *    Nie ma w nim ani słowa o ukrytym ryzyku, o liczbie spotkań ani o tym, że którakolwiek
 *    opcja decyzji jest „zgodna z pełną wiedzą”. To warunek, żeby gra zadziałała.
 *
 * TODO: do akceptacji prowadzącej — teksty spajające (nagłówki sekcji, opisy kroków,
 * zdania typu „Jak przebiega runda”) są napisane na potrzeby tych dokumentów.
 * Wszystkie treści fabularne, zasady i opisy liczników pochodzą dosłownie z content/gra.json.
 */
import type { Tresc } from '@klebkowo/engine';
import { bezpieczny, dokument, doodle, karta, naglowekArkusza, opiszEfekt, strona, KOT } from './elementy.ts';

const PODPIS = 'KŁĘBKOWO. Sprawa się plącze';

const nazwy = (t: Tresc): Record<string, string> =>
  Object.fromEntries([...t.liczniki.jawne, ...t.liczniki.ukryte].map((l) => [l.id, l.nazwa]));

const licznik = (t: Tresc, id: string) => t.liczniki.jawne.find((l) => l.id === id);

/* ==================================================== pełne zasady — prowadząca */

export function stronyPelnychZasad(t: Tresc): string {
  const n = nazwy(t);
  const progWyczerpania = t.liczniki.wyczerpanie.prog_obciazenia;
  const progZobowiazan = t.zobowiazania.prog_obciazenia;
  const duze = t.akcje.filter((a) => a.duza).map((a) => a.id);
  const ochronne = t.akcje.filter((a) => a.chroni_przed?.length);
  const a5 = t.akcje.find((a) => a.lagodzi_zwrot_akcji);
  const a9 = t.akcje.find((a) => a.wymaga);
  const a1 = t.akcje.find((a) => a.ukryty_efekt);

  const tabelaLicznikow = `<table>
    <thead><tr><th>Licznik</th><th style="width:18mm">Start</th><th style="width:18mm">Zakres</th><th>Co oznacza</th></tr></thead>
    <tbody>
      ${t.liczniki.jawne
        .map(
          (l) =>
            `<tr><td><strong>${bezpieczny(l.nazwa)}</strong></td><td>${l.start}</td><td>${l.min}–${l.max}</td><td>${bezpieczny(l.opis)}</td></tr>`,
        )
        .join('')}
      ${t.liczniki.ukryte
        .map(
          (l) =>
            `<tr><td><strong>${bezpieczny(l.nazwa)}</strong> <span class="etykieta etykieta--brzoskwinia">ukryty</span></td><td>${l.start}</td><td>${l.min}–${l.max}</td><td>${bezpieczny(l.opis)}</td></tr>`,
        )
        .join('')}
    </tbody>
  </table>`;

  return (
    strona(`${naglowekArkusza('Pełne zasady gry — dla prowadzącej', PODPIS)}
      <div class="ramka ramka--uwaga">
        <p>Ta część zawiera mechanizm ukryty. Nie zostawiaj jej na stolikach i nie streszczaj jej w dniu 1.
        Uczestnicy dostają osobny arkusz „Scenariusz i zasady” — bez tych informacji.</p>
      </div>

      <h2>1. Liczniki</h2>
      <p>Każdy stolik prowadzi własne liczniki. Wartości <strong>zawsze przycinamy do zakresu</strong>:
      jeśli efekt zabrałby więcej, niż stolik ma, licznik zatrzymuje się na wartości brzegowej.
      Liczniki nie są punktacją — pokazują koszt decyzji, nie ich ocenę. Stoliki nigdy ich ze sobą nie porównują.</p>
      ${tabelaLicznikow}
      <p class="male">Liczniki ukryte prowadzisz wyłącznie Ty, na arkuszu śledzenia (plik 10).
      Nie padają w grze ani jednym słowem aż do dnia 2.</p>

      <h2>2. Wyczerpanie zespołu</h2>
      <p>Sprawdzasz je <strong>na początku wyboru akcji</strong>, po rozstrzygnięciu zdarzeń.
      Gdy ${bezpieczny(licznik(t, 'obciazenie')?.nazwa ?? 'Obciążenie')} wynosi <strong>${progWyczerpania} lub więcej</strong>:</p>
      <ul>
        <li>${bezpieczny(t.liczniki.wyczerpanie.skutek)}</li>
        <li>Działania duże (${duze.join(', ')}) są w tej rundzie niedostępne.</li>
      </ul>
      <div class="ramka ramka--cicha">
        <p><strong>Do odczytania zespołowi:</strong> „${bezpieczny(t.liczniki.wyczerpanie.komunikat)}”</p>
      </div>
      <p><strong>Zespół nigdy nie odpada z gry.</strong> Wyczerpanie zawęża pole działania — i tyle.
      Wyjściem jest ${bezpieczny(t.akcje.find((a) => (a.efekt.obciazenie ?? 0) < 0 && !a.wymaga)?.nazwa ?? 'przerwa')}.</p>

      <h2>3. Akcje</h2>
      <ul>
        <li>Do <strong>${t.limit_akcji_na_runde} działań na rundę</strong>, każde <strong>najwyżej raz w rundzie</strong>.
        To samo działanie można powtórzyć w kolejnej rundzie.</li>
        <li>Przy wyczerpaniu: jedno działanie i żadnego dużego.</li>
        <li>Działania rozliczamy w kolejności z talii (A1, A2, A3…), nie w kolejności wskazywania przez zespół.</li>
      </ul>
      <h3>Ochrony (${ochronne.map((a) => a.id).join(', ')})</h3>
      <p>Te działania zostawiają na planszy <strong>znacznik ochrony</strong>. Ochrona:</p>
      <ul>
        <li>działa <strong>od rundy następnej</strong> po tej, w której wyłożono znacznik — zdarzenia rozstrzygamy przed akcjami,
        więc w tej samej rundzie ochrona jeszcze nie zdąży zadziałać;</li>
        <li><strong>w rundzie 1 ochrona nie jest możliwa</strong> — to zamierzone, nie pomyłka;</li>
        <li>jest <strong>trwała</strong>: raz wyłożony znacznik działa do końca gry.</li>
      </ul>
      <table>
        <thead><tr><th style="width:44mm">Działanie</th><th>Chroni przed</th></tr></thead>
        <tbody>${ochronne.map((a) => `<tr><td><strong>${a.id}</strong> ${bezpieczny(a.nazwa)}</td><td>${(a.chroni_przed ?? []).join(', ')}</td></tr>`).join('')}</tbody>
      </table>
      ${a5 ? `<h3>${a5.id} — dodatkowo łagodzi zwrot akcji</h3>
      <p>Jeśli zespół ma znacznik ${a5.id}, skutek niezgodnej decyzji z rundy 3 jest łagodniejszy
      o <strong>${a5.lagodzi_zwrot_akcji}</strong> w każdym składniku ujemnym (np. ${bezpieczny(n.czas ?? 'Czas')} −3 zmienia się w −2).
      Łagodzenie <strong>nie sumuje się</strong>, nawet jeśli zespół wyłoży ${a5.id} dwa razy. Nie dotyczy skutku decyzji z rundy 1.</p>` : ''}
      ${a9 ? `<h3>${a9.id} — wymaga ${a9.wymaga}</h3>
      <p>Bez wcześniejszego ${a9.wymaga} stosujesz efekt zastępczy: <strong>${opiszEfekt(a9.efekt_bez_wymogu ?? {}, n)}</strong>
      i czytasz: „${bezpieczny(a9.komunikat_bez_wymogu ?? '')}”.
      ${a9.wymaga} wyłożone <strong>w tej samej rundzie też wystarczy</strong> — rozliczamy je wcześniej, bo ma niższy numer w talii.</p>` : ''}
      ${a1 ? `<div class="ramka ramka--uwaga">
        <p><strong>${a1.id} — ${bezpieczny(a1.nazwa)}.</strong> Zapisujesz je na arkuszu śledzenia jako spotkanie zespołu.
        ${bezpieczny(a1.uwaga_dla_omowienia ?? '')} Karta ${a1.id} niczego o tym nie sugeruje i Ty też nie —
        to materiał na dzień 2.</p>
      </div>` : ''}
    `) +
    strona(`<h2>4. Zdarzenia</h2>
      <p>Zdarzenia rozstrzygamy <strong>przed</strong> wyborem akcji — zespół reaguje na sytuację, która już zaszła.
      Kolejność zdarzeń dla stolików i rund znajdziesz w tabeli „Kolejność zdarzeń”. Są cztery rodzaje:</p>
      <ol>
        <li><strong>Zwykłe</strong> — odczytujesz kartę i stosujesz efekt.</li>
        <li><strong>Z ochroną</strong> — jeśli zespół ma odpowiedni znacznik z wcześniejszej rundy, efekt nie zachodzi.
        Zamiast tego czytasz komentarz z karty. To jedyny moment, w którym zespół widzi, że jego wcześniejsze
        działanie się opłaciło.</li>
        <li><strong>Z wyborem reakcji</strong> — zespół wybiera jedną z opcji, Ty stosujesz jej efekt.
        ${t.zdarzenia.filter((z) => z.wybor).map((z) => z.id).join(' i ')} działają w ten sposób.</li>
        <li><strong>Warunkowe</strong> — o efekcie decyduje wartość licznika.</li>
      </ol>
      ${t.zdarzenia
        .filter((z) => z.warunek)
        .map(
          (z) => `<div class="ramka">
            <h4>${z.id} — ${bezpieczny(z.tytul)}</h4>
            <p>Jeśli ${bezpieczny(n[z.warunek!.licznik] ?? z.warunek!.licznik)} jest <strong>niższe niż ${z.warunek!.prog}</strong>:
            ${opiszEfekt(z.warunek!.efekt_gdy_ponizej, n)}.<br>
            Jeśli wynosi <strong>${z.warunek!.prog} lub więcej</strong>: ${opiszEfekt(z.warunek!.efekt_gdy_rowny_lub_powyzej, n)}
            ${z.warunek!.komentarz_gdy_powyzej ? ` — czytasz: „${bezpieczny(z.warunek!.komentarz_gdy_powyzej)}”` : ''}.</p>
          </div>`,
        )
        .join('')}
      ${t.zdarzenia
        .filter((z) => z.ochrona_warunek)
        .map(
          (z) => `<div class="ramka">
            <h4>${z.id} — ${bezpieczny(z.tytul)}</h4>
            <p>Ochrona nie pochodzi tu z działania, tylko z zobowiązań: zdarzenie nie zachodzi, jeśli
            <strong>${bezpieczny(z.ochrona_warunek ?? '')}</strong>. Wtedy czytasz: „${bezpieczny(z.komentarz_z_ochrona ?? '')}”.</p>
          </div>`,
        )
        .join('')}
      ${t.zdarzenia
        .filter((z) => z.id === 'E2')
        .map(
          (z) => `<div class="ramka ramka--uwaga">
            <h4>${z.id} — ${bezpieczny(z.tytul)}</h4>
            <p>Poza efektem zdarzenie <strong>blokuje zobowiązania roli R1 w tej rundzie</strong>.
            Jeśli zadziałała ochrona ${z.ochrona ?? ''}, blokady nie ma.</p>
          </div>`,
        )
        .join('')}

      <h2>5. Zobowiązania</h2>
      <ul>
        <li>Do <strong>${t.zobowiazania.limit_na_runde} zobowiązań na rundę</strong>. Pola: ${bezpieczny(t.zobowiazania.pola.join(' · '))}.</li>
        <li>Sprawdzasz je <strong>na początku kolejnej rundy</strong>, przed zdarzeniami.</li>
        <li>${bezpieczny(t.zobowiazania.zasada)}</li>
      </ul>
      <div class="ramka ramka--cicha">
        <p><strong>Skrót:</strong> ${bezpieczny(licznik(t, 'obciazenie')?.nazwa ?? 'Obciążenie')} poniżej ${progZobowiazan} → zobowiązanie zrealizowane,
        ${bezpieczny(n.zaufanie ?? 'Zaufanie')} +1. Od ${progZobowiazan} w górę → kostka: 1–3 niezrealizowane (${bezpieczny(n.zaufanie ?? 'Zaufanie')} −1),
        4–6 zrealizowane (${bezpieczny(n.zaufanie ?? 'Zaufanie')} +1). Liczy się obciążenie <em>w chwili sprawdzenia</em>, nie w chwili podejmowania zobowiązania.</p>
      </div>
      <p>Zobowiązania z ostatniej rundy nie są już sprawdzane — gra kończy się wcześniej.
      Zobowiązanie wskazujące rolę R3 może ochronić zespół przed jednym ze zdarzeń (patrz wyżej).</p>

      <h2>6. Decyzje — serce gry</h2>
      <p>${bezpieczny(t.decyzje_zasady.opis)}</p>
      <ul>
        <li><strong>Informacje wspólne</strong> dostają wszyscy przy stoliku — jedna osoba czyta je na głos.</li>
        <li><strong>Informacje unikalne</strong> dostaje każda rola osobno. Zasada dla zespołu brzmi:
        „Możecie mówić o wszystkim, co wiecie. Kart nie pokazujecie.”</li>
        <li>Informacje wspólne sugerują <strong>inną</strong> opcję niż ta, którą wskazuje pełna wiedza zespołu.
        Dopiero złożenie informacji unikalnych daje pełny obraz.</li>
      </ul>
      <table>
        <thead><tr><th style="width:38mm">Zespół wybrał</th><th>Co robisz</th></tr></thead>
        <tbody>
          <tr><td><strong>opcję zgodną z pełną wiedzą</strong></td>
              <td>Brak jawnego efektu. Mówisz: „${bezpieczny(t.decyzje_zasady.gdy_zgodna.komunikat)}” Nic nie zapisujesz poza samą decyzją.</td></tr>
          <tr><td><strong>opcję niezgodną</strong></td>
              <td>Brak jawnego efektu. Mówisz <strong>dokładnie to samo</strong>: „${bezpieczny(t.decyzje_zasady.gdy_niezgodna.komunikat)}”
              Na arkuszu dopisujesz ${bezpieczny(n.ryzyko ?? 'ukryte ryzyko')} ${opiszEfekt(t.decyzje_zasady.gdy_niezgodna.ukryty_efekt, n)}
              i odkładasz kartę skutku. ${bezpieczny(t.decyzje_zasady.gdy_niezgodna.skutek)}</td></tr>
        </tbody>
      </table>
      <div class="ramka ramka--uwaga">
        <p><strong>To tu gra może się zepsuć.</strong> ${bezpieczny(t.decyzje_zasady.uwaga)}
        Mów to samo zdanie, tym samym tonem i poświęć tyle samo czasu obu stolikom.
        Zawahanie, uniesiona brew albo dłuższa pauza zdradzają mechanizm, który ma zostać ujawniony dopiero w dniu 2.</p>
      </div>
      <p><strong>Kiedy wydajesz kartę skutku:</strong> za decyzję z rundy 1 — w rundzie 2, razem z pozostałymi wiadomościami.
      Za decyzję z rundy 3 — w finale. Wydajesz ją jak zwykłą kartę zdarzenia, bez komentarza.</p>
    `) +
    strona(`<h2>7. Przebieg rundy — kolejność ma znaczenie</h2>
      <table>
        <thead><tr><th style="width:26mm">Kolejność</th><th>Krok</th><th>Dlaczego tak</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Sprawdzenie zobowiązań z poprzedniej rundy</td><td>Decyduje obciążenie z tego momentu, jeszcze przed zdarzeniami.</td></tr>
          <tr><td>2</td><td>Karty skutków i koperty (gdy przewiduje je faza)</td><td>Zespół wchodzi w rundę z pełnym obrazem sytuacji.</td></tr>
          <tr><td>3</td><td>Zdarzenia rundy</td><td>Zespół reaguje na to, co już się stało. Tu działają ochrony z rund wcześniejszych.</td></tr>
          <tr><td>4</td><td>Karty informacji i decyzja (rundy 1 i 3)</td><td>Najpierw wspólne, potem prywatne. Rozmowa jest częścią gry.</td></tr>
          <tr><td>5</td><td>Wybór akcji</td><td>Tu sprawdzasz wyczerpanie. Znaczniki ochrony wyłożone teraz zadziałają dopiero w kolejnej rundzie.</td></tr>
          <tr><td>6</td><td>Zobowiązania na kolejną rundę</td><td>Zespół planuje, wiedząc już, ile go kosztowała ta runda.</td></tr>
          <tr><td>7</td><td>Zatwierdzenie rundy</td><td>Pionki na torach, karty na planszy, przerwa na pozostałe stoliki.</td></tr>
        </tbody>
      </table>

      <h2>8. Finał i Kronika</h2>
      <ol>
        <li>Wydajesz karty skutków za decyzje z rundy 3.</li>
        <li>Dla każdego stolika składasz „${bezpieczny(t.kronika.tytul)}”: <strong>nagłówek</strong> to pierwsza pasująca reguła od góry
        (kolejność ma znaczenie), a <strong>zdania dodatkowe</strong> dopisujesz wszystkie, które pasują.</li>
        <li>Zespoły odczytują swoje wydanie na głos i przeglądają przebieg liczników.</li>
      </ol>
      <div class="ramka ramka--uwaga">
        <p>Jedna z reguł zdań dodatkowych sprawdza <strong>${bezpieczny(n.ryzyko ?? 'ukryte ryzyko')}</strong> — to jedyne miejsce w całej grze,
        w którym ukryty licznik wychodzi na wierzch, i to bez podawania liczby. Sprawdzasz ją ze swojego arkusza.</p>
      </div>
      <p class="cytat">${bezpieczny(t.kronika.podpis)}</p>

      <h2>9. Czego pilnujesz przez całą grę</h2>
      <ul>
        <li><strong>Żadnych porównań.</strong> Nie zestawiasz stolików, nie sumujesz liczników, nie mówisz „najlepszy”, „najszybszy”, „udało się”.
        Stoliki wymieniasz zawsze w kolejności A, B, C, D.</li>
        <li><strong>Liczniki to koszt, nie ocena.</strong> Żadnych „brawo”, „błąd”, „porażka” przy zmianie licznika.</li>
        <li><strong>Wyczerpany zespół gra dalej.</strong> Nikt nie odpada.</li>
        <li><strong>Mechanizm zostaje ukryty.</strong> Do końca dnia 1 nie pada ani słowo o ukrytym ryzyku, o liczbie spotkań,
        ani o tym, że którakolwiek opcja była „właściwa”.</li>
        <li><strong>Nikt nie gra własnego zawodu.</strong> Jeśli ktoś dostał rolę ze swojej branży — zamieniacie karty.</li>
        <li><strong>Fikcja zostaje fikcją.</strong> Nie przywołujecie realnych osób ani spraw. Każda osoba może zakończyć udział
        w dowolnym momencie bez podawania przyczyny.</li>
        <li><strong>Humor nigdy kosztem mieszkańców placówki</strong> ani żadnej innej grupy.</li>
      </ul>
      <div style="text-align:center;margin-top:6mm">${doodle(KOT, 36)}</div>
    `)
  );
}

/* ============================================ scenariusz i zasady — uczestnicy */

/**
 * Arkusz dla stolików. Świadomie NIE ma tu:
 * ukrytego ryzyka, liczby spotkań, informacji, że decyzja może być „zgodna z pełną wiedzą”,
 * ani zapowiedzi kart skutków. Bez tego gra przestałaby działać.
 */
export const arkuszDlaUczestnikow = {
  plik: '13_scenariusz_i_zasady_dla_uczestnikow',
  tytul: 'Scenariusz i zasady dla uczestników',
  opis: 'Dwie strony A4 do rozdania przy stolikach: fabuła, zasady, przebieg rundy, ściągawka.',
  zbuduj(t: Tresc, baza: string): string {
    const n = nazwy(t);
    const progWyczerpania = t.liczniki.wyczerpanie.prog_obciazenia;

    const tabelaLicznikow = `<table>
      <thead><tr><th style="width:40mm">Licznik</th><th style="width:16mm">Start</th><th>Co pokazuje</th></tr></thead>
      <tbody>${t.liczniki.jawne
        .map((l) => `<tr><td><strong>${bezpieczny(l.nazwa)}</strong></td><td>${l.start}</td><td>${bezpieczny(l.opis)}</td></tr>`)
        .join('')}</tbody>
    </table>`;

    const tabelaAkcji = `<table>
      <thead><tr><th style="width:44mm">Działanie</th><th>Na czym polega</th><th style="width:38mm">Koszt</th></tr></thead>
      <tbody>${t.akcje
        .map(
          (a) =>
            `<tr><td><strong>${a.id}</strong> ${bezpieczny(a.nazwa)}${a.duza ? ' ✦' : ''}</td>` +
            `<td>${bezpieczny(a.opis)}${a.wymaga ? ` <em>Wymaga wcześniejszego ${a.wymaga}.</em>` : ''}</td>` +
            `<td>${opiszEfekt(a.efekt, n)}</td></tr>`,
        )
        .join('')}</tbody>
    </table>
    <p class="male">✦ — działanie duże. Wymaga sił, których przeciążony zespół nie ma.</p>`;

    return dokument(
      'Scenariusz i zasady dla uczestników',
      strona(`${naglowekArkusza('Kłębkowo — scenariusz i zasady', PODPIS)}
        <div class="ramka karta--zielen">
          <h3>Gdzie jesteśmy</h3>
          <p>${bezpieczny(t.wstep_do_odczytania)}</p>
        </div>

        <h2>Kto jest przy stole</h2>
        <div class="kolumny">
          <ul class="male">
            ${t.role
              .map((r) => `<li><strong>${r.id}</strong> — ${bezpieczny(r.nazwa)}</li>`)
              .join('')}
          </ul>
          <ul class="male">
            ${Object.values(t.instytucje)
              .map((i) => `<li>${bezpieczny(i)}</li>`)
              .join('')}
          </ul>
        </div>
        <p class="male">Każda osoba dostaje kartę roli: instytucję, motywację i <strong>słowo-klucz</strong> —
        termin zawodowy, którego używasz co najmniej raz w rundzie i wyjaśniasz tylko wtedy, gdy ktoś zapyta.</p>

        <div class="ramka ramka--uwaga">
          <h3>Zasady</h3>
          <ul>${t.zasady.map((z) => `<li>${bezpieczny(z)}</li>`).join('')}</ul>
        </div>

        <h2>Wasze liczniki</h2>
        <p>Cztery liczniki, każdy w zakresie 0–10. <strong>Pokazują koszt Waszych decyzji, a nie ich ocenę.</strong>
        Nie ma zwycięzców, nie ma rankingu, nikt nie porównuje stolików.</p>
        ${tabelaLicznikow}
        <div class="ramka ramka--cicha">
          <p><strong>Gdy ${bezpieczny(licznik(t, 'obciazenie')?.nazwa ?? 'Obciążenie')} osiągnie ${progWyczerpania} lub więcej:</strong>
          ${bezpieczny(t.liczniki.wyczerpanie.skutek)}</p>
        </div>
      `) +
      strona(`<h2>Jak przebiega runda</h2>
        <ol>
          <li><strong>Sprawdzacie zobowiązania</strong> podjęte w poprzedniej rundzie.</li>
          <li><strong>Zdarzenie rundy.</strong> Coś się dzieje w dzielnicy. Czasem trzeba wspólnie zdecydować, jak reagujecie.</li>
          <li><strong>Karty informacji.</strong> Najpierw wspólne — jedna osoba czyta je na głos. Potem prywatne: każda osoba
          dostaje swoją. <strong>Możecie mówić o wszystkim, co wiecie. Kart nie pokazujecie.</strong></li>
          <li><strong>Decyzja zespołu.</strong> Wybieracie jedną opcję, zaznaczacie ją na druku i oddajecie prowadzącej.</li>
          <li><strong>Działania.</strong> Do ${t.limit_akcji_na_runde} na rundę, każde najwyżej raz. To samo działanie możecie powtórzyć w kolejnej rundzie.</li>
          <li><strong>Zobowiązania.</strong> Do ${t.zobowiazania.limit_na_runde} na rundę: ${bezpieczny(t.zobowiazania.pola.join(', '))}.</li>
          <li><strong>Zatwierdzacie rundę</strong> i czekacie na pozostałe zespoły.</li>
        </ol>

        <div class="ramka">
          <h3>Zobowiązania — jak się je sprawdza</h3>
          <p>${bezpieczny(t.zobowiazania.zasada)}</p>
        </div>

        <h2>Talia działań</h2>
        ${tabelaAkcji}
        <p class="male">Działania ${t.akcje.filter((a) => a.chroni_przed?.length).map((a) => a.id).join(', ')} zostawiają na planszy
        znacznik ochrony. Znacznik działa <strong>od następnej rundy</strong> — przygotowanie zawsze wyprzedza kłopot.</p>

        <div class="ramka karta--zielen">
          <h3>Co się dzieje na końcu</h3>
          <p>W finale nadchodzi dzień otwarcia, a „${bezpieczny(t.kronika.tytul)}” opisuje, jak poszło Waszemu przedsięwzięciu.
          Potem wychodzicie z ról i wracacie do własnych imion.</p>
          <p class="cytat">${bezpieczny(t.kronika.podpis)}</p>
        </div>

        <div style="text-align:center;margin-top:4mm">${doodle(KOT, 34)}</div>
        <p class="male" style="text-align:center">Powodzenia — i uwaga na kota Kierownika.</p>
      `),
      baza,
    );
  },
};

/* --------------------------------------------- wersja kieszonkowa na stolik */

/** Ściągawka A6 — cztery karty na stronę, po jednej dla każdej osoby przy stoliku. */
export function kartySciagawki(t: Tresc): string[] {
  const n = nazwy(t);
  return Array.from({ length: 4 }, () =>
    karta({
      naglowek: 'Ściągawka rundy',
      etykieta: 'Kłębkowo',
      wariant: 'blekit',
      tresc: `<ol class="male" style="padding-left:4mm">
          <li>Sprawdzenie zobowiązań</li>
          <li>Zdarzenie rundy</li>
          <li>Karty informacji — wspólne, potem prywatne</li>
          <li>Decyzja zespołu</li>
          <li>Działania (do ${t.limit_akcji_na_runde}, każde raz)</li>
          <li>Zobowiązania (do ${t.zobowiazania.limit_na_runde})</li>
          <li>Zatwierdzenie rundy</li>
        </ol>
        <p class="male"><strong>Możecie mówić o wszystkim, co wiecie. Kart nie pokazujecie.</strong></p>
        <p class="male">Liczniki: ${t.liczniki.jawne.map((l) => bezpieczny(l.nazwa)).join(' · ')}</p>`,
      stopka: `${bezpieczny(n.obciazenie ?? 'Obciążenie')} ≥ ${t.liczniki.wyczerpanie.prog_obciazenia} → jedno małe działanie`,
    }),
  );
}
