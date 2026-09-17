# KŁĘBKOWO. Sprawa się plącze

Gra szkoleniowa o współpracy międzyinstytucjonalnej — dla czterech zespołów po pięć osób,
na 60 minut, plus 20 minut omówienia.

Ten katalog zawiera dwie rzeczy, które są sobie równorzędne:

1. **Wersję papierową** — komplet materiałów do wydrukowania. Gra jest w pełni rozgrywalna
   bez komputera.
2. **Aplikację** — wygodę, nie warunek. Prowadzi zespoły przez rundy, liczy liczniki,
   pilnuje czasu i przygotowuje omówienie.

Cała treść gry pochodzi z jednego pliku: `content/gra.json`. Aplikacja i materiały do druku
czytają dokładnie ten sam plik, więc nigdy się nie rozjadą.

---

## Najkrótsza droga: sama gra papierowa

1. Wydrukuj materiały (patrz „Jak wydrukować materiały”).
2. Przeczytaj `druk/00_instrukcja_prowadzacej.pdf` — jest tam przebieg minutowy, teksty do
   odczytania, tabele efektów i klucz decyzji.
3. Zagrajcie. Komputer nie jest potrzebny w ogóle.

---

## Wariant zalecany: aplikacja + karty prywatne na papierze

To najlepszy układ na sali. Aplikacja liczy i pilnuje czasu, ale **karty prywatne rozdajesz
Ty, na papierze** — dzięki temu nikt nie musi podawać sobie telefonu, a informacje zostają
tam, gdzie mają zostać.

W aplikacji zostaw włączony przełącznik **„Karty prywatne na papierze”** (jest włączony
domyślnie). Wtedy urządzenie stolika pokazuje tylko: „Odczytajcie swoje karty z koperty nr …”.

Do tego wariantu wydrukuj przynajmniej:
`04_karty_informacji_[A-D]`, `05_koperty_przelozonych`, `02_karty_rol`, `03_karty_misji`.

---

## Instalacja krok po kroku (Windows)

Robisz to **raz**, najlepiej dzień przed szkoleniem.

1. **Zainstaluj Node.js.** Wejdź na <https://nodejs.org>, pobierz wersję oznaczoną „LTS”
   i zainstaluj, klikając „Dalej”. Potrzebna jest wersja 20 lub nowsza.
2. **Otwórz wiersz poleceń w katalogu gry.** W Eksploratorze plików wejdź do folderu
   `klebkowo`, kliknij pasek adresu, wpisz `cmd` i naciśnij Enter.
3. **Zainstaluj zależności.** Wpisz:

   ```
   npm install
   ```

   Poczeka chwilę i wypisze „added … packages”. To wszystko.

4. **Sprawdź, czy działa.** Wpisz:

   ```
   npm start
   ```

   Na ekranie pojawią się adresy. Zostaw to okno otwarte — to jest serwer gry.
   Zamykasz je klawiszami **Ctrl + C**.

---

## Uruchomienie na sali

1. Podłącz laptop do tej samej sieci Wi-Fi co telefony stolików (może być hotspot z telefonu).
2. W katalogu `klebkowo` wpisz `npm start`.
3. Przepisz adres z linii **„W sieci lokalnej”** (coś w rodzaju `http://192.168.1.14:4173`)
   i otwórz go w przeglądarce na laptopie.
4. Wybierz **Prowadząca**, ustaw PIN (4–6 cyfr) i kliknij **Utwórz sesję**.
   PIN zapamiętaj — nie da się go odczytać z komputera.
5. Na ekranie zobaczysz cztery kody stolików i cztery kody QR.

### Podłączenie stolików (około dwóch minut)

- Każdy stolik dostaje **jedno** urządzenie — nie każda osoba z osobna.
- Ktoś przy stoliku skanuje aparatem kod QR swojego stolika. Otworzy się od razu właściwy stolik.
- Jeśli aparat nie chce skanować: wpiszcie w przeglądarce adres z punktu 3, wybierzcie
  **Stolik** i wpiszcie czteroznakowy kod.

### Ekran sali

Na projektorze otwórz **Ekran sali** (przycisk w widoku prowadzącej). Widać tam nazwę fazy,
duży zegar, zasady, a na koniec Kroniki wszystkich stolików.

### Prowadzenie gry

- Fazami sterujesz Ty, przyciskiem **Następna faza**. Stoliki nie mogą tego zrobić same.
- Stolik, który skończył rundę, widzi spokojny ekran oczekiwania.
- Zegar możesz zatrzymać i wznowić.
- Jeśli coś policzy się źle (np. ktoś kliknął dwa razy), użyj **Popraw licznik**.
  Korekta wymaga krótkiego uzasadnienia i zostaje w dzienniku zmian, który widzisz w omówieniu.

---

## Tryb projektora — gra na jednym urządzeniu

Nie ma sieci? Nie ma telefonów? Wybierz **Tryb projektora** na pierwszym ekranie.

