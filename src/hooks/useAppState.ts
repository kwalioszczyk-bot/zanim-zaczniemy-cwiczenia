import { useEffect, useState } from "react";
import { getState, subscribe, type AppState } from "../lib/storage";

/** Re-renderuje komponent przy każdej zmianie stanu w localStorage (dowolne miejsce w aplikacji). */
export function useAppState(): AppState {
  const [state, setState] = useState(getState());
  useEffect(() => subscribe(() => setState(getState())), []);
  return state;
}
