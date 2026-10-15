import { useEffect, useState } from 'react';
import { cn } from '../lib/cn.js';

export function nextIndex(i, n) {
  if (!n || n <= 1) return 0;
  return (i + 1) % n;
}

function prefersReducedMotion() {
  try { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

const TYPE_MS = 35;
const DELETE_MS = 18;
const HOLD_MS = 1400;

export default function TypingText({ values = [], className, cycleMs = 3000, caret = true }) {
  const list = Array.isArray(values) && values.length ? values : [''];
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(list[0]);
  const [deleting, setDeleting] = useState(false);
  const reduced = prefersReducedMotion();
  const text = reduced ? list[0] : shown;

  useEffect(() => {
    if (reduced) return;
    const full = list[idx];
    let timer;
    if (!deleting) {
      if (shown.length < full.length) {
        timer = setTimeout(() => setShown(full.slice(0, shown.length + 1)), TYPE_MS);
      } else {
        timer = setTimeout(() => {
          if (list.length === 1) return;
          setDeleting(true);
        }, Math.min(HOLD_MS, Math.max(600, cycleMs - (full.length * TYPE_MS))));
      }
    } else {
      if (shown.length > 0) {
        timer = setTimeout(() => setShown(full.slice(0, shown.length - 1)), DELETE_MS);
      } else {
        setDeleting(false);
        setIdx((i) => nextIndex(i, list.length));
      }
    }
    return () => clearTimeout(timer);
  }, [shown, deleting, idx, list, reduced, cycleMs]);

  return (
    <span className={cn('inline-block', className)} aria-live="polite" aria-label={list.join(', ')}>
      <span>{text}</span>
      {caret && !reduced && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current" aria-hidden="true" />
      )}
    </span>
  );
}