Wtedy stoliki grają na papierze, a Ty wprowadzasz ich decyzje i działania na swoim laptopie.
Ten tryb **nie potrzebuje serwera** — działa nawet po otwarciu zbudowanej aplikacji
bezpośrednio z pliku. Stan gry zostaje w przeglądarce tego jednego komputera.

---

## Co zrobić, gdy coś pójdzie nie tak

**Zerwie się Wi-Fi.** Aplikacja sama przechodzi na sprawdzanie stanu co trzy sekundy i wypisuje
„Słaba sieć”. Gra toczy się dalej. Gdy sieć wróci, wszystko się zsynchronizuje. Jeśli stolik
kliknął coś w trakcie awarii, a operacja poszła dwa razy — **nic się nie zdubluje**, aplikacja
rozpoznaje powtórzenia.

**Rozładuje się urządzenie stolika.** Wejdźcie na ten sam kod stolika z dowolnego innego
telefonu. Stan gry jest na serwerze, nie na telefonie — nic nie ginie.

**Zawiesi się laptop albo trzeba zamknąć okno serwera.** Uruchom `npm start` jeszcze raz.
Sesja wraca z migawki zapisywanej co 10 sekund i przy każdej zmianie fazy. W widoku
prowadzącej wybierz sesję z listy i podaj ten sam PIN.

**Nic nie działa, a gra ma się odbyć teraz.** Przejdźcie na papier. To dlatego wersja
papierowa jest pełnoprawna. Instrukcja `00_instrukcja_prowadzacej.pdf` ma wszystko,
czego potrzebujesz, łącznie z procedurą rozstrzygania decyzji.

---

## Jak wydrukować materiały

W katalogu `klebkowo` wpisz:

```
npm run druk
```

Po chwili w folderze `druk/` pojawi się 20 plików PDF. Możesz też obejrzeć i wydrukować
pojedynczy arkusz z aplikacji: **Druk** na pierwszym ekranie.

Materiały są przygotowane pod zwykłą drukarkę — bez ciemnych, pełnych teł, bez białego tekstu
na czerni. Drukują się dobrze w kolorze i w czerni.

### Ile kompletów przygotować

| Plik | Ile |
|---|---|
| `00_instrukcja_prowadzacej` | 1 — **tylko dla Ciebie**; zawiera też pełne zasady gry |
| `01_plansza_stolika_A3_[A-D]` | po 1 na stolik (A3 albo dwa A4 sklejone) |
| `02_karty_rol` | 1 plik = 4 komplety po 5 kart |
| `03_karty_misji` | 1 plik = 4 karty, po jednej na stolik |
| `04_karty_informacji_[A-D]` | po 1 na stolik; potnij i włóż do kopert osobno na rundę 1 i rundę 3 |
| `05_koperty_przelozonych` | 1 plik = 20 wiadomości + etykiety „Otworzyć w rundzie 2” |
| `06_karty_zdarzen` | 1 komplet u Ciebie |
| `07_karty_skutkow` | 1 komplet u Ciebie — **tylko dla Ciebie** |
| `08_karty_akcji` | 1 plik = 4 talie po 9 kart |
| `09_karty_decyzji_i_zobowiazan` | 1 plik = po 3 druki na rundę na stolik |
| `10_arkusz_prowadzacej` | 1 — **tylko dla Ciebie** |
| `11_kronika_szablon` | po 1 na stolik |
| `12_zetony` | 1 plik — pionki, znaczniki ochrony, znaczniki wyczerpania |
| `13_scenariusz_i_zasady_dla_uczestnikow` | po 1 na stolik (albo po 1 na osobę) + ściągawki do wycięcia |

Pliki **00**, **07** i **10** zawierają klucz decyzji i ukryte liczniki. Nie zostawiaj ich
na stolikach i nie kładź na wspólnym stole z materiałami.

### Dwa dokumenty z zasadami

Zasady są opisane w dwóch miejscach i jest to celowe:

- **`00_instrukcja_prowadzacej.pdf`** — sekcja „Pełne zasady gry” (strony 5–7). Liczniki jawne
  i ukryte, wyczerpanie, akcje wraz z dokładnym momentem działania ochron, cztery rodzaje zdarzeń,
  zobowiązania z kostką, decyzje razem z mechanizmem ukrytym, kolejność kroków w rundzie,
  finał i lista rzeczy, których pilnujesz przez całą grę. To Twój komplet — nie zostawiaj go na stoliku.
- **`13_scenariusz_i_zasady_dla_uczestnikow.pdf`** — dwie strony A4 do rozdania przy stolikach:
  fabuła, kto jest przy stole, zasady, opis czterech jawnych liczników, przebieg rundy krok po kroku,
  cała talia działań z kosztami i zasada sprawdzania zobowiązań. Plus ściągawki A6 do wycięcia.
  **Nie ma tam ani słowa** o ukrytym ryzyku, o liczbie spotkań ani o tym, że którakolwiek opcja
  decyzji jest „zgodna z pełną wiedzą” — pilnuje tego osobny test.

---

## Omówienie

### Dzień 1 — po grze

