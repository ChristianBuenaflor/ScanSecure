const DEDUCT = { critical: 25, high: 15, medium: 7, low: 2, info: 0 };

export function gradeFor(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function scoreFindings(findings) {
  const list = Array.isArray(findings) ? findings : [];
  let score = 100;
  for (const f of list) score -= DEDUCT[f?.severity] ?? 0;
  score = Math.max(0, Math.min(100, score));
  return { score, grade: gradeFor(score) };
}

export function scoringSummary(findings) {
  const { score, grade } = scoreFindings(findings);
  return { score, grade, count: Array.isArray(findings) ? findings.length : 0 };
}
