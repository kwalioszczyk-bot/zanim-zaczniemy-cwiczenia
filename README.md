# Zanim zaczniemy — ćwiczenia

Zamknięta aplikacja Gabinetu Psychologicznego (Katarzyna Walioszczyk-Urbaniak) do pracy własnej
dla uczestniczek i uczestników Treningu Umiejętności Rodzicielskich. To nie jest produkt
publiczny — dostęp ma wyłącznie osoba, która dostała od prowadzącej indywidualny token.
Wszystkie odpowiedzi użytkownika zostają wyłącznie w przeglądarce na jego urządzeniu
(`localStorage`) — nic nie jest wysyłane na żaden serwer, także do prowadzącej.

## Model dostępu: jedna osoba = jeden token, praca anonimowa

- Token generuje prowadząca przed rozpoczęciem cyklu i wręcza go osobiście lub bezpiecznym
  kanałem — jeden token na jedną osobę.
- Token jest **jedyną tożsamością** w systemie. Aplikacja nigdy nie pyta o imię, nazwisko,
  e-mail ani wiek dziecka — nie ma pola profilu i nie może go być.
- Token nie jest nigdzie zapisywany razem z treścią wpisów — służy wyłącznie do przejścia
  bramki startowej, wpisy leżą osobno w `localStorage`.
- Jeśli uczestniczka lub uczestnik chce pokazać swoje wpisy prowadzącej, robi to sam/-a przez
  eksport do PDF — to zawsze świadoma decyzja, nigdy automat.

## Zasada nadrzędna

Ta aplikacja nie ma backendu, bazy danych ani kont użytkowników. Cała logika działa w
przeglądarce. Jeśli w przyszłości ktoś doda funkcję wymagającą wysłania treści na serwer
(np. prawdziwy asystent AI zamiast wyszukiwarki po lokalnej bazie pytań i odpowiedzi) —
to jest świadoma zmiana architektury, nie drobna poprawka. Miejsce na to zostało oznaczone
komentarzem `// TODO: wymaga decyzji o przetwarzaniu danych` w `src/lib/assistant.ts`.

---

## Druga aplikacja w tym repozytorium: gra „KŁĘBKOWO. Sprawa się plącze”

W katalogu [`klebkowo/`](klebkowo/README.md) mieszka osobny, samodzielny projekt — gra
szkoleniowa o współpracy międzyinstytucjonalnej (aplikacja webowa + pełna wersja papierowa
do druku). Nie ma żadnego połączenia z aplikacją opisaną wyżej: ma własne zależności,
własny serwer i własne testy.

Instrukcja dla prowadzącej: [`klebkowo/README.md`](klebkowo/README.md).


## Wymagania

- Node.js 18+ i npm

## Instalacja i uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja wystartuje pod `http://localhost:5173`. Bez ważnego tokenu zobaczysz tylko ekran
logowania — zobacz niżej, jak wygenerować tokeny testowe.

## Generowanie tokenów dostępu

Dostęp do aplikacji jest chroniony prostym tokenem (np. `TUR-2026-AB3D`). W repozytorium nie ma
i nie może być zapisanych jawnych tokenów — trzymane są wyłącznie ich skróty SHA-256, w pliku
`src/tokens.json`.

Żeby wygenerować nową pulę tokenów dla grupy:

```bash
npm run tokens -- <liczba_tokenow> <rok> <waznosc_w_miesiacach>

# przykład: 25 tokenów na rok 2026, ważnych 9 miesięcy od pierwszego logowania
npm run tokens -- 25 2026 9

# opcjonalnie: dopisek pomocniczy dla Ciebie przy każdym tokenie (np. numer grupy) —
# widoczny tylko na konsoli, NIE trafia do tokens.json ani do aplikacji
npm run tokens -- 25 2026 9 --label "Grupa A, cykl wiosna 2026"
```

Skrypt:

1. wypisuje wygenerowane tokeny **w postaci jawnej na konsolę** — skopiuj tę listę od razu,
   nie jest nigdzie zapisywana i nie da się jej odzyskać później;
2. nadpisuje `src/tokens.json` samymi skrótami tych tokenów.

Ponieważ token jest jedyną „tożsamością" w aplikacji (żadnych imion, e-maili ani profili),
to Ty — prowadząca — decydujesz poza aplikacją, który token trafia do kogo (np. zapisując to na
własny użytek przy wręczaniu). Aplikacja tego nie przechowuje.

Po wygenerowaniu tokenów **zbuduj aplikację ponownie** (`npm run build`) i wdróż nową wersję —
dopiero wtedy nowe tokeny zaczną działać. Stare tokeny, których nie wygenerujesz ponownie,
przestaną działać (plik `tokens.json` jest nadpisywany, nie dopisywany).

Token to prosta bramka dostępu, a nie zabezpieczenie treści programu przed osobami, które go
dostały — warto to jasno komunikować uczestnikom.

## Budowanie i wdrożenie

```bash
npm run build
```

Wynik trafia do katalogu `dist/` jako w pełni statyczne pliki — wrzuć je na dowolny hosting
statyczny (najlepiej z serwerem w UE, zgodnie z założeniami prywatności). Aplikacja używa
ścieżek względnych (`base: "./"`), więc działa zarówno w katalogu głównym domeny, jak i w
podkatalogu.

Po wdrożeniu warto sprawdzić:

