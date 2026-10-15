self.addEventListener('message', (e) => {
  const { html = '', baseUrl = '' } = e.data || {};
  const findings = [];
  // mixed content: http resources in https page
  if (baseUrl.startsWith('https://')) {
    const httpRefs = (html.match(/src=["']http:\/\//gi) || []).length + (html.match(/href=["']http:\/\//gi) || []).length;
    if (httpRefs > 0) findings.push({ id: 'mixed-content', title: 'Mixed content (HTTP resources on HTTPS page)', severity: 'high', detail: `${httpRefs} insecure reference(s).`, category: 'content' });
  }
  // password forms
  const forms = (html.match(/<form[\s\S]*?<\/form>/gi) || []);
  for (const f of forms) {
    if (/type=["']password["']/i.test(f) && !/https:/i.test(f)) {
      findings.push({ id: 'insecure-form', title: 'Password form not on HTTPS', severity: 'critical', detail: 'A password input was found without HTTPS action.', category: 'content' });
      break;
    }
  }
  // eval / inline dangerous
  if (/\beval\s*\(/i.test(html)) findings.push({ id: 'eval-usage', title: 'Use of eval() detected', severity: 'medium', detail: 'eval can enable code injection.', category: 'content' });
  if (/document\.write/i.test(html)) findings.push({ id: 'doc-write', title: 'document.write usage', severity: 'low', detail: 'Legacy pattern; may indicate injection risk.', category: 'content' });
  // trackers / third-party
  const trackers = ['google-analytics.com', 'facebook.net', 'doubleclick.net', 'googletagmanager.com', 'hotjar.com'];
  const foundTrackers = trackers.filter((t) => html.includes(t));
  if (foundTrackers.length) findings.push({ id: 'trackers', title: 'Third-party trackers detected', severity: 'low', detail: foundTrackers.join(', '), category: 'content' });
  // iframes
  const iframeCount = (html.match(/<iframe/gi) || []).length;
  if (iframeCount > 3) findings.push({ id: 'iframes', title: 'Many iframes embedded', severity: 'low', detail: `${iframeCount} iframes.`, category: 'content' });
  // external scripts
  const extScripts = (html.match(/<script[^>]+src=/gi) || []).length;
  if (extScripts > 10) findings.push({ id: 'many-scripts', title: 'Many external scripts', severity: 'low', detail: `${extScripts} script tags.`, category: 'content' });
  if (findings.length === 0) findings.push({ id: 'content-ok', title: 'No obvious content issues', severity: 'pass', detail: 'Heuristic content scan passed.', category: 'content' });
  self.postMessage({ findings });
});
