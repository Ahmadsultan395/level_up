'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Copy, Upload, Loader2, Banknote, X } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { uploadFile } from '@/lib/upload-client';
import { cn } from '@/lib/utils';

interface PaymentMethods {
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankName?: string;
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  paymentInstructions?: string;
}

interface ManualPaymentFormProps {
  appointmentId: string;
  methods: PaymentMethods;
}

type Method = 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'cash';

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-bg-secondary px-3 py-2">
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success('Copied');
        }}
        aria-label={`Copy ${label}`}
        className="text-text-muted hover:text-gold"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ManualPaymentForm({ appointmentId, methods }: ManualPaymentFormProps) {
  const router = useRouter();
  const availableMethods: { key: Method; label: string }[] = [
    ...(methods.bankAccountNumber ? [{ key: 'bank_transfer' as Method, label: 'Bank Transfer' }] : []),
    ...(methods.easypaisaNumber ? [{ key: 'easypaisa' as Method, label: 'EasyPaisa' }] : []),
    ...(methods.jazzcashNumber ? [{ key: 'jazzcash' as Method, label: 'JazzCash' }] : []),
    { key: 'cash', label: 'Pay in Person (Cash)' },
  ];

  const [method, setMethod] = useState<Method>(availableMethods[0]?.key || 'cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [screenshot, setScreenshot] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'payments');
      setScreenshot({ url: result.url, publicId: result.publicId });
    } catch {
      toast.error('Could not upload screenshot');
    } finally {
      setIsUploading(false);
    }
  }

  async function submit() {
    if (method !== 'cash' && !referenceNumber && !screenshot) {
      toast.error('Please enter a transaction reference or upload a screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          method,
          referenceNumber: referenceNumber || undefined,
          screenshotUrl: screenshot?.url,
          screenshotPublicId: screenshot?.publicId,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not submit payment');
        return;
      }

      toast.success(
        method === 'cash'
          ? 'Noted! Pay at the shop — your appointment stays pending until then.'
          : 'Payment submitted! We will confirm it shortly.'
      );
      router.push(`/dashboard/book/confirmation/${appointmentId}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {availableMethods.map((m) => (
          <button
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              method === m.key ? 'border-gold bg-gold/10 text-gold' : 'border-border text-text-secondary hover:border-border-strong'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === 'cash' ? (
        <Card>
          <CardBody className="flex items-start gap-3">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-sm text-text-primary">Pay when you arrive for your appointment.</p>
              <p className="mt-1 text-sm text-text-muted">
                Your booking stays reserved as &quot;pending&quot; — we&apos;ll confirm it once you&apos;ve paid in person.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm text-text-secondary">Send the exact amount to the account below, then confirm here.</p>

            {method === 'bank_transfer' && (
              <>
                {methods.bankAccountTitle && <CopyRow label="Account Title" value={methods.bankAccountTitle} />}
                {methods.bankName && <CopyRow label="Bank" value={methods.bankName} />}
                {methods.bankAccountNumber && <CopyRow label="Account Number" value={methods.bankAccountNumber} />}
              </>
            )}
            {method === 'easypaisa' && methods.easypaisaNumber && <CopyRow label="EasyPaisa Number" value={methods.easypaisaNumber} />}
            {method === 'jazzcash' && methods.jazzcashNumber && <CopyRow label="JazzCash Number" value={methods.jazzcashNumber} />}

            {methods.paymentInstructions && <p className="text-xs text-text-muted">{methods.paymentInstructions}</p>}

            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Transaction Reference / ID <span className="text-text-muted">(optional if you upload a screenshot)</span>
              </label>
              <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="e.g. TXN12345678" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Payment Screenshot <span className="text-text-muted">(optional if you entered a reference)</span>
              </label>
              {screenshot ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-md bg-bg-secondary">
                  <Image src={screenshot.url} alt="Payment screenshot" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="absolute right-1 top-1 rounded-full bg-bg-overlay p-1"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3.5 w-3.5 text-text-primary" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-border text-text-muted hover:border-gold hover:text-gold"
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
            </div>
          </CardBody>
        </Card>
      )}

      <Button className="w-full" size="lg" isLoading={isSubmitting} onClick={submit}>
        {method === 'cash' ? "Confirm — I'll Pay at the Shop" : "I've Sent the Payment"}
      </Button>
    </div>
  );
}
