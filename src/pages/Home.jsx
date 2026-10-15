import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Lock, Globe, Terminal, Fingerprint, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import HistoryTable from '../components/HistoryTable.jsx';
import TypingText from '../components/TypingText.jsx';
import FooterVisual from '../components/FooterVisual.jsx';
import { loadHistory } from '../lib/storage.js';
import { cn } from '../lib/cn.js';

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, className, delay = 0, direction = 'up' }) {
  const [ref, visible] = useReveal();
  const transform = visible
    ? 'none'
    : direction === 'up' ? 'translateY(24px)'
      : direction === 'left' ? 'translateX(-24px)'
      : 'translateX(24px)';
  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform,
        transition: `opacity 700ms ease ${delay}ms, transform 700ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: Shield, title: 'Security headers', desc: 'HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer & Permissions Policy.', tone: 'text-white' },
  { icon: Lock, title: 'TLS & DNS', desc: 'Certificate transparency via crt.sh, A/AAAA/NS/CAA lookups, SPF & DMARC posture.', tone: 'text-white' },
  { icon: Terminal, title: 'Content heuristics', desc: 'Mixed content, password forms over HTTP, eval/document.write, trackers, iframes.', tone: 'text-white' },
  { icon: Fingerprint, title: 'Exposure probes', desc: 'robots.txt, .git/HEAD, .env, sitemap.xml and wp-json with honest reporting.', tone: 'text-white' },
  { icon: Globe, title: 'Reputation', desc: 'IP-host, punycode, abused TLD detection + keyless OpenPhish feed lookup.', tone: 'text-white' },
  { icon: Zap, title: 'Malware verdict', desc: 'Heuristics + optional VirusTotal API key kept locally; local blocklist support.', tone: 'text-white' },
];

const STEPS = [
  { n: '01', title: 'Paste a URL', desc: 'Public web URL, no signup, no upload.' },
  { n: '02', title: 'We probe quietly', desc: '10 local checks run in parallel; progress streamed live.' },
  { n: '03', title: 'Read the verdict', desc: 'Risk meter, 5 malware rows, grouped findings, exportable JSON.' },
];

export default function Home() {
  const navigate = useNavigate();
  const history = loadHistory().slice(0, 5);
  const [blobShift, setBlobShift] = useState(0);

  useEffect(() => {
    const onScroll = () => setBlobShift(window.scrollY * 0.25);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="-mx-4 -mt-6 space-y-0 overflow-hidden bg-black text-white">
      {/* HERO */}
      <section className="relative isolate min-h-[78vh] px-6 pt-16 pb-20 sm:px-10 lg:px-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-black to-white/5"
          style={{ transform: `translateY(${blobShift * 0.6}px)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          style={{ transform: `translateY(${blobShift * -0.4}px) translateX(${blobShift * 0.3}px)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-white/5 blur-3xl animate-pulse"
        />
        <div className="w-full max-w-none mx-auto space-y-8 text-center px-6 sm:px-10 lg:px-16">
          <Reveal direction="up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white shadow-sm backdrop-blur">
              <Shield className="h-4 w-4 text-white" />
              Open-source · Browser-only · No data leaves your browser
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white">
              Scan websites for{' '}
              <span className="text-white">
                malware &amp; security
              </span>
              {' '}threats
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/60">
              ScanSecure runs 10 checks — headers, TLS, DNS, content, exposure, reputation,
              performance, malware feeds — entirely in your browser. No backend, no DB, no keys required.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="group bg-white text-black hover:bg-white/90" onClick={() => navigate('/scan')}>
                Start a scan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('/about')}>
                What it checks
              </Button>
            </div>
          </Reveal>
          <Reveal delay={520}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6">
              {[
                ['10', 'Checks run'],
                ['0', 'API keys needed'],
                ['100%', 'Local-first'],
                ['JSON', 'Exportable'],
              ].map(([k, v]) => (
                <div key={v} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="text-2xl font-bold text-white">{k}</div>
                  <div className="text-xs text-white/60">{v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full px-6 py-16 sm:px-10 lg:px-16">
        <Reveal>
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Everything you need, nothing you don't</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              One paste. Ten checks. One honest verdict — with an explicit risk meter and checklist.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={(i % 3) * 120}>
                <Card className="h-full border-white/10 bg-white/5 text-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                  <CardHeader>
                    <div className={cn('mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10', f.tone)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg text-white">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-white/60">{f.desc}</CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full px-6 py-16 sm:px-10 lg:px-16 bg-white/5 rounded-3xl my-8 border border-white/10">
        <Reveal>
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">How it works</h2>
            <p className="text-white/60">From URL to verdict in seconds.</p>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 160}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-black p-6 shadow-sm transition-transform hover:-translate-y-1">
                <div className="text-5xl font-black text-white/15">{s.n}</div>
                <div className="mt-2 font-semibold text-lg text-white">{s.title}</div>
                <div className="text-sm text-white/60 mt-1">{s.desc}</div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-white/30">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PREVIEW STRIP */}
      <section className="w-full px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <Reveal direction="left">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">A verdict you can trust at a glance</h2>
              <p className="text-white/60">
                Risk meter, "Website Malware & Security" checklist with honest
                pass/warn/fail/unknown markers, grouped findings and one-click JSON export.
              </p>
              <ul className="space-y-3 text-sm text-white/80">
                {['Pass · Warn · Fail · Unknown rows', 'Score ring + grade (A–F)', 'Export findings as JSON', 'Recent scan history'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-white" /> {t}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('/scan')}>Try a scan</Button>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg transition-transform hover:rotate-0"
              style={{ transform: 'rotate(-1.5deg)' }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Security risk</span>
                  <span className="text-xs text-white/60">85/100</span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[15%] rounded-full bg-white" />
                </div>
                <div className="text-sm font-medium text-white">Low Security Risk — looks OK.</div>
                <div className="flex justify-between text-[10px] text-white/60">
                  <span>Minimal</span><span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
                </div>
                <ul className="text-sm space-y-1.5 pt-2">
                  {['✓ No malware detected (Low Risk)', '⚠ Possible injected spam (Medium Risk)', '✓ No defacements (Low Risk)', '✓ No server errors (Low Risk)', '? CMS version not fingerprinted (Unknown)'].map((t) => (
                    <li key={t} className="text-white/60">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SITE DETAILS PREVIEW */}
      <section className="w-full px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <Reveal direction="left">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold">Site Details</h3>
              <div className="my-3 border-t border-white/10" />
              <div className="text-sm font-semibold">System info</div>
              <div className="mt-2 space-y-2 text-sm text-white/80">
                <div><span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">IP addresses</span>{' '}
                  <TypingText className="align-middle" cycleMs={3000} values={['141.193.213.10, 141.193.213.11', '104.21.55.12', '185.199.108.153']} /></div>
                <div><span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">CDN</span>{' '}
                  <TypingText className="align-middle" cycleMs={3000} values={['CloudFlare', 'Fastly', 'Akamai', 'CloudFront']} /></div>
                <div><span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">TLS Certificate</span>{' '}
                  <TypingText className="align-middle" cycleMs={3000} values={["Issued by Let's Encrypt", 'Issued by DigiCert', 'Issued by Google Trust Services']} /></div>
              </div>
              <div className="mt-4 text-sm font-semibold">Web Application Info</div>
              <div className="mt-2 space-y-2 text-sm text-white/80">
                <div><span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">Application</span>{' '}
                  <TypingText className="align-middle" cycleMs={3000} values={['WordPress', 'WordPress', 'WordPress']} /></div>
                <div><span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">Version</span>{' '}
                  <TypingText className="align-middle" cycleMs={3000} values={['7.1.3 based on feed/', '6.5.4 based on feed/', '7.0.1 based on generator']} /></div>
                <div><span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">Theme</span>{' '}
                  <TypingText className="align-middle" cycleMs={3000} values={['…/wp-content/themes/Divi/', '…/wp-content/themes/Avada/', '…/wp-content/themes/Flatsome/']} /></div>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">See what a site runs on</h2>
              <p className="text-white/60">
                Every scan includes IP addresses, CDN, TLS issuer, redirects, CMS/version/theme
                and counts of links, scripts, iframes and embeds. When the browser can&apos;t see
                something, we say Unknown instead of guessing.
              </p>
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('/scan')}>Run a scan to see yours</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* RECENT SCANS */}
      {history.length > 0 && (
        <section className="w-full px-6 py-16 sm:px-10 lg:px-16">
          <Reveal>
            <h2 className="text-xl font-semibold mb-3 text-white">Recent scans</h2>
            <HistoryTable items={history} onSelect={(it) => navigate('/scan')} />
          </Reveal>
        </section>
      )}

      {/* CTA */}
      <section className="w-full px-6 py-16 sm:px-10 lg:px-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 text-white shadow-xl sm:p-12">
            <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold">Ready to check a site?</h2>
                <p className="opacity-70 max-w-xl mx-auto md:mx-0">
                  It takes a few seconds. Nothing is sent to a backend.
                </p>
                <Button size="lg" className="bg-white text-black hover:bg-white/90" onClick={() => navigate('/scan')}>
                  Start scanning
                </Button>
              </div>
              <FooterVisual className="mx-auto w-full max-w-md text-white" />
            </div>
            <div aria-hidden="true" className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
