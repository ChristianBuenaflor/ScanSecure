import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { buildSecurityChecks } from '../engine/securitySummary.js';
import { cn } from '../lib/cn.js';

const ICON = {
  pass: { Cmp: CheckCircle2, cls: 'text-emerald-700' },
  warn: { Cmp: AlertTriangle, cls: 'text-amber-600' },
  fail: { Cmp: XCircle, cls: 'text-rose-600' },
  unknown: { Cmp: HelpCircle, cls: 'text-neutral-400' },
};

export default function SecurityChecklist({ findings = [], className }) {
  const rows = buildSecurityChecks(findings);
  return (
    <div className={cn('w-full', className)}>
      <h2 className="text-xl font-bold">Website Malware &amp; Security</h2>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const { Cmp, cls } = ICON[r.status] || ICON.unknown;
          return (
            <li key={r.id} data-check-row={r.id} className="flex items-start gap-2 text-sm">
              <Cmp className={cn('mt-0.5 h-5 w-5 shrink-0', cls)} aria-label={r.status} />
              <span>
                <span className="font-medium">{r.title}</span>{' '}
                <span className="text-muted-foreground">{r.riskLabel}</span>
                {r.detail && <span className="block text-xs text-muted-foreground">{r.detail}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
