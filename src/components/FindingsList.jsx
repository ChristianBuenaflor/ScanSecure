import { useState } from 'react';
import { groupFindings } from '../engine/severity.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.jsx';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion.jsx';
import { Badge } from './ui/badge.jsx';

export { groupFindings };

const TONE = { critical: 'destructive', high: 'destructive', medium: 'secondary', low: 'outline', info: 'secondary', pass: 'outline' };

function tone(sev) { return TONE[sev] || 'outline'; }

function FindingRow({ f }) {
  return (
    <AccordionItem value={f.id + Math.random().toString(36).slice(2)}>
      <AccordionTrigger className="text-sm">
        <span className="flex items-center gap-2">{f.title}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1 text-sm">
          <div><span className="text-muted-foreground">Severity:</span> <Badge variant={tone(f.severity)}>{f.severity}</Badge></div>
          {f.category && <div><span className="text-muted-foreground">Category:</span> {f.category}</div>}
          {f.detail && <div className="text-muted-foreground">{f.detail}</div>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FindingsList({ findings = [] }) {
  const groups = groupFindings(findings);
  const keys = Object.keys(groups).filter((k) => groups[k].length);
  const [active, setActive] = useState('all');

  const list = active === 'all' ? findings : (groups[active] || []);

  return (
    <div className="space-y-3">
      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          <TabsTrigger value="all">All <span className="ml-1 opacity-70">{findings.length}</span></TabsTrigger>
          {keys.map((k) => (
            <TabsTrigger key={k} value={k}>{k}<span className="ml-1 opacity-70">{groups[k].length}</span></TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={active}>
          {list.length === 0 && <p className="text-sm text-muted-foreground py-2">No findings.</p>}
          {list.length > 0 && (
            <Accordion type="multiple" className="w-full">
              {list.map((f, i) => <FindingRow key={f.id + i} f={f} />)}
            </Accordion>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
