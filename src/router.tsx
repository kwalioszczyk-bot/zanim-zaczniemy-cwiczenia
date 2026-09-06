import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

function currentHash(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h || "/";
}

function useHash(): string {
  const [hash, setHash] = useState(currentHash());
  useEffect(() => {
    const onChange = () => setHash(currentHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export function navigate(path: string) {
  window.location.hash = path;
}

const RouteContext = createContext<{ path: string; segments: string[] }>({ path: "/", segments: [] });

export function RouterProvider({ children }: { children: ReactNode }) {
  const hash = useHash();
  const path = hash.split("?")[0];
  const segments = path.split("/").filter(Boolean);
  return <RouteContext.Provider value={{ path, segments }}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  return useContext(RouteContext);
}

export function useQueryParam(name: string): string | null {
  const hash = useHash();
  const queryStr = hash.includes("?") ? hash.split("?")[1] : "";
  return new URLSearchParams(queryStr).get(name);
}

export function Link({ to, className, children, ariaLabel }: { to: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
