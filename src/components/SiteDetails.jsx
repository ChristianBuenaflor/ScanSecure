import { buildSiteDetails } from '../engine/siteDetails.js';
import { cn } from '../lib/cn.js';

function Row({ label, value, unknown }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 text-sm">
      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">{label}</span>
      <span className={cn('break-all', unknown && 'text-muted-foreground italic')}>{value}</span>
    </div>
  );
}

function isUnknown(v) {
  return /unknown/i.test(String(v || ''));
}

export default function SiteDetails({ findings = [], url = '', meta = {}, className }) {
  const d = buildSiteDetails(findings, url, meta);
  return (
    <div className={cn('w-full', className)}>
      <h2 className="text-xl font-bold">Site Details</h2>
      <div className="my-3 border-t" />
      <h3 className="font-semibold">System info</h3>
      <div className="mt-2 space-y-2">
        <Row label="IP addresses" value={d.system.ips} unknown={isUnknown(d.system.ips)} />
        <Row label="CDN" value={d.system.cdn.value} unknown={d.system.cdn.status === 'unknown'} />
        <Row label="TLS Certificate" value={d.system.tlsIssuer.value} unknown={d.system.tlsIssuer.status === 'unknown'} />
      </div>
      <h3 className="mt-4 font-semibold">Redirects</h3>
      <div className="mt-2"><Row label="Redirects to" value={d.redirects.to} unknown={d.redirects.status === 'unknown'} /></div>
      <h3 className="mt-4 font-semibold">Web Application Info</h3>
      <div className="mt-2 space-y-2">
        <Row label="Application" value={d.app.name} unknown={isUnknown(d.app.name)} />
        <Row label="Version" value={d.app.version} unknown={isUnknown(d.app.version)} />
        <Row label="Theme" value={d.app.theme} unknown={isUnknown(d.app.theme)} />
        <Row label="Directory" value={d.app.directory} unknown={isUnknown(d.app.directory)} />
      </div>
      <div className="my-3 border-t" />
      <div className="space-y-2 text-sm">
        <details><summary className="cursor-pointer text-primary">Links found ({d.content.links})</summary><p className="text-xs text-muted-foreground">Counted from fetched HTML. Full list unavailable in browser-only mode.</p></details>
        <details><summary className="cursor-pointer text-primary">Javascripts included ({d.content.scripts})</summary><p className="text-xs text-muted-foreground">External script tags counted from HTML.</p></details>
        <details><summary className="cursor-pointer text-primary">Iframes included ({d.content.iframes})</summary><p className="text-xs text-muted-foreground">Iframe tags counted from HTML.</p></details>
        <details><summary className="cursor-pointer text-primary">Embedded objects included ({d.content.embeds})</summary><p className="text-xs text-muted-foreground">Embed/object tags counted from HTML.</p></details>
      </div>
    </div>
  );
}
