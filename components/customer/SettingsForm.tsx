'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SettingsFormProps {
  initial: { emailNotificationsEnabled: boolean; smsNotificationsEnabled: boolean };
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const [emailEnabled, setEmailEnabled] = useState(initial.emailNotificationsEnabled);
  const [smsEnabled, setSmsEnabled] = useState(initial.smsNotificationsEnabled);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    try {
      const res = await fetch('/api/customers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotificationsEnabled: emailEnabled,
          smsNotificationsEnabled: smsEnabled,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h2 className="font-display text-lg text-text-primary">Notification Preferences</h2>
          <p className="mt-1 text-sm text-text-muted">Choose how we reach you about your appointments.</p>
        </div>

        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Email notifications</p>
            <p className="text-xs text-text-muted">Booking confirmations, reminders, receipts</p>
          </div>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="h-5 w-5 accent-[var(--color-gold)]"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">SMS notifications</p>
            <p className="text-xs text-text-muted">Text reminders before your appointment</p>
          </div>
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={(e) => setSmsEnabled(e.target.checked)}
            className="h-5 w-5 accent-[var(--color-gold)]"
          />
        </label>

        <Button isLoading={isSaving} onClick={save}>
          Save Settings
        </Button>
      </CardBody>
    </Card>
  );
}
