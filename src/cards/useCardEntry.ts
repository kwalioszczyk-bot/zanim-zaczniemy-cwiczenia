import { useRef, useState } from "react";
import { getCardEntry, setCardEntry } from "../lib/storage";
import { useSavedFlashFromContext } from "./SavedContext";

/**
 * Autozapis: zapis do localStorage jest bezpośrednim skutkiem wywołania setValue (czyli
 * realnej zmiany wprowadzonej przez użytkownika) — nigdy efektem montowania komponentu.
 * To ważne pod React 18 StrictMode, które w trybie deweloperskim podwójnie odpala efekty:
 * wariant oparty na useEffect + "czy to pierwszy render" łatwo zapisuje wtedy pustą,
 * domyślną wartość karty, mimo że nikt niczego nie wpisał.
 */
export function useCardEntry<T>(cardId: string, initial: T) {
  const [value, setValueState] = useState<T>(() => getCardEntry<T>(cardId) ?? initial);
  const flash = useSavedFlashFromContext();
  const valueRef = useRef(value);
  valueRef.current = value;

  const setValue = (updater: T | ((prev: T) => T)) => {
    const next = typeof updater === "function" ? (updater as (prev: T) => T)(valueRef.current) : updater;
    valueRef.current = next;
    setValueState(next);
    setCardEntry(cardId, next);
    flash?.();
  };

  return { value, setValue };
}
