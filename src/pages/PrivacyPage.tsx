import type { ReactNode } from "react";

function Uzup({ children }: { children: ReactNode }) {
  return <span className="rounded bg-panel px-1 py-0.5 text-ink/70">{children}</span>;
}

export function PrivacyPage() {
  return (
    <div className="max-w-none">
      <h1 className="font-heading text-2xl font-semibold">Polityka prywatności aplikacji „Zanim zaczniemy — ćwiczenia"</h1>
      <p className="mt-2 text-sm text-ink/60">
        Obowiązuje od: 2026-09-06 · Wersja 1.0
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed">
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-heading text-base font-semibold">W skrócie — najważniejsze, zanim przejdziesz dalej</h2>
          <p className="mt-2">Ta aplikacja została zbudowana tak, żeby nie zbierać o Tobie danych.</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Nie zakładasz konta. Nie podajesz imienia, nazwiska, e-maila ani danych dziecka.</li>
            <li>Wszystko, co wpiszesz w karty pracy i notatki, zapisuje się wyłącznie w Twojej przeglądarce, na Twoim urządzeniu.</li>
            <li>Te treści nigdy nie są wysyłane na żaden serwer. Nie widzi ich prowadząca, nie widzi ich nikt inny.</li>
            <li>Nie ma tu analityki, reklam, plików cookie służących śledzeniu ani powiadomień.</li>
            <li>W każdej chwili możesz jednym przyciskiem usunąć wszystkie swoje dane.</li>
          </ul>
          <p className="mt-2">Poniżej opisano to szczegółowo, zgodnie z wymogami RODO.</p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">1. Administrator danych</h2>
          <p className="mt-2">Administratorem danych osobowych w zakresie opisanym w niniejszej Polityce jest:</p>
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
            W sprawach dotyczących ochrony danych można kontaktować się na powyższe dane. Administrator nie wyznaczył inspektora ochrony
            danych — nie ma takiego obowiązku przy opisanym poniżej zakresie przetwarzania.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">2. Treści, które wpisujesz w Aplikacji</h2>
          <p className="mt-2">To najważniejsza część tego dokumentu.</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Odpowiedzi w kartach pracy, notatki, wyniki quizów i wszystkie inne wprowadzone przez Ciebie treści są zapisywane w{" "}
              <strong>pamięci lokalnej Twojej przeglądarki</strong> (mechanizm <code>localStorage</code>) na urządzeniu, z którego
              korzystasz.
            </li>
            <li>
              <strong>Dane te nie są przesyłane do Administratora ani do żadnego innego podmiotu.</strong> Nie trafiają na serwer, nie są
              przechowywane w chmurze, nie są kopiowane.
            </li>
            <li>
              Administrator <strong>nie ma technicznej możliwości</strong> zapoznania się z tymi treściami. Nie istnieje panel, w którym
              można byłoby je zobaczyć.
            </li>
            <li>
              W konsekwencji Administrator nie przetwarza tych informacji w rozumieniu RODO — pozostają one wyłącznie pod Twoją kontrolą,
              na Twoim urządzeniu.
            </li>
            <li>
              Jeśli chcesz pokazać swoje zapiski prowadzącej, możesz skorzystać z funkcji eksportu do PDF lub pliku i przynieść je na
              spotkanie. <strong>To wyłącznie Twoja decyzja</strong> — Aplikacja nie robi tego automatycznie i nie ma takiej możliwości.
            </li>
            <li>
              Zaleca się, abyś mimo wszystko <strong>nie wpisywał_a w polach tekstowych imion, nazwisk ani informacji o rozpoznaniach
              medycznych</strong> — z tego samego powodu, dla którego nie zapisuje się takich rzeczy w kalendarzu na telefonie.
            </li>
          </ol>
          <p className="mt-3 rounded-xl border border-accent/40 bg-panel px-4 py-3">
            <strong>Uwaga praktyczna:</strong> ponieważ dane są tylko u Ciebie, wyczyszczenie historii przeglądarki, korzystanie z trybu
            prywatnego lub zmiana urządzenia oznacza ich bezpowrotną utratę. Administrator nie posiada kopii i nie może ich odtworzyć.
            Dlatego warto co jakiś czas skorzystać z eksportu.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">3. Token dostępu</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Dostęp do Aplikacji wymaga wprowadzenia indywidualnego Tokena.</li>
            <li>
              W Aplikacji przechowywane są wyłącznie <strong>nieodwracalne skróty kryptograficzne (SHA-256)</strong> dopuszczonych
              Tokenów. Sam Token nie jest nigdzie zapisywany w formie jawnej.
            </li>
            <li>
              <strong>Token nie jest w żaden sposób powiązany z Twoim imieniem, nazwiskiem ani danymi kontaktowymi w systemie
              informatycznym.</strong> Administrator prowadzi poza Aplikacją wykaz osób, którym Tokeny wydano — jest to dokumentacja
              papierowa lub plik lokalny, niepołączony z Aplikacją i niedostępny z internetu.
            </li>
            <li>Nie jest technicznie możliwe powiązanie treści wprowadzonych w Aplikacji z konkretnym Tokenem, a więc i z konkretną osobą.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">4. Pamięć lokalna przeglądarki (localStorage)</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Aplikacja zapisuje informacje w pamięci Twojego urządzenia w dwóch celach: aby zapamiętać Twoje wpisy oraz aby pamiętać, że
              dostęp został odblokowany.
            </li>
            <li>
              Zapis ten jest <strong>niezbędny do świadczenia usługi, o którą wyraźnie prosisz</strong>, wchodząc do Aplikacji — bez niego
              narzędzie nie mogłoby działać. Zgodnie z przepisami Prawa komunikacji elektronicznej przechowywanie informacji na
              urządzeniu użytkownika nie wymaga odrębnej zgody, jeżeli jest niezbędne do świadczenia usługi żądanej przez użytkownika.
            </li>
            <li>
              Aplikacja <strong>nie stosuje</strong> plików cookie ani innych technologii służących: analityce, statystykom,
              profilowaniu, reklamie, śledzeniu między witrynami. Nie korzysta z Google Analytics ani z żadnego odpowiednika. Czcionki i
              wszystkie zasoby są ładowane z serwera Aplikacji, bez odwołań do usług zewnętrznych.
            </li>
            <li>
              Zawartość pamięci lokalnej możesz w każdej chwili usunąć: przyciskiem „Usuń wszystkie moje dane" w Aplikacji albo poprzez
              ustawienia przeglądarki.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">5. Dane przetwarzane mimo wszystko — logi serwera</h2>
          <p className="mt-2">
            Aplikacja jest udostępniana przez dostawcę hostingu. Jak każda strona internetowa, generuje techniczne logi połączeń.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <tbody>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 align-top font-medium">Zakres danych</th>
                  <td className="py-2">adres IP, data i godzina połączenia, typ przeglądarki i systemu, adres podstrony</td>
                </tr>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 align-top font-medium">Cel</th>
                  <td className="py-2">zapewnienie działania i bezpieczeństwa usługi, wykrywanie awarii i nadużyć</td>
                </tr>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 align-top font-medium">Podstawa prawna</th>
                  <td className="py-2">art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes polegający na utrzymaniu bezpieczeństwa usługi</td>
                </tr>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 align-top font-medium">Okres przechowywania</th>
                  <td className="py-2">
                    zgodnie z polityką dostawcy hostingu, obecnie do 30 dni (plan Hobby) <Uzup>[DO POTWIERDZENIA przy zmianie planu]</Uzup>
                  </td>
                </tr>
                <tr>
                  <th className="py-2 pr-4 align-top font-medium">Odbiorca</th>
                  <td className="py-2">
                    dostawca hostingu: <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA), na podstawie Data
                    Processing Addendum dostawcy
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Administrator nie analizuje tych logów w celu obserwowania zachowania poszczególnych użytkowników i nie łączy ich z Tokenami
            ani z treścią wpisów.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">6. Kontakt i reklamacje</h2>
          <p className="mt-2">Jeżeli napiszesz lub zadzwonisz w sprawie Aplikacji:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong>Zakres danych:</strong> dane, które sam_a podasz — imię, adres e-mail lub numer telefonu, treść wiadomości
            </li>
            <li>
              <strong>Cel:</strong> udzielenie odpowiedzi, rozpatrzenie reklamacji
            </li>
            <li>
              <strong>Podstawa prawna:</strong> art. 6 ust. 1 lit. f RODO (prowadzenie korespondencji) lub art. 6 ust. 1 lit. b RODO
              (rozpatrzenie reklamacji jako wykonanie umowy)
            </li>
            <li>
              <strong>Okres przechowywania:</strong> do zakończenia sprawy, a następnie przez okres przedawnienia ewentualnych roszczeń
            </li>
            <li>Podanie tych danych jest dobrowolne, ale niezbędne do udzielenia odpowiedzi.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">7. Czego Administrator nie robi</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>nie sprzedaje i nie udostępnia danych podmiotom trzecim w celach marketingowych</li>
            <li>nie stosuje profilowania ani zautomatyzowanego podejmowania decyzji wywołujących skutki prawne</li>
            <li>
              nie przekazuje Twoich treści (wpisów w Aplikacji) nigdzie — bo nigdy nie opuszczają Twojego urządzenia. Techniczne logi
              połączeń opisane w pkt 5 mogą być przetwarzane przez dostawcę hostingu (Vercel Inc., USA) poza Europejskim Obszarem
              Gospodarczym, na podstawie Data Processing Addendum dostawcy zawierającego standardowe klauzule umowne (SCC){" "}
              <Uzup>[DO WERYFIKACJI PRZEZ PRAWNIKA]</Uzup>
            </li>
            <li>nie wysyła powiadomień push, newsletterów ani informacji handlowych z poziomu Aplikacji</li>
            <li>
              nie przetwarza w Aplikacji danych szczególnych kategorii (w tym danych o zdrowiu) — Aplikacja została zaprojektowana tak,
              aby takie dane nigdy nie opuściły urządzenia użytkownika
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">8. Twoje prawa</h2>
          <p className="mt-2">W zakresie danych opisanych w pkt 5 i 6 przysługuje Ci prawo do:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>dostępu do danych i uzyskania ich kopii (art. 15 RODO),</li>
            <li>sprostowania danych (art. 16),</li>
            <li>usunięcia danych (art. 17),</li>
            <li>ograniczenia przetwarzania (art. 18),</li>
            <li>przenoszenia danych (art. 20) — w zakresie, w jakim przetwarzanie odbywa się na podstawie umowy,</li>
            <li>
              <strong>sprzeciwu</strong> wobec przetwarzania opartego na prawnie uzasadnionym interesie (art. 21),
            </li>
            <li>wniesienia skargi do organu nadzorczego:</li>
          </ul>
          <p className="mt-2">
            <strong>Prezes Urzędu Ochrony Danych Osobowych</strong>
            <br />
            ul. Stawki 2, 00-193 Warszawa
          </p>
          <p className="mt-2">
            W zakresie treści wpisanych przez Ciebie w Aplikacji realizacja tych praw następuje po Twojej stronie — masz do nich pełny i
            wyłączny dostęp, możesz je zmienić, wyeksportować lub usunąć w każdej chwili, bez pośrednictwa Administratora.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">9. Bezpieczeństwo</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5">
            <li>Aplikacja jest udostępniana wyłącznie przez połączenie szyfrowane (HTTPS).</li>
            <li>Aplikacja jest wyłączona z indeksowania przez wyszukiwarki internetowe.</li>
            <li>Dostęp wymaga indywidualnego Tokena, którego skróty przechowywane są w postaci nieodwracalnej.</li>
            <li>
              Architektura Aplikacji nie przewiduje bazy danych z treściami użytkowników — nie istnieje zasób, który mógłby zostać
              wykradziony w wyniku ataku na serwer.
            </li>
            <li>
              Zabezpieczenie własnego urządzenia (blokada ekranu, konto użytkownika, brak współdzielenia przeglądarki) pozostaje po
              stronie Użytkownika i ma tu istotne znaczenie, ponieważ dane znajdują się właśnie tam.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">10. Dzieci</h2>
          <p className="mt-2">
            Aplikacja jest przeznaczona dla osób pełnoletnich — rodziców i opiekunów. Nie jest kierowana do dzieci, nie zbiera danych
            dzieci i nie powinna być przez nie samodzielnie użytkowana.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold">11. Zmiany Polityki prywatności</h2>
          <p className="mt-2">
            Polityka może zostać zaktualizowana w razie zmiany przepisów lub sposobu działania Aplikacji. O zmianach Użytkownicy zostaną
            poinformowani komunikatem w Aplikacji. Aktualna wersja i data jej obowiązywania są zawsze widoczne na górze dokumentu.
          </p>
        </section>

        <section className="rounded-2xl border border-accent/40 bg-panel p-5 text-xs leading-relaxed text-ink/70">
          <p>
            <strong>Do uzupełnienia przed publikacją:</strong> adres e-mail kontaktowy.
          </p>
          <p className="mt-2">
            <strong>Do weryfikacji przez prawnika lub inspektora ochrony danych:</strong> całość dokumentu, w szczególności pkt 2
            (twierdzenie o braku przetwarzania treści użytkownika), pkt 5 (umowa powierzenia z Vercel Inc.) oraz pkt 7 (podstawa transferu
            danych poza EOG — Data Processing Addendum / SCC).
          </p>
        </section>
      </div>
    </div>
  );
}
