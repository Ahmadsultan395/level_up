'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Archive, CheckCircle, Send } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface Reply {
  message: string;
  repliedBy: string;
  repliedAt: string;
}

interface Props {
  message: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
    replies: Reply[];
  };
}

export function MessageDetailPanel({ message: initial }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState(initial);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function sendReply() {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/messages/${message._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not send reply');
        return;
      }
      toast.success('Reply sent');
      setMessage(body);
      setReplyText('');
      router.refresh();
    } finally {
      setIsSending(false);
    }
  }

  async function updateStatus(status: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/messages/${message._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error();
      toast.success('Status updated');
      setMessage(body);
    } catch {
      toast.error('Could not update status');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">{message.name}</p>
              <p className="text-xs text-text-muted">
                {message.email} {message.phone && `• ${message.phone}`}
              </p>
            </div>
            <Badge status={message.status} />
          </div>
          <p className="text-sm font-medium text-text-primary">{message.subject}</p>
          <p className="text-sm text-text-secondary">{message.message}</p>
          <p className="text-xs text-text-muted">{formatDate(message.createdAt)}</p>
        </CardBody>
      </Card>

      {message.replies.length > 0 && (
        <div className="space-y-3">
          {message.replies.map((r, i) => (
            <Card key={i} className="ml-8 border-gold/30 bg-gold/5">
              <CardBody>
                <p className="text-sm text-text-primary">{r.message}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {r.repliedBy} • {formatDate(r.repliedAt)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardBody className="space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            placeholder="Write a reply..."
            className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" isLoading={isSending} onClick={sendReply}>
              <Send className="h-3.5 w-3.5" /> Send Reply
            </Button>
            <Button size="sm" variant="secondary" disabled={isUpdating} onClick={() => updateStatus('resolved')}>
              <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
            </Button>
            <Button size="sm" variant="ghost" disabled={isUpdating} onClick={() => updateStatus('archived')}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
