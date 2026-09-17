# Decyzje projektowe

Zapis rozstrzygnięć podjętych przy budowie gry — zwłaszcza tam, gdzie prompt zostawiał
miejsce na interpretację. Na końcu lista miejsc oznaczonych `TODO: do akceptacji prowadzącej`.

---

## 1. Gdzie mieszka gra

Repozytorium zawierało już inną aplikację (ćwiczenia „Zanim zaczniemy”). Kłębkowo dostało
własny, samodzielny katalog `klebkowo/` z własnym `package.json`, żeby nie ruszać istniejącego
projektu. Oba żyją obok siebie i nic ich nie łączy.

## 2. Mechanizm ukryty a paczka urządzenia stolika

Kryterium akceptacji nr 3 mówi, że stolik nie może ustalić trafności swojej decyzji
„ani z interfejsu, ani z odpowiedzi API”. Samo pilnowanie odpowiedzi API to za mało: gdyby
plik `gra.json` trafił do paczki JavaScriptu wysyłanej na telefon stolika, wystarczyłoby
otworzyć źródło strony.

Dlatego aplikacja jest budowana jako **dwie osobne paczki**:

- `stolik.html` — dla urządzeń stolików. Nie zawiera pełnej treści gry. Treść dostaje
  z serwera, już przyciętą (`trescDlaStolika`): bez `opcja_zgodna_z_pelna_wiedza`,
  bez `skutki_opcji`, bez ukrytych liczników, bez reguł Kroniki (jedna z nich odwołuje się
  do ukrytego ryzyka), bez treści pozostałych stolików.
- `index.html` — dla prowadzącej: ekran sali, omówienie, druk, tryb projektora. Pełna treść
  gry ładuje się tu dopiero na żądanie, jako osobna paczka, i tylko w trybie projektora
  i w materiałach do druku.

Pilnują tego trzy testy: `packages/engine/test/projekcja.test.ts`,
`packages/server/test/serwer.test.ts` oraz `e2e/szczelnosc.spec.ts` (ten ostatni przechodzi
cały graf modułów paczki stolika i szuka zakazanych wzorców).

## 3. Kiedy działa ochrona z akcji A2–A5

Sekcja 4.3 promptu mówi „w tej samej lub dowolnej kolejnej rundzie”, a sekcja 4.4 —
„ochrona liczy się, jeśli akcja została wybrana we wcześniejszej rundzie; w rundzie 1 ochrona
nie jest jeszcze możliwa — to zamierzone”.

Rozstrzygnięcie: **ochrona działa od rundy następnej po tej, w której wybrano akcję.**
Wynika to wprost z kolejności rozstrzygania (zdarzenia przed akcjami) i z jawnie zapisanej
intencji dla rundy 1. Zapisane w `ochronaAktywna()` i przetestowane.

## 4. Akcja A9 i wymóg A2

Prompt: „A9 wymaga wcześniejszego wybrania A2 (w dowolnej rundzie)”.

Rozstrzygnięcie: **A2 wybrane w tej samej rundzie też spełnia wymóg.** Akcje jednej rundy
rozliczamy w kolejności z talii, więc A2 zawsze zostaje rozliczone przed A9. Uzasadnienie:
mapa ról i delegowanie zadań to naturalna para działań w jednym planie, a blokowanie ich
w jednej rundzie byłoby dla zespołu niezrozumiałe. Różni się to od ochron (punkt 3), bo tam
o kolejności decyduje moment rozstrzygania zdarzeń, a nie kolejność w talii.

## 5. Łagodzenie zwrotu akcji przez A5

`lagodzi_zwrot_akcji: 1` jest **nienakładalne**. Gdyby zespół wybrał A5 w dwóch rundach,
łagodzenie nadal wynosi 1 (bierzemy maksimum, nie sumę). Łagodzenie dotyczy wyłącznie skutku
decyzji z rundy 3 i tylko składników ujemnych.

## 6. Krok „Poczta dzielnicowa”

Skutek niezgodnej decyzji przychodzi w kolejnej fazie — to sedno gry. Brak skutku jest więc
sam w sobie informacją. Nie da się tego usunąć bez zmiany reguł, a treści z `gra.json`
nie wolno zmieniać.

Rozstrzygnięcie: krok nazywa się neutralnie („Poczta dzielnicowa”), występuje u wszystkich
stolików tak samo, a gdy nic nie przychodzi, pokazuje spokojne zdanie „Dziś bez pilnych
wiadomości”. Moment podejmowania decyzji jest natomiast nie do odróżnienia: ten sam
komunikat, te same liczniki, ta sama struktura odpowiedzi API, ten sam czas odpowiedzi.
Tak samo działa procedura papierowa. Doświadczenie „koszt przyszedł później” jest zamierzone;
**wyjaśnienie** tego kosztu pada dopiero w dniu 2.

## 7. Losowanie ról

Aplikacja pyta o obszar pracy pięciu osób, dobiera permutację ról bez kolizji (sprawdza
wszystkie 120 możliwości w kolejności zależnej od ziarna sesji) i **natychmiast zapomina
obszary**. W stanie sesji zostaje wyłącznie „Osoba 1 → R3”.

