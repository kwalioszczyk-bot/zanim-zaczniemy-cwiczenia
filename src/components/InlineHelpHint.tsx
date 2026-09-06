import { zawieraSlowaAlarmowe } from "../lib/keywordDetector";

/** Delikatna podpowiedź pod polem tekstowym — nigdy nie blokuje, nigdy nic nie wysyła. */
export function InlineHelpHint({ text }: { text: string }) {
  if (!zawieraSlowaAlarmowe(text)) return null;
  return (
    <p className="mt-2 text-sm text-ink/70">
      To, co piszesz, brzmi poważnie.{" "}
      <a href="#/pomoc" className="underline font-medium text-ink">
        Tu znajdziesz, do kogo można zadzwonić
      </a>
      .
    </p>
  );
}