- czy `robots.txt` i nagłówek `<meta name="robots">` faktycznie blokują indeksowanie,
- czy aplikacja działa offline po pierwszym wejściu (service worker cache'uje zasoby),
- czy manifest PWA pozwala zainstalować aplikację na telefonie.

## Podmiana treści programu

Wszystkie teksty — moduły, karty pracy, quizy, zabawy, baza pytań i odpowiedzi, kontakty
kryzysowe — pochodzą z jednego pliku: [`src/data/tresc-aplikacji.json`](src/data/tresc-aplikacji.json).
Żeby zmienić treść programu (poprawić tekst, dodać zabawę, zmienić pytanie w quizie), **edytuj
wyłącznie ten plik** — kod komponentów nie wymaga zmian, o ile nowa treść trzyma się tych samych
kształtów co istniejące wpisy (te same pola, te same `typ` kart pracy).

Pełny opis dostępnych typów kart pracy i pól formularzy znajduje się w `src/types.ts`.

Jeśli chcesz dodać zupełnie nowy **typ** karty pracy (spoza obsługiwanych 14), trzeba dopisać:

1. typ w `src/types.ts`,
2. komponent renderujący w `src/cards/` (np. w `structuredCards.tsx` lub nowym pliku),
3. gałąź w `renderujTresc()` w `src/cards/CardRenderer.tsx`,
4. sekcję w `podsumujKarte()` w `src/lib/summarize.ts` (żeby karta ładnie wyglądała w „Moich
   wpisach" i w eksporcie PDF).

## Moduł „Co działa"

Osobny ekran (`src/pages/AnalysisPage.tsx`) z dwiema warstwami:

- **Warstwa A** — stały przegląd badań (wykresy SVG bez bibliotek, każdy z przełącznikiem
  „pokaż jako tabelę"). Treść pochodzi z [`src/data/analiza-skutecznosci.json`](src/data/analiza-skutecznosci.json)
  — żeby zaktualizować liczby lub źródła, edytuj wyłącznie ten plik i podbij `meta.aktualizacja`
  (ta data pokazuje się potem w Ustawieniach).
- **Warstwa B** — wykres radarowy porównujący aktywność użytkownika w danym obszarze
  (`src/lib/practiceAnalysis.ts`) z wagą tego obszaru w badaniach. Liczone w 100% lokalnie z
  `wpisyKart` — nic z tego nie opuszcza przeglądarki. Pokazuje zawsze dokładnie jeden, łagodny
  komunikat (nigdy listę „braków"): patrz `wybierzKomunikat()`.

Jeśli dodajesz nowy typ karty pracy, pamiętaj żeby rozszerzyć też `policzAktywnoscKarty()` w
`src/lib/practiceAnalysis.ts` — inaczej aktywność w tej karcie nie będzie liczona do wykresu.

## Czcionki

Interfejs używa czcionek **Carlito** (nagłówki) i **Caladea** (treść) — obie na licencji OFL,
metryczne zamienniki odpowiednio Calibri i Cambria. Pliki `.woff2` są dołączone do repozytorium
w `public/fonts/` (pobrane z oficjalnego Google Fonts) i hostowane lokalnie — żadnych zapytań do
zewnętrznego CDN w czasie działania aplikacji.

Każdy krój ma po dwa pliki na wariant (`-latin` i `-latinext`), bo polskie znaki diakrytyczne
(ą, ć, ę, ł, ń, ó, ś, ź, ż) leżą w innym zakresie unicode niż podstawowy alfabet łaciński —
`src/fonts.css` ładuje odpowiedni plik w zależności od tego, jaki znak akurat się renderuje.

Jeśli kiedyś zechcesz podmienić czcionki na inne, wystarczy podmienić pliki w `public/fonts/` i
dopasować nazwy/zakresy w `src/fonts.css` — reszta aplikacji się nie zmienia.

## Struktura repozytorium

```
src/
  components/    komponenty UI (nawigacja, dialogi, panel pomocy, stopka...)
  cards/         generyczny silnik renderujący 14 typów kart pracy
  charts/        wykresy SVG modułu „Co działa" (bez bibliotek wykresowych)
  lib/           localStorage, eksport/import, wyszukiwarka, assistant.ts, tokeny, detektor słów,
                 practiceAnalysis.ts (liczenie aktywności do wykresu radarowego)
  data/          tresc-aplikacji.json i analiza-skutecznosci.json — JEDYNE źródła treści
  pages/         ekrany aplikacji
  hooks/         hooki reactowe (subskrypcja stanu)
scripts/
  generate-tokens.mjs
public/
  fonts/  icons/  manifest.webmanifest  robots.txt  sw.js  logo.png
```

## Logo

`public/logo.png` to logo Centrum Psychologii i Psychoedukacji NewWay. Jest użyte jako favicon,
ikona PWA (manifest) oraz w nagłówku aplikacji ([Layout.tsx](src/components/Layout.tsx)) i na
ekranie startowym ([StartPage.tsx](src/pages/StartPage.tsx)). Żeby je podmienić, wystarczy
podmienić plik pod tą samą nazwą — reszta aplikacji nic nie musi się zmieniać.

## Teksty prawne

`src/pages/PrivacyPage.tsx` i `src/pages/TermsPage.tsx` zawierają docelową treść Polityki
prywatności i Regulaminu, przygotowaną dla Centrum Psychologii i Psychoedukacji NewWay. Kilka
miejsc jest świadomie oznaczonych jako `[DO UZUPEŁNIENIA]` (m.in. adres e-mail, adres domeny,
nazwa dostawcy hostingu, daty wejścia w życie) — uzupełnij je bezpośrednio w kodzie tych dwóch
plików, gdy te informacje będą znane. **Całość — a w szczególności założenie, że treści
użytkownika nie są przetwarzane przez administratora — powinien przed uruchomieniem programu
zweryfikować prawnik lub inspektor ochrony danych.**
