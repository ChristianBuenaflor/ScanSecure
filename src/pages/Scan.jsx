import { useState } from 'react';
import { createOrchestrator } from '../engine/orchestrator.js';
import { saveHistory, loadHistory, loadSettings, saveSettings } from '../lib/storage.js';
import { scoreFindings } from '../engine/scoring.js';
import UrlForm from '../components/UrlForm.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import RiskMeter from '../components/RiskMeter.jsx';
import SecurityChecklist from '../components/SecurityChecklist.jsx';
import SiteDetails from '../components/SiteDetails.jsx';
import FindingsList from '../components/FindingsList.jsx';
import ExportBar from '../components/ExportBar.jsx';
import { Progress } from '../components/ui/progress.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { Settings, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../components/ui/dialog.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { buildThreatLinks } from '../engine/malware.js';

export default function Scan() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [vtKey, setVtKey] = useState(() => (loadSettings()?.virusTotalKey) || '');
  const [openSettings, setOpenSettings] = useState(false);

  const run = async (rawUrl) => {
    setLoading(true);
    setError('');
    setResult(null);
    setProgress(0);
    const orch = createOrchestrator();
    try {
      const r = await orch.runScan({
        rawUrl,
        onProgress: (p) => {
          if (p.total) setProgress(Math.round((p.step / p.total) * 100));
          setLabel(p.label || '');
        },
      });
      if (!r.ok) { setError(r.error || 'Invalid URL'); return; }
      setResult(r);
      const entry = { id: crypto.randomUUID(), url: r.url, score: r.score, grade: r.grade, findings: r.findings, meta: r.meta || {}, at: Date.now() };
      const hist = loadHistory();
      saveHistory([entry, ...hist]);
    } catch (e) {
      setError(e?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    saveSettings({ ...(loadSettings() || {}), virusTotalKey: vtKey });
    setOpenSettings(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Scan a website</h1>
        <Dialog open={openSettings} onOpenChange={setOpenSettings}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Settings className="h-4 w-4" /> Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Optional VirusTotal API key (stored locally, never sent except to VirusTotal).</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="vt">VirusTotal API key</Label>
              <Input id="vt" type="password" value={vtKey} onChange={(e) => setVtKey(e.target.value)} placeholder="paste key (optional)" />
            </div>
            <DialogFooter>
              <Button onClick={saveKey}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <UrlForm onSubmit={run} loading={loading} />
          {loading && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          )}
          {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardHeader><CardTitle>Score</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <ScoreRing score={result.score} grade={result.grade} />
              <ExportBar url={result.url} findings={result.findings} score={result.score} grade={result.grade} />
            </CardContent>
          </Card>
          </div>
          <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Security risk</CardTitle></CardHeader>
            <CardContent>
              <RiskMeter score={result.score} />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <SecurityChecklist findings={result.findings} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <SiteDetails findings={result.findings} url={result.url} meta={result.meta || {}} />
            </CardContent>
          </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
            <CardContent>
              <FindingsList findings={result.findings} />
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold">Threat-intel lookups</h3>
                <div className="flex flex-wrap gap-2">
                  {buildThreatLinks(new URL(result.url)).map((l) => (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">{l.label} <ExternalLink className="h-3 w-3" /></Button>
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
