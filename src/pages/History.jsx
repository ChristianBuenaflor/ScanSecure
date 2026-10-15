import { useState } from 'react';
import { loadHistory, saveHistory } from '../lib/storage.js';
import HistoryTable from '../components/HistoryTable.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import RiskMeter from '../components/RiskMeter.jsx';
import SecurityChecklist from '../components/SecurityChecklist.jsx';
import SiteDetails from '../components/SiteDetails.jsx';
import FindingsList from '../components/FindingsList.jsx';
import ExportBar from '../components/ExportBar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';

export default function History() {
  const [items, setItems] = useState(() => loadHistory());
  const [selected, setSelected] = useState(null);

  const del = (id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveHistory(next);
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">History</h1>
      <HistoryTable items={items} onSelect={setSelected} onDelete={del} />

      {selected && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{selected.url}</CardTitle></CardHeader>
            <CardContent>
              <RiskMeter score={selected.score ?? 0} />
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="lg:sticky lg:top-20 self-start">
              <Card>
                <CardHeader><CardTitle>Score</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                  <ScoreRing score={selected.score ?? 0} grade={selected.grade ?? 'F'} />
                  <ExportBar url={selected.url} findings={selected.findings || []} score={selected.score} grade={selected.grade} />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <SecurityChecklist findings={selected.findings || []} />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <SiteDetails findings={selected.findings || []} url={selected.url} meta={selected.meta || {}} />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
                <CardContent>
                  <FindingsList findings={selected.findings || []} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
