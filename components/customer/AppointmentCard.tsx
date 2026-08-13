'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface AppointmentItem {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  barber: { name: string; imageUrl?: string };
  services: { name: string }[];
  package?: { name: string };
}

export function AppointmentCard({ appointment, onCancelled }: { appointment: AppointmentItem; onCancelled?: () => void }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  async function cancel() {
    if (!confirm('Cancel this appointment?')) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error || 'Could not cancel appointment');
        return;
      }
      toast.success('Appointment cancelled');
      onCancelled?.();
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
            {appointment.barber.imageUrl && (
              <Image src={appointment.barber.imageUrl} alt={appointment.barber.name} fill className="object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {appointment.package ? appointment.package.name : appointment.services.map((s) => s.name).join(', ')}
            </p>
            <p className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formatDate(appointment.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {appointment.startTime}
              </span>
              <span>with {appointment.barber.name}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="font-display text-gold">{formatCurrency(appointment.totalPrice)}</span>
          <Badge status={appointment.status} />
          {canCancel && (
            <Button variant="ghost" size="sm" isLoading={isCancelling} onClick={cancel}>
              Cancel
            </Button>
          )}
          {appointment.status === 'pending' && (
            <a href={`/dashboard/book/payment/${appointment._id}`}>
              <Button size="sm">Pay Now</Button>
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