W widoku prowadzącej kliknij **Tryb omówienia**, zakładka **Dzień 1**. Zobaczysz dla każdego
stolika osobno: wykres liczników, listę zdarzeń i reakcji, zobowiązania wraz z obciążeniem
w chwili sprawdzenia oraz pytania do omówienia (każde można pokazać na pełnym ekranie).

Na górze stoi baner **„Nie ujawniać”**. To nie jest ozdoba: mechanizm ukryty w grze omawiacie
dopiero drugiego dnia. W dniu 1 rozmawiacie o przebiegu, rolach i współpracy — nie o tym,
która decyzja była „trafna”.

### Dzień 2 — ujawnienie mechanizmu

Zakładka **Mechanizm ukryty — dzień 2** jest dodatkowo zabezpieczona pytaniem
„Ta zakładka ujawnia mechanizm omawiany w module 5. Kontynuować?”.

Znajdziesz tam dla każdego stolika: co zespół wybrał, która opcja była zgodna z pełną wiedzą
zespołu i — odsłaniane kliknięciem, rola po roli — które informacje przesądzały sprawę.
Jest też zestawienie liczby spotkań obok ukrytego ryzyka, z wyraźnym podpisem: **spotkania
nie wpływały na ryzyko**. To zwykle najmocniejszy moment rozmowy.

Wersja papierowa: te same dane masz w `10_arkusz_prowadzacej.pdf`, jeśli wypełniałaś go
w trakcie gry.

---

## Prywatność i dane

- Aplikacja zapisuje **stan gry, nie stan uczestnika**. Nie ma kont, logowania uczestników,
  e-maili, analityki ani ciasteczek śledzących.
- Przy losowaniu ról aplikacja pyta wyłącznie o obszar pracy — i tylko po to, żeby nikt nie
  zagrał własnego zawodu. Obszary **nie są zapisywane**; zostaje samo „Osoba 1 → R3”.
- Nie ma żadnych zapytań do serwerów zewnętrznych. Czcionki, kody QR i wykresy powstają
  lokalnie.
- Sesje kasują się same po dobie. Możesz też skasować od razu: **Zakończ i usuń sesję**.
- Eksport (JSON i CSV) jest wyłącznie na poziomie stolików — bez mapowania osób na role.

### Jak usunąć dane sesji

W widoku prowadzącej: **Zakończ i usuń sesję**. Usuwa sesję z pamięci i z dysku.
Jeśli chcesz mieć pewność, że nie zostało nic: skasuj folder `.sesje` w katalogu `klebkowo`.
W trybie projektora dane są w przeglądarce — usuwa je przycisk **Zakończ i usuń**.

---

## Struktura katalogu

```
klebkowo/
├─ content/gra.json           jedyne źródło treści gry (nie edytuj bez potrzeby)
├─ druk/                      gotowe PDF-y (powstają po „npm run druk”)
├─ docs/
│  ├─ DECYZJE.md              decyzje projektowe i miejsca do Twojej akceptacji
│  └─ OFL-*.txt               licencje czcionek
├─ e2e/                       testy całej gry w przeglądarce
└─ packages/
   ├─ engine/                 reguły gry (czyste funkcje) + testy jednostkowe
   ├─ server/                 serwer sesji, synchronizacja, tryb omówienia
   ├─ web/                    aplikacja (stolik, prowadząca, ekran sali, omówienie, druk)
   └─ print/                  szablony wersji papierowej
```

## Polecenia

| Polecenie | Co robi |
|---|---|
| `npm start` | buduje aplikację i uruchamia serwer gry |
| `npm run druk` | generuje komplet PDF-ów do folderu `druk/` |
| `npm test` | testy reguł gry i serwera |
| `npm run e2e` | testy całej gry w przeglądarce |
| `npm run sprawdz` | sprawdzenie typów |
| `npm run pokaz` | buduje wariant do obejrzenia bez serwera (patrz niżej) |

Jest też `Dockerfile`, jeśli gra ma stanąć na własnym serwerze zamiast na laptopie.
Na sali nie jest potrzebny.

## Wariant „pokaz” — gra bez serwera

`npm run pokaz` buduje tę samą aplikację tak, żeby dało się ją otworzyć z dowolnego adresu
(albo wprost z pliku) bez uruchamiania serwera. Wynik trafia do `packages/web/pokaz/`.

Działają w nim dwie części, które z założenia nie potrzebują backendu: **tryb projektora**
i **materiały do druku**. Widok prowadzącej, widok stolika i ekran sali pokazują wtedy
wyjaśnienie zamiast błędu połączenia — one żyją z sesją, którą prowadzi serwer.

Ten wariant zawiera pełną treść gry, łącznie z kluczem decyzji. Nadaje się do obejrzenia
i do pracy własnej prowadzącej, **nie do rozesłania uczestnikom**.

Jeśli po zmianie `content/gra.json` aplikacja odmówi startu — to celowe. Wypisze po polsku,
co dokładnie jest nie tak, i nie pozwoli wejść do sali z niespójną grą.
