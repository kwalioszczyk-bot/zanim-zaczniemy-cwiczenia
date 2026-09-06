// Interfejs na przyszłość: w wersji 1 nie ma czatu AI. `askAssistant` przeszukuje lokalną
// bazę pytaniaOdpowiedzi. Kiedy/jeśli podejmie się decyzję o przetwarzaniu treści poza
// urządzeniem użytkownika, wystarczy podmienić implementację tej funkcji — komponenty,
// które z niej korzystają, się nie zmienią.
//
// TODO: wymaga decyzji o przetwarzaniu danych (jeśli w przyszłości ma to wywoływać model językowy).

import trescJson from "../data/tresc-aplikacji.json";
import type { PytanieOdpowiedz, TrescAplikacji } from "../types";
import { search } from "./search";

const dane = trescJson as TrescAplikacji;

export interface Answer {
  znaleziono: boolean;
  wyniki: PytanieOdpowiedz[];
}

export async function askAssistant(question: string): Promise<Answer> {
  const wyniki = search(
    dane.pytaniaOdpowiedzi.map((qa) => ({ item: qa, haystacks: [qa.pytanie, qa.odpowiedz, qa.kategoria] })),
    question
  );
  return { znaleziono: wyniki.length > 0, wyniki };
}
