import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun, Shield } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { cn } from '../../lib/cn.js';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [dark, setDark] = useState(() => (localStorage.getItem('sc_theme') ?? 'dark') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sc_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const nav = (to, label) => (
    <NavLink to={to} className={({ isActive }) => cn('text-sm transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="w-full flex h-16 items-center justify-between px-6 py-2 sm:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Shield className="h-5 w-5 text-primary" /> ScanSecure
        </Link>
        <nav className="flex items-center gap-4">
          {nav('/', 'Home')}
          {nav('/scan', 'Scan')}
          {nav('/history', 'History')}
          {nav('/about', 'About')}
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
