import { useEffect, useRef, useState } from "react";

export function useSavedFlash() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const flash = () => {
    setVisible(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setVisible(false), 1600);
  };

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return { visible, flash };
}

export function SavedIndicator({ visible }: { visible: boolean }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`text-sm text-ink/60 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      zapisano
    </span>
  );
}
