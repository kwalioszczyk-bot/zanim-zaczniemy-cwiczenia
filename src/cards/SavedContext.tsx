import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSavedFlash } from "../components/SavedIndicator";

const SavedContext = createContext<{ flash: () => void } | null>(null);

export function SavedProvider({ children, onVisibleChange }: { children: ReactNode; onVisibleChange: (v: boolean) => void }) {
  const { visible, flash } = useSavedFlash();
  useEffect(() => onVisibleChange(visible), [visible, onVisibleChange]);
  return <SavedContext.Provider value={{ flash }}>{children}</SavedContext.Provider>;
}

export function useSavedFlashFromContext(): (() => void) | null {
  const ctx = useContext(SavedContext);
  return ctx?.flash ?? null;
}
