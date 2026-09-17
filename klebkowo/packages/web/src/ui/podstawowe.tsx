/** Wspólne elementy interfejsu w stylu „Flipchart trenerki”. */
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Doodle, type NazwaDoodla } from './Doodle.tsx';

export function Karteczka({
  children,
  tytul,
  etykieta,
  wariant = '',
  doodle,
  tasma = false,
  ksztalt = 1,
  id,
}: {
  children: ReactNode;
  tytul?: ReactNode;
  etykieta?: ReactNode;
  wariant?: '' | 'blekit' | 'bez' | 'zielen' | 'brzoskwinia' | 'cicho';
  doodle?: NazwaDoodla;
  tasma?: boolean;
  ksztalt?: 1 | 2 | 3;
  id?: string;
}) {
  const klasy = ['karteczka'];
  if (ksztalt !== 1) klasy.push(`karteczka--${ksztalt}`);
  if (wariant) klasy.push(`karteczka--${wariant}`);
  if (tasma) klasy.push('karteczka--tasma');
  return (
    <section className={klasy.join(' ')} id={id}>
      {tytul !== undefined && (
        <h2 className="karteczka__naglowek">
          {doodle && <Doodle nazwa={doodle} rozmiar={34} />}
          <span>{tytul}</span>
          {etykieta && <span className="karteczka__etykieta">{etykieta}</span>}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Chmurka({ children, wariant = '' }: { children: ReactNode; wariant?: '' | 'zielen' | 'blekit' }) {
  return <div className={`chmurka${wariant ? ` chmurka--${wariant}` : ''}`}>{children}</div>;
}

type PrzyciskProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  wariant?: 'glowny' | 'drugi' | 'spokojny' | '';
  rozmiar?: 'maly' | 'duzy' | '';
  szeroki?: boolean;
  doodle?: NazwaDoodla;
};

export const Przycisk = forwardRef<HTMLButtonElement, PrzyciskProps>(function Przycisk(
  { wariant = '', rozmiar = '', szeroki, doodle, children, ...reszta },
  ref,
) {
  const klasy = ['przycisk'];
  if (wariant) klasy.push(`przycisk--${wariant}`);
  if (rozmiar) klasy.push(`przycisk--${rozmiar}`);
  if (szeroki) klasy.push('przycisk--szeroki');
  return (
    <button type="button" ref={ref} className={klasy.join(' ')} {...reszta}>
      {doodle && <Doodle nazwa={doodle} rozmiar={24} />}
      {children}
    </button>
  );
});

export function Komunikat({
  children,
  wariant = '',
  doodle,
  rola = 'status',
}: {
  children: ReactNode;
  wariant?: '' | 'uwaga' | 'cicho' | 'blad';
  doodle?: NazwaDoodla;
  rola?: 'status' | 'alert' | 'none';
}) {
  return (
    <div
      className={`komunikat${wariant ? ` komunikat--${wariant}` : ''}`}
      {...(rola === 'none' ? {} : { role: rola })}
    >
      {doodle && <Doodle nazwa={doodle} rozmiar={28} />}
      <div>{children}</div>
    </div>
  );
}

export function Separator() {
  return <hr className="separator" />;
}

export function EtykietaStolika({ id }: { id: string }) {
  return (
    <span className="etykieta-stolika" aria-hidden="true">
      {id}
    </span>
  );
}

/** Lista kroków fazy — pokazuje, gdzie zespół jest w tej chwili. */
export function Kroki({
  kroki,
  ukonczone,
  biezacy,
}: {
  kroki: { id: string; etykieta: string }[];
  ukonczone: string[];
  biezacy: string | null;
}) {
  return (
    <ol className="kroki">
      {kroki.map((k) => {
        const zrobiony = ukonczone.includes(k.id);
        const teraz = k.id === biezacy;
        return (
          <li
            key={k.id}
            className={`kroki__krok${zrobiony ? ' kroki__krok--zrobiony' : ''}${teraz ? ' kroki__krok--teraz' : ''}`}
          >
            {zrobiony && <span aria-hidden="true">✓</span>}
            <span>{k.etykieta}</span>
            {teraz && <span className="tylko-dla-czytnika">— krok bieżący</span>}
            {zrobiony && <span className="tylko-dla-czytnika">— zrobione</span>}
          </li>
        );
      })}
    </ol>
  );
}
