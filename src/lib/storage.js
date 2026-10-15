const KEY = 'sc_history';
const SETTINGS_KEY = 'sc_settings';
const THEME_KEY = 'sc_theme';

export function safeJsonParse(str, fallback = null) {
  try { return JSON.parse(str); } catch { return fallback; }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? safeJsonParse(raw, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  const capped = (Array.isArray(items) ? items : []).slice(0, 50);
  try { localStorage.setItem(KEY, JSON.stringify(capped)); } catch { /* ignore quota */ }
  return capped;
}

export function loadSettings() {
  try {
    const parsed = safeJsonParse(localStorage.getItem(SETTINGS_KEY), { virusTotalKey: '' });
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : { virusTotalKey: '' };
  } catch {
    return { virusTotalKey: '' };
  }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s ?? {})); } catch { /* ignore */ }
}

export function clearHistory() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
