import type { ReactNode } from "react";

function Uzup({ children }: { children: ReactNode }) {
  return <span className="rounded bg-panel px-1 py-0.5 text-ink/70">{children}</span>;
}

export function TermsPage() {
  return (
    <div className="max-w-none">
      <h1 className="font-heading text-2xl font-semibold">Regulamin aplikacji „Zanim zaczniemy — ćwiczenia"</h1>
      <p className="mt-2 text-sm text-ink/60">
        Obowiązuje od: 2026-09-06 · Wersja 1.0
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-heading text-base font-semibold">§ 1. Postanowienia ogólne</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Niniejszy Regulamin określa zasady korzystania z aplikacji internetowej „Zanim zaczniemy — ćwiczenia", dostępnej pod
              adresem <strong>zanim-zaczniemy-cwiczenia.vercel.app</strong> <Uzup>[DO AKTUALIZACJI po ew. podpięciu własnej domeny]</Uzup>,
              zwanej dalej <strong>Aplikacją</strong>.
            </li>
            <li>
              Regulamin został sporządzony na podstawie art. 8 ust. 1 pkt 1 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą
              elektroniczną.
            </li>
            <li>
              Usługodawcą i właścicielem Aplikacji jest:
              <p className="mt-2">
                <strong>Centrum Psychologii i Psychoedukacji NewWay — Katarzyna Walioszczyk-Urbaniak</strong>
                <br />
                ul. Wyszyńskiego 5, 98-338 Pajęczno
                <br />
                NIP: 7721039332
                <br />
                tel.: 693 169 828
                <br />
                e-mail: <Uzup>[DO UZUPEŁNIENIA]</Uzup>
              </p>
              <p className="mt-2">
                zwana dalej <strong>Usługodawcą</strong>.
              </p>
            </li>
            <li>
              <strong>Użytkownikiem</strong> jest pełnoletnia osoba fizyczna, będąca uczestnikiem lub uczestniczką programu Trening
              Umiejętności Rodzicielskich prowadzonego przez Usługodawcę, której wydano indywidualny Token dostępu.
            </li>
            <li>
              <strong>Token</strong> to indywidualny, jednorazowo wydawany ciąg znaków umożliwiający dostęp do Aplikacji, nieprzypisany w
              systemie do imienia, nazwiska ani innych danych identyfikujących Użytkownika.
            </li>
            <li>
              Regulamin jest udostępniany nieodpłatnie na ekranie startowym Aplikacji, przed uzyskaniem dostępu do jej treści, w sposób
              umożliwiający jego pozyskanie, odtworzenie i utrwalenie.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 2. Charakter Aplikacji</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Aplikacja stanowi <strong>materiał psychoedukacyjny</strong> — narzędzie wspierające pracę własną między spotkaniami w
              ramach programu Trening Umiejętności Rodzicielskich.
            </li>
            <li>
              Aplikacja <strong>nie jest</strong> świadczeniem zdrowotnym, poradą psychologiczną, diagnozą, terapią ani wyrobem
              medycznym. Korzystanie z niej nie zastępuje konsultacji z psychologiem, psychiatrą ani lekarzem.
            </li>
            <li>
              Treści zawarte w Aplikacji mają charakter ogólny i edukacyjny. Nie odnoszą się do sytuacji konkretnego dziecka ani
              konkretnej rodziny i nie mogą stanowić wyłącznej podstawy decyzji dotyczących zdrowia lub wychowania.
            </li>
            <li>
              W sytuacji zagrożenia życia lub zdrowia Użytkownik powinien skorzystać z pomocy służb ratunkowych (nr 112) lub z kontaktów
              wskazanych w Aplikacji w sekcji „Potrzebuję pomocy teraz". Aplikacja nie zapewnia kontaktu z osobą w czasie rzeczywistym i
              nie służy do zgłaszania sytuacji kryzysowych.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 3. Rodzaj i zakres usług</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Usługodawca świadczy drogą elektroniczną nieodpłatną usługę polegającą na udostępnieniu Użytkownikowi treści i narzędzi
              Aplikacji, obejmujących w szczególności:
              <ol className="mt-2 list-[lower-alpha] space-y-1.5 pl-5">
                <li>materiały edukacyjne i karty pracy do samodzielnego wypełniania,</li>
                <li>quizy sprawdzające i utrwalające wiedzę,</li>
                <li>propozycje aktywności do wykonania z dzieckiem,</li>
                <li>wyszukiwarkę odpowiedzi na najczęstsze pytania,</li>
                <li>moduł prezentujący wyniki badań nad skutecznością metod wychowawczych oraz zestawienie własnej aktywności Użytkownika,</li>
                <li>funkcje zapisu, eksportu i usunięcia wprowadzonych przez Użytkownika treści.</li>
              </ol>
            </li>
            <li>
              Usługa jest świadczona nieodpłatnie. Dostęp do Aplikacji stanowi element programu, w którym Użytkownik uczestniczy, i nie
              podlega odrębnej opłacie.
            </li>
            <li>Aplikacja nie zawiera reklam, treści komercyjnych osób trzecich ani mechanizmów śledzenia zachowań Użytkownika.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 4. Warunki techniczne</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Do korzystania z Aplikacji niezbędne są:
              <ol className="mt-2 list-[lower-alpha] space-y-1.5 pl-5">
                <li>urządzenie z dostępem do internetu (komputer, tablet lub telefon),</li>
                <li>aktualna przeglądarka internetowa (Chrome, Firefox, Safari lub Edge w wersji z ostatnich dwóch lat),</li>
                <li>włączona obsługa JavaScript,</li>
                <li>
                  <strong>włączona możliwość zapisu danych w pamięci lokalnej przeglądarki</strong> (localStorage) — bez niej Aplikacja
                  nie zapamięta wprowadzonych treści.
                </li>
              </ol>
            </li>
            <li>Po pierwszym wejściu Aplikacja może działać bez połączenia z internetem.</li>
            <li>
              Usługodawca nie ponosi odpowiedzialności za nieprawidłowe działanie Aplikacji wynikające z konfiguracji urządzenia
              Użytkownika, oprogramowania blokującego lub braku spełnienia warunków wskazanych w ust. 1.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 5. Dostęp na Token</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Aplikacja <strong>nie jest ogólnodostępna</strong>. Dostęp uzyskuje wyłącznie osoba dysponująca ważnym Tokenem wydanym
              przez Usługodawcę.
            </li>
            <li>Token jest wydawany indywidualnie każdemu uczestnikowi programu i jest ważny przez okres wskazany przy jego wydaniu.</li>
            <li>Użytkownik zobowiązuje się nie udostępniać Tokena osobom trzecim.</li>
            <li>
              Usługodawca może unieważnić Token w przypadku jego udostępnienia osobom nieuprawnionym, korzystania z Aplikacji niezgodnie z
              Regulaminem lub zakończenia udziału w programie.
            </li>
            <li>
              Token nie jest w Aplikacji powiązany z imieniem, nazwiskiem ani innymi danymi identyfikującymi Użytkownika. Usługodawca nie
              ma technicznej możliwości ustalenia, jakie treści zostały wprowadzone przez posiadacza danego Tokena.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 6. Anonimowość i treści wprowadzane przez Użytkownika</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Korzystanie z Aplikacji odbywa się <strong>anonimowo</strong>. Aplikacja nie wymaga rejestracji, nie prosi o imię,
              nazwisko, adres e-mail ani dane dziecka i nie zawiera funkcji tworzenia profilu.
            </li>
            <li>
              Wszystkie treści wprowadzone przez Użytkownika (odpowiedzi w kartach pracy, notatki, wyniki quizów) są zapisywane{" "}
              <strong>wyłącznie w pamięci lokalnej przeglądarki na urządzeniu Użytkownika</strong>. Nie są przesyłane do Usługodawcy ani
              do jakiegokolwiek podmiotu trzeciego i nie są przechowywane na serwerze.
            </li>
            <li>
              Usługodawca nie ma dostępu do treści wprowadzonych przez Użytkownika. Jedynym sposobem ich udostępnienia jest samodzielne
              przekazanie ich przez Użytkownika, w formie wydruku lub pliku eksportu, na spotkaniu w ramach programu. Jest to wyłączna
              decyzja Użytkownika.
            </li>
            <li>
              Użytkownik ponosi wyłączną odpowiedzialność za zabezpieczenie własnego urządzenia. Zaleca się nieużywanie Aplikacji na
              urządzeniu współdzielonym z innymi osobami bez zabezpieczenia dostępu.
            </li>
            <li className="rounded-xl border border-accent/40 bg-panel px-4 py-3">
              <strong>Usunięcie danych przeglądarki, korzystanie z trybu prywatnego lub zmiana urządzenia powoduje bezpowrotną utratę
              wprowadzonych treści.</strong> Usługodawca nie posiada kopii tych danych i nie może ich odtworzyć. Użytkownikowi zaleca się
              korzystanie z funkcji eksportu jako kopii zapasowej.
            </li>
            <li>
              Użytkownikowi zaleca się nieumieszczanie w polach tekstowych danych umożliwiających identyfikację osób, w tym imion i
              nazwisk dzieci oraz informacji o rozpoznaniach medycznych.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 7. Obowiązki Użytkownika</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Użytkownika obowiązuje zakaz dostarczania treści o charakterze bezprawnym.</li>
            <li>
              Użytkownik zobowiązuje się korzystać z Aplikacji zgodnie z prawem, Regulaminem i jej przeznaczeniem, a w szczególności nie
              podejmować działań zakłócających jej funkcjonowanie, nie próbować obchodzić mechanizmu dostępu na Token oraz nie kopiować i
              nie rozpowszechniać jej treści.
            </li>
            <li>Aplikacja jest przeznaczona dla osób pełnoletnich. Nie jest kierowana do dzieci i nie powinna być przez nie samodzielnie użytkowana.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 8. Prawa autorskie</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Treści Aplikacji — teksty, karty pracy, quizy, opracowania i szata graficzna — stanowią utwór w rozumieniu ustawy z dnia 4
              lutego 1994 r. o prawie autorskim i prawach pokrewnych i przysługują Usługodawcy.
            </li>
            <li>
              Użytkownik uzyskuje prawo do korzystania z treści <strong>wyłącznie na własny użytek osobisty</strong>, w związku z
              udziałem w programie. Obejmuje to prawo do wydrukowania kart pracy dla siebie i swojej rodziny.
            </li>
            <li>
              Zabronione jest w szczególności: udostępnianie treści osobom trzecim, publikowanie ich w internecie, wykorzystywanie w
              działalności szkoleniowej, terapeutycznej lub komercyjnej, a także tworzenie opracowań na ich podstawie — bez uprzedniej
              pisemnej zgody Usługodawcy.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 9. Zawarcie i rozwiązanie umowy</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą wprowadzenia przez Użytkownika prawidłowego Tokena i zaakceptowania Regulaminu.</li>
            <li>Umowa jest zawarta na czas nieoznaczony, nie dłużej jednak niż na okres ważności Tokena.</li>
            <li>Użytkownik może w każdej chwili rozwiązać umowę, zaprzestając korzystania z Aplikacji. Zaleca się skorzystanie wcześniej z funkcji „Usuń wszystkie moje dane".</li>
            <li>Rozwiązanie umowy nie wymaga żadnej formy ani powiadomienia i nie wiąże się z jakimikolwiek kosztami.</li>
            <li>Usługodawca może rozwiązać umowę z Użytkownikiem naruszającym Regulamin, unieważniając jego Token, po uprzednim wezwaniu do zaprzestania naruszeń — chyba że naruszenie ma charakter rażący.</li>
            <li>Usługodawca zastrzega prawo do zakończenia świadczenia usługi w całości, z zapowiedzią wyświetlaną w Aplikacji z co najmniej 30-dniowym wyprzedzeniem, umożliwiającym Użytkownikom wyeksportowanie własnych treści.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 10. Reklamacje</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Reklamacje dotyczące działania Aplikacji Użytkownik może zgłaszać:
              <ol className="mt-2 list-[lower-alpha] space-y-1.5 pl-5">
                <li>
                  na adres e-mail: <Uzup>[DO UZUPEŁNIENIA]</Uzup>,
                </li>
                <li>telefonicznie: 693 169 828,</li>
                <li>pisemnie na adres: ul. Wyszyńskiego 5, 98-338 Pajęczno.</li>
              </ol>
            </li>
            <li>
              Zgłoszenie powinno zawierać opis nieprawidłowości, datę jej wystąpienia oraz informację o używanym urządzeniu i
              przeglądarce. Podanie danych kontaktowych jest dobrowolne i służy wyłącznie udzieleniu odpowiedzi.
            </li>
            <li>
              Usługodawca rozpatruje reklamację w terminie <strong>14 dni</strong> od jej otrzymania i informuje Użytkownika o wyniku w
              sposób, w jaki reklamacja została zgłoszona.
            </li>
            <li>
              Użytkownik będący konsumentem może skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w
              tym z platformy ODR oraz z pomocy powiatowego (miejskiego) rzecznika konsumentów.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 11. Odpowiedzialność</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Usługodawca dokłada starań, aby Aplikacja działała prawidłowo i nieprzerwanie, nie gwarantuje jednak jej nieprzerwanej
              dostępności. Możliwe są przerwy techniczne oraz przerwy wynikające z działania podmiotów zewnętrznych (dostawcy hostingu,
              dostawcy internetu).
            </li>
            <li>
              Usługodawca nie ponosi odpowiedzialności za skutki decyzji wychowawczych podjętych przez Użytkownika na podstawie treści
              Aplikacji. Treści mają charakter ogólnoedukacyjny, a odpowiedzialność za sposób ich zastosowania w konkretnej sytuacji
              rodzinnej spoczywa na Użytkowniku.
            </li>
            <li>Usługodawca nie ponosi odpowiedzialności za utratę treści zapisanych w pamięci przeglądarki Użytkownika, w szczególności w przypadkach wskazanych w § 6 ust. 5.</li>
            <li>
              Ograniczenia odpowiedzialności nie wyłączają odpowiedzialności Usługodawcy w zakresie, w jakim nie może ona zostać
              wyłączona na podstawie bezwzględnie obowiązujących przepisów prawa, w szczególności wobec konsumentów.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 12. Dane osobowe</h2>
          <p className="mt-2">
            Zasady przetwarzania danych osobowych, w tym informacja o tym, że treści wprowadzane przez Użytkownika nie są przetwarzane
            przez Usługodawcę, zostały opisane w{" "}
            <a href="#/prywatnosc" className="underline">
              Polityce prywatności
            </a>
            , dostępnej w Aplikacji i stanowiącej jej integralne uzupełnienie.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 13. Zmiany Regulaminu</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Usługodawca może zmienić Regulamin z ważnych przyczyn, w szczególności zmiany przepisów prawa, zmiany zakresu funkcji
              Aplikacji lub względów bezpieczeństwa.
            </li>
            <li>O zmianie Użytkownicy zostaną poinformowani komunikatem w Aplikacji z co najmniej 14-dniowym wyprzedzeniem.</li>
            <li>Dalsze korzystanie z Aplikacji po wejściu zmian w życie oznacza ich akceptację. Użytkownik, który nie akceptuje zmian, powinien zaprzestać korzystania z Aplikacji.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">§ 14. Postanowienia końcowe</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego,
              ustawy o świadczeniu usług drogą elektroniczną, ustawy o prawie autorskim i prawach pokrewnych oraz RODO.
            </li>
            <li>
              Postanowienia Regulaminu nie ograniczają praw konsumentów wynikających z bezwzględnie obowiązujących przepisów prawa. W
              razie sprzeczności pierwszeństwo mają te przepisy.
            </li>
            <li>Regulamin wchodzi w życie z dniem 2026-09-06.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-accent/40 bg-panel p-5 text-xs leading-relaxed text-ink/70">
          <p>
            <strong>Do uzupełnienia przed publikacją:</strong> adres e-mail kontaktowy. Adres domeny zaktualizuj, jeśli podepniesz własną
            domenę zamiast <code>vercel.app</code>.
          </p>
          <p className="mt-2">
            <strong>Do weryfikacji przez prawnika:</strong> całość dokumentu, ze szczególnym uwzględnieniem § 2 (charakter usługi), § 11
            (odpowiedzialność) i zgodności z formą prowadzonej działalności.
          </p>
        </section>
      </div>
    </div>
  );
}