Gdy kolizji nie da się uniknąć (np. wszystkie pięć osób z tego samego obszaru), aplikacja
minimalizuje ich liczbę, wskazuje numery osób i prosi o ręczną zamianę kart. Zespół nie
zostaje zablokowany.

## 8. Kostka przy zobowiązaniach

Zespół może wpisać wynik fizycznej kostki albo zostawić pole puste — wtedy gra losuje sama.
Losowanie jest deterministyczne: zależy od ziarna sesji i identyfikatora zobowiązania,
a nie od kolejności wywołań. Dzięki temu odtworzenie sesji z migawki daje ten sam wynik,
a testy są powtarzalne.

## 9. Idempotencja

Każda operacja stolika ma identyfikator złożony ze stolika, fazy i kroku (np.
`A:R2:zdarzenie:E3`). Serwer zapamiętuje wynik pod tym identyfikatorem i przy powtórzeniu
zwraca go bez ponownego nakładania efektów. Dodatkowo zdarzenia, decyzje i skutki mają własne
zabezpieczenia w silniku — zdarzenie już rozstrzygnięte w danej rundzie nie zadziała drugi
raz nawet przy innym identyfikatorze operacji.

## 10. Czcionki

Prompt wymaga krojów „Caveat Brush”, „Patrick Hand” i „Caveat” dołączonych lokalnie
(licencja OFL). Pliki pochodzą z paczek `@fontsource` i leżą w `packages/web/public/fonts/`,
licencje w `docs/OFL-*.txt`. Każdy krój ma **oba podzbiory** — `latin` i `latin-ext` —
bo bez `latin-ext` zniknęłyby polskie znaki, a bez `latin` przeglądarka po cichu podmienia
krój na zastępczy.

Do dłuższych tekstów użyty jest **Carlito** (humanistyczny, OFL, też lokalnie) — zgodnie
z wytyczną „czytelność ponad dekorację”. Kroje odręczne zostały w tytułach, nagłówkach kart
i przyciskach.

## 11. Kody QR

Generowane lokalnie na serwerze paczką `qrcode`, jako SVG. Żadnej usługi zewnętrznej,
zgodnie z sekcją 16 promptu. Polityka CSP (`default-src 'self'`) nie dopuszcza w ogóle
zapytań poza własny serwer.

## 12. Liczba arkuszy do druku

Prompt wymienia 13 pozycji, z czego dwie są „na stolik” (plansze i karty informacji).
Po rozwinięciu daje to **19 plików PDF**. Zawartość odpowiada tabeli z sekcji 8.

## 13. Kroki rundy w aplikacji

W rundzie 3 prompt łączy „zwrot akcji i karty informacji” w jeden krok. Aplikacja rozdziela
je na dwa ekrany — zwrot akcji jest mocnym momentem i zasługuje na osobną kartę. Kolejność
i treść pozostają zgodne z `struktura_rundy`.

## 14. Zegar

Zegar odlicza czas przewidziany dla fazy i po jego przekroczeniu pokazuje wartość ujemną,
ale **niczego nie blokuje**. Grą steruje prowadząca, nie stoper.

---

## TODO: do akceptacji prowadzącej

Wszystkie teksty fabularne pochodzą dosłownie z `content/gra.json`. Poniżej teksty
interfejsu i materiałów, które trzeba było napisać, bo nie ma ich w pliku źródłowym.
Nie wprowadzają nowych postaci ani nowych faktów o Kłębkowie, ale warto je przeczytać:

1. **`TODO: do akceptacji prowadzącej`** — wskazówki przy krokach rundy w widoku stolika
   (`packages/web/src/stolik/kroki` → `KROKI_FAZY`), np. „Wybierzcie jedną opcję. Decyzję
   podejmuje cały zespół.”
2. **`TODO: do akceptacji prowadzącej`** — ekran oczekiwania po zatwierdzeniu rundy:
   „Poczekajcie na pozostałe zespoły — kot Kierownik też czeka.” Kot Kierownik występuje
   w `gra.json` (zdarzenie E12), ale to zdanie jest dopisane.
3. **`TODO: do akceptacji prowadzącej`** — tekst kroku „Poczta dzielnicowa”:
   „Dziś bez pilnych wiadomości. Praca toczy się dalej.” (patrz punkt 6 powyżej).
4. **`TODO: do akceptacji prowadzącej`** — instrukcja wyjścia z ról: „Powiedzcie po kolei:
   «Nie jestem już…» i podajcie nazwę swojej roli.” `gra.json` przewiduje krok „Wyjście
   z ról”, ale nie podaje jego treści.
5. **`TODO: do akceptacji prowadzącej`** — procedura papierowa w `00_instrukcja_prowadzacej.pdf`
   (sekcja „Jak rozstrzygać rundę na papierze”) oraz opis przygotowania sali. Prompt wymaga
   tych treści, ale nie ma ich w pliku źródłowym.
6. **`TODO: do akceptacji prowadzącej`** — teksty pomocnicze na planszy stolika: nagłówki pól
   („Karta zdarzenia”, „Wspólna wiedza zespołu”) i podpisy przy torach liczników.

Żaden z tych tekstów nie żartuje z mieszkańców placówki ani z żadnej grupy. Humor został tam,
gdzie umieściła go autorka gry — w treściach z `gra.json`.
