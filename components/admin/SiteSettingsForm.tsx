'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, X, Loader2, Camera } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';

interface Settings {
  siteName: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks: { platform: string; url: string }[];
  footerText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutContent?: string;
  privacyPolicyContent?: string;
  termsContent?: string;
  refundPolicyContent?: string;
  careersIntro?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankName?: string;
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  paymentInstructions?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  ogImageUrl?: string;
  currency: string;
  taxRatePercent: number;
}

const TABS = ['General', 'Homepage & About', 'Payment Methods', 'Legal Pages', 'SEO'] as const;

export function SiteSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('General');
  const [isSaving, setIsSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => toast.error('Could not load settings'));
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setIsSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex justify-center py-16 text-text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? 'bg-gold text-text-inverse' : 'text-text-secondary hover:bg-bg-elevated'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'General' && (
          <Card>
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Site Name</label>
                <Input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Tagline</label>
                <Input value={settings.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Contact Email</label>
                  <Input value={settings.contactEmail || ''} onChange={(e) => update('contactEmail', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Contact Phone</label>
                  <Input value={settings.contactPhone || ''} onChange={(e) => update('contactPhone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Address</label>
                <Input value={settings.address || ''} onChange={(e) => update('address', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Footer Text</label>
                <Input value={settings.footerText || ''} onChange={(e) => update('footerText', e.target.value)} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Social Links</label>
                <div className="space-y-2">
                  {settings.socialLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={link.platform}
                        onChange={(e) => {
                          const next = [...settings.socialLinks];
                          next[i] = { ...next[i], platform: e.target.value };
                          update('socialLinks', next);
                        }}
                        placeholder="Instagram"
                        className="max-w-[8rem]"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => {
                          const next = [...settings.socialLinks];
                          next[i] = { ...next[i], url: e.target.value };
                          update('socialLinks', next);
                        }}
                        placeholder="https://..."
                      />
                      <button onClick={() => update('socialLinks', settings.socialLinks.filter((_, idx) => idx !== i))} aria-label="Remove">
                        <X className="h-4 w-4 text-text-muted hover:text-status-danger" />
                      </button>
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => update('socialLinks', [...settings.socialLinks, { platform: '', url: '' }])}>
                    <Plus className="h-3.5 w-3.5" /> Add link
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Currency</label>
                  <Input value={settings.currency} onChange={(e) => update('currency', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Tax Rate (%)</label>
                  <Input type="number" value={settings.taxRatePercent} onChange={(e) => update('taxRatePercent', Number(e.target.value))} />
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {tab === 'Homepage & About' && (
          <Card>
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Hero Title</label>
                <Input value={settings.heroTitle || ''} onChange={(e) => update('heroTitle', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Hero Subtitle</label>
                <Input value={settings.heroSubtitle || ''} onChange={(e) => update('heroSubtitle', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">About Content</label>
                <textarea
                  value={settings.aboutContent || ''}
                  onChange={(e) => update('aboutContent', e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Careers Page Intro</label>
                <textarea
                  value={settings.careersIntro || ''}
                  onChange={(e) => update('careersIntro', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {tab === 'Payment Methods' && (
          <Card>
            <CardBody className="space-y-4">
              <p className="text-sm text-text-muted">
                These details are shown to customers at checkout so they can pay via bank transfer,
                EasyPaisa, or JazzCash. Leave a section blank to hide that option.
              </p>
              <div>
                <h3 className="text-sm font-medium text-text-primary">Bank Transfer</h3>
                <div className="mt-2 grid gap-4 sm:grid-cols-3">
                  <Input value={settings.bankAccountTitle || ''} onChange={(e) => update('bankAccountTitle', e.target.value)} placeholder="Account Title" />
                  <Input value={settings.bankName || ''} onChange={(e) => update('bankName', e.target.value)} placeholder="Bank Name" />
                  <Input value={settings.bankAccountNumber || ''} onChange={(e) => update('bankAccountNumber', e.target.value)} placeholder="Account Number / IBAN" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-primary">EasyPaisa</h3>
                <Input
                  className="mt-2"
                  value={settings.easypaisaNumber || ''}
                  onChange={(e) => update('easypaisaNumber', e.target.value)}
                  placeholder="EasyPaisa Number"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-primary">JazzCash</h3>
                <Input
                  className="mt-2"
                  value={settings.jazzcashNumber || ''}
                  onChange={(e) => update('jazzcashNumber', e.target.value)}
                  placeholder="JazzCash Number"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Extra Instructions</label>
                <textarea
                  value={settings.paymentInstructions || ''}
                  onChange={(e) => update('paymentInstructions', e.target.value)}
                  rows={3}
                  placeholder="e.g. Please send the exact amount and keep your receipt until your visit."
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {tab === 'Legal Pages' && (
          <Card>
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Privacy Policy</label>
                <textarea
                  value={settings.privacyPolicyContent || ''}
                  onChange={(e) => update('privacyPolicyContent', e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Terms &amp; Conditions</label>
                <textarea
                  value={settings.termsContent || ''}
                  onChange={(e) => update('termsContent', e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Refund Policy</label>
                <textarea
                  value={settings.refundPolicyContent || ''}
                  onChange={(e) => update('refundPolicyContent', e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {tab === 'SEO' && (
          <Card>
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Default SEO Title</label>
                <Input value={settings.seoTitle || ''} onChange={(e) => update('seoTitle', e.target.value)} maxLength={70} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Default SEO Description</label>
                <textarea
                  value={settings.seoDescription || ''}
                  onChange={(e) => update('seoDescription', e.target.value)}
                  rows={3}
                  maxLength={160}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Keywords</label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = keywordInput.trim();
                        if (v) update('seoKeywords', [...(settings.seoKeywords || []), v]);
                        setKeywordInput('');
                      }
                    }}
                    placeholder="e.g. barbershop, haircut"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const v = keywordInput.trim();
                      if (v) update('seoKeywords', [...(settings.seoKeywords || []), v]);
                      setKeywordInput('');
                    }}
                  >
                    Add
                  </Button>
                </div>
                {(settings.seoKeywords || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {settings.seoKeywords.map((k) => (
                      <span key={k} className="flex items-center gap-1 rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary">
                        {k}
                        <button onClick={() => update('seoKeywords', settings.seoKeywords.filter((x) => x !== k))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Social Share Image (OG Image)</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-28 overflow-hidden rounded-md bg-bg-secondary">
                    {settings.ogImageUrl && <Image src={settings.ogImageUrl} alt="" fill className="object-cover" />}
                    <button
                      type="button"
                      onClick={() => ogFileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
                    >
                      {isUploadingOg ? <Loader2 className="h-4 w-4 animate-spin text-text-primary" /> : <Camera className="h-4 w-4 text-text-primary" />}
                    </button>
                    <input
                      ref={ogFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingOg(true);
                        try {
                          const result = await uploadFile(file, 'banners');
                          update('ogImageUrl', result.url);
                        } catch {
                          toast.error('Could not upload image');
                        } finally {
                          setIsUploadingOg(false);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted">Shown when the site is shared on social media.</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button isLoading={isSaving} onClick={save}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
