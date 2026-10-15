import { Button } from './ui/button.jsx';
import { exportJson } from '../lib/export.js';
import { Download, Printer } from 'lucide-react';

export default function ExportBar({ url, findings, score, grade }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => exportJson('scansecure-report.json', { url, score, grade, findings })}>
        <Download className="h-4 w-4" /> Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print / PDF
      </Button>
    </div>
  );
}
