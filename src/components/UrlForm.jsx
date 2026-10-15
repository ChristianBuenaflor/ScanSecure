import { useState } from 'react';
import { Input } from './ui/input.jsx';
import { Button } from './ui/button.jsx';
import { Label } from './ui/label.jsx';

export default function UrlForm({ onSubmit, loading }) {
  const [value, setValue] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="url">Website URL</Label>
        <Input id="url" placeholder="https://example.com" value={value} onChange={(e) => setValue(e.target.value)} disabled={loading} />
      </div>
      <Button type="submit" disabled={loading || !value.trim()}>{loading ? 'Scanning…' : 'Scan'}</Button>
    </form>
  );
}
