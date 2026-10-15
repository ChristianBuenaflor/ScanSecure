import { cn } from '../lib/cn.js';

export default function ScoreRing({ score = 0, grade = 'F', size = 120 }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;
  const color = score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : score >= 50 ? 'text-orange-500' : 'text-rose-500';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="stroke-muted" strokeWidth="10" fill="none" />
        <circle cx="60" cy="60" r={r} className={cn('stroke-current transition-all', color)} strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
        <text x="60" y="56" textAnchor="middle" className="fill-foreground text-2xl font-bold">{score}</text>
        <text x="60" y="76" textAnchor="middle" className="fill-muted-foreground text-xs">{grade}</text>
      </svg>
    </div>
  );
}
