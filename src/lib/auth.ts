import tokensFile from "../tokens.json";
import { setAuthOk, isAuthOk, clearAuth } from "./storage";

const tokensData = tokensFile as { wersja: number; waznoscMiesiecy: number; hashe: string[] };

function normalizeToken(input: string): string {
  return input.trim().toUpperCase();
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyToken(input: string): Promise<boolean> {
  if (!input.trim()) return false;
  const hash = await sha256Hex(normalizeToken(input));
  const valid = tokensData.hashe.includes(hash);
  if (valid) {
    const until = new Date();
    until.setMonth(until.getMonth() + (tokensData.waznoscMiesiecy || 9));
    setAuthOk(until);
  }
  return valid;
}

export function isSessionValid(): boolean {
  return isAuthOk();
}

export function signOut(): void {
  clearAuth();
}
