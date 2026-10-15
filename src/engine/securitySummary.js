function hasId(findings, ...ids) {
  return findings.some((f) => ids.includes(f?.id));
}

function hasSev(findings, sevs, pred = () => true) {
  const s = new Set(Array.isArray(sevs) ? sevs : [sevs]);
  return findings.some((f) => s.has(f?.severity) && pred(f));
}

function inCategory(findings, category) {
  return findings.filter((f) => f?.category === category);
}

export function buildSecurityChecks(findings = []) {
  const list = Array.isArray(findings) ? findings : [];

  // 1. Malware — from malware category
  const mw = inCategory(list, 'malware');
  const mwBad = mw.filter((f) => ['critical', 'high'].includes(f?.severity));
  const mwWarn = mw.filter((f) => ['medium', 'low'].includes(f?.severity));
  const mwPass = mw.some((f) => f?.severity === 'pass');
  let malware;
  if (mwBad.length > 0) {
    malware = { id: 'malware', title: 'Malware detected by scan', status: 'fail', riskLabel: '(High Risk)', detail: mwBad[0]?.title || 'Malware indicator found.' };
  } else if (mwWarn.length > 0) {
    malware = { id: 'malware', title: 'Possible malware indicators', status: 'warn', riskLabel: '(Medium Risk)', detail: mwWarn[0]?.title || 'Suspicious URL pattern.' };
  } else if (mwPass) {
    malware = { id: 'malware', title: 'No malware detected by scan', status: 'pass', riskLabel: '(Low Risk)', detail: 'Heuristics + feeds show no match.' };
  } else if (list.length === 0) {
    malware = { id: 'malware', title: 'Malware check not run', status: 'unknown', riskLabel: '(Unknown)', detail: 'No malware findings available.' };
  } else {
    malware = { id: 'malware', title: 'No malware detected by scan', status: 'pass', riskLabel: '(Low Risk)', detail: 'No high-severity malware findings.' };
  }

  // Content availability
  const noHtml = hasId(list, 'content-nohtml', 'content-timeout', 'content-error', 'worker-unavailable', 'perf-unavailable');
  const contentOk = hasId(list, 'content-ok');
  const contentAnomalies = list.filter((f) => ['eval-usage', 'iframes', 'many-scripts', 'doc-write'].includes(f?.id));

  // 2. Injected spam — proxy via suspicious content anomalies
  let spam;
  if (noHtml && !contentOk && contentAnomalies.length === 0) {
    spam = { id: 'spam', title: 'Injected spam check inconclusive', status: 'unknown', riskLabel: '(Unknown)', detail: 'Content fetch blocked, could not verify.' };
  } else if (contentAnomalies.length >= 2 || hasSev(list, ['critical', 'high'], (f) => f?.category === 'content')) {
    spam = { id: 'spam', title: 'Possible injected spam detected', status: 'fail', riskLabel: '(High Risk)', detail: contentAnomalies.map((f) => f.title).join('; ') || 'Suspicious content pattern.' };
  } else if (contentAnomalies.length === 1) {
    spam = { id: 'spam', title: 'Minor content anomaly (possible spam vector)', status: 'warn', riskLabel: '(Medium Risk)', detail: contentAnomalies[0].title };
  } else {
    spam = { id: 'spam', title: 'No injected spam detected', status: 'pass', riskLabel: '(Low Risk)', detail: contentOk ? 'Content heuristics passed.' : 'No spam indicators.' };
  }

  // 3. Defacement — same content signals + keyword check if a finding mentions it
  const defaceKeyword = list.some((f) => /deface|hacked by|h4ck/i.test(`${f?.title || ''} ${f?.detail || ''}`));
  let defacement;
  if (defaceKeyword) {
    defacement = { id: 'defacement', title: 'Possible defacement detected', status: 'fail', riskLabel: '(High Risk)', detail: 'Defacement keyword found.' };
  } else if (noHtml && !contentOk) {
    defacement = { id: 'defacement', title: 'Defacement check inconclusive', status: 'unknown', riskLabel: '(Unknown)', detail: 'Content fetch blocked, could not verify.' };
  } else if (contentAnomalies.length >= 2) {
    defacement = { id: 'defacement', title: 'Unusual content structure (review)', status: 'warn', riskLabel: '(Medium Risk)', detail: 'Multiple content anomalies.' };
  } else {
    defacement = { id: 'defacement', title: 'No defacements detected', status: 'pass', riskLabel: '(Low Risk)', detail: 'No defacement indicators.' };
  }

  // 4. Internal server errors — we can only say no error seen on fetch, else unknown
  let serverErrors;
  const serverErrEvidence = list.some((f) => /500|502|503|internal server error/i.test(`${f?.title || ''} ${f?.detail || ''}`));
  if (serverErrEvidence) {
    serverErrors = { id: 'server-errors', title: 'Internal server errors detected', status: 'fail', riskLabel: '(High Risk)', detail: 'Server-error signal in findings.' };
  } else if (noHtml) {
    serverErrors = { id: 'server-errors', title: 'Server-error check inconclusive', status: 'unknown', riskLabel: '(Unknown)', detail: 'Fetch blocked or timed out — could not confirm 5xx.' };
  } else {
    serverErrors = { id: 'server-errors', title: 'No internal server errors detected', status: 'pass', riskLabel: '(Low Risk)', detail: 'Pages fetched without 5xx.' };
  }

  // 5. CMS / up-to-date — honest: we only detect presence, not patch level
  const wpJson = list.find((f) => f?.id === 'path-/wp-json');
  const powered = list.find((f) => f?.id === 'powered-by');
  const serverHdr = list.find((f) => f?.id === 'server-header');
  let cms;
  if (wpJson) {
    cms = { id: 'cms', title: 'WordPress detected — version not verified', status: 'unknown', riskLabel: '(Unknown)', detail: 'REST API reachable (/wp-json). Patch level not checked.' };
  } else if (powered || serverHdr) {
    cms = { id: 'cms', title: 'Server tech disclosed — patch status unknown', status: 'unknown', riskLabel: '(Unknown)', detail: powered?.detail || serverHdr?.detail || 'Version not verified.' };
  } else {
    cms = { id: 'cms', title: 'CMS version not fingerprinted', status: 'unknown', riskLabel: '(Unknown)', detail: 'No generator / wp-json evidence collected.' };
  }

  return [malware, spam, defacement, serverErrors, cms];
}
