import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Trash2 } from 'lucide-react';

export default function HistoryTable({ items = [], onSelect, onDelete }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No history yet.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">URL</th>
            <th className="p-2 text-left">Score</th>
            <th className="p-2 text-left">When</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-2 max-w-[260px] truncate">{it.url}</td>
              <td className="p-2"><Badge>{it.score ?? '—'}</Badge></td>
              <td className="p-2 text-muted-foreground">{it.at ? new Date(it.at).toLocaleString() : ''}</td>
              <td className="p-2 text-right flex gap-2 justify-end">
                {onSelect && <Button size="sm" variant="ghost" onClick={() => onSelect(it)}>View</Button>}
                {onDelete && <Button size="sm" variant="ghost" onClick={() => onDelete(it.id)}><Trash2 className="h-4 w-4" /></Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
