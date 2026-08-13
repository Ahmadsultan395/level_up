import type { Metadata } from 'next';
import { Palette } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Theme | Admin' };

const SWATCHES = [
  { name: 'Background', varName: '--color-bg-primary' },
  { name: 'Gold Accent', varName: '--color-gold' },
  { name: 'Text', varName: '--color-text-primary' },
  { name: 'Border', varName: '--color-border' },
];

export default function AdminThemePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Theme</h1>
      <p className="mt-1 text-text-secondary">The active design system for the entire site.</p>

      <Card className="mt-8">
        <CardBody className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg text-text-primary">Premium Dark with Gold</p>
              <p className="text-sm text-text-muted">Current active theme</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {SWATCHES.map((s) => (
              <div key={s.name} className="text-center">
                <div className="h-12 w-full rounded-md border border-border" style={{ background: `var(${s.varName})` }} />
                <p className="mt-1 text-xs text-text-muted">{s.name}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-text-secondary">
            Every color, font, radius, and shadow across the site comes from a single source of truth
            (<code className="text-xs text-gold">src/styles/globals.css</code>) rather than being set
            per-page. This keeps the whole site visually consistent and means the entire look can be
            changed by editing one file — but it also means colors aren&apos;t exposed here as a free-form
            picker, since an arbitrary color chosen without matching contrast/spacing tokens could break
            accessibility or consistency elsewhere on the site.
          </p>
          <p className="text-sm text-text-muted">
            To ship a new preset (e.g. a light theme), a developer adds a new token set to{' '}
            <code className="text-xs">globals.css</code> and it becomes selectable here.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
