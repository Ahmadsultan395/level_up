'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AnnouncementComposer() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmailToo, setSendEmailToo] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function send() {
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }
    if (!confirm('Send this announcement to all active customers?')) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, sendEmailToo }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not send announcement');
        return;
      }
      toast.success(body.message);
      setTitle('');
      setMessage('');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Message to all customers..."
          className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
        />
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={sendEmailToo} onChange={(e) => setSendEmailToo(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          Also send via email (to customers with email notifications enabled)
        </label>
        <Button isLoading={isSending} onClick={send}>
          <Send className="h-4 w-4" /> Send to All Customers
        </Button>
      </CardBody>
    </Card>
  );
}
