import { cn } from '../lib/cn.js';

const LEVELS = [
  { label: 'Minimal', min: 90, color: 'bg-emerald-600', text: 'text-emerald-700', verdict: 'Looks good — no major issues found.' },
  { label: 'Low Security Risk', min: 80, color: 'bg-teal-600', text: 'text-teal-700', verdict: 'Looks OK — minor issues only.' },
  { label: 'Medium', min: 70, color: 'bg-amber-500', text: 'text-amber-700', verdict: 'Use caution — review findings below.' },
  { label: 'High', min: 60, color: 'bg-orange-500', text: 'text-orange-700', verdict: 'Risky — fix issues before trusting this site.' },
  { label: 'Critical', min: -Infinity, color: 'bg-rose-600', text: 'text-rose-700', verdict: 'Avoid — critical issues found.' },
];

export function getRiskLevel(score = 0) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const index = s >= 90 ? 0 : s >= 80 ? 1 : s >= 70 ? 2 : s >= 60 ? 3 : 4;
  const risk = 100 - s;
  return { ...LEVELS[index], index, score: s, risk };
}

export default function RiskMeter({ score = 0, className }) {
  const level = getRiskLevel(score);
  const risk = level.risk;

  return (
    <div className={cn('w-full', className)} role="img" aria-label={`Security risk: ${level.label} (score ${level.score} out of 100)`}>
      <div className="relative pt-4">
        {/* track */}
        <div className="h-3 w-full overflow-visible rounded-full bg-neutral-200 dark:bg-neutral-800">
          {/* fill */}
          <div
            className={cn('h-full rounded-full transition-all', level.color)}
            style={{ width: `${risk}%` }}
          />
        </div>
        {/* marker */}
        <div
          className="absolute top-0 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[12px] border-x-transparent border-t-neutral-700"
          style={{ left: `${risk}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        {LEVELS.map((l, i) => (
          <span key={l.label} className={cn(i === level.index && cn('font-semibold', l.text))}>
            {l.label}
          </span>
        ))}
      </div>
      <p className={cn('mt-2 text-sm font-medium', level.text)}>
        {level.label} — {level.verdict}
      </p>
    </div>
  );
}
