const ORDER = ['critical', 'high', 'medium', 'low', 'info', 'pass'];

export function groupFindings(findings) {
  const groups = {};
  for (const sev of ORDER) groups[sev] = [];
  for (const f of Array.isArray(findings) ? findings : []) {
    const key = ORDER.includes(f?.severity) ? f.severity : 'info';
    groups[key].push(f);
  }
  // remove empty nonstandard? keep all
  return groups;
}

export function severityRank(s) { return ORDER.indexOf(s ?? 'info'); }
export function sortFindings(findings) {
  return [...(findings || [])].sort((a, b) => severityRank(a?.severity) - severityRank(b?.severity));
}
