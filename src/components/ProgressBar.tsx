export function ProgressBar({ procent, label }: { procent: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-ink/70">
          <span>{label}</span>
          <span>{procent}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-line/60" role="progressbar" aria-valuenow={procent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${procent}%` }} />
      </div>
    </div>
  );
}
