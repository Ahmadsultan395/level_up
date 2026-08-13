'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AppointmentStatusSelect } from '@/components/admin/AppointmentStatusSelect';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  appointment: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    totalPrice: number;
    notes?: string;
    cancelReason?: string;
    customer: { name: string; email: string; phone?: string };
    barber: { name: string };
    services: { name: string; price: number }[];
    package?: { name: string; price: number };
    invoice?: string;
  };
}

export function AppointmentDetailPanel({ appointment }: Props) {
  const [status, setStatus] = useState(appointment.status);
  const [cancelReason, setCancelReason] = useState(appointment.cancelReason || '');
  const [isSavingReason, setIsSavingReason] = useState(false);

  async function saveCancelReason() {
    setIsSavingReason(true);
    try {
      const res = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason }),
      });
      if (!res.ok) throw new Error();
      toast.success('Note saved');
    } catch {
      toast.error('Could not save note');
    } finally {
      setIsSavingReason(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text-primary">Appointment Details</h2>
            <Badge status={status} />
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-text-muted">Customer</p>
              <p className="text-text-primary">{appointment.customer.name}</p>
              <p className="text-xs text-text-muted">{appointment.customer.email}</p>
            </div>
            <div>
              <p className="text-text-muted">Barber</p>
              <p className="text-text-primary">{appointment.barber.name}</p>
            </div>
            <div>
              <p className="text-text-muted">Date &amp; Time</p>
              <p className="text-text-primary">
                {formatDate(appointment.date)}, {appointment.startTime}–{appointment.endTime}
              </p>
            </div>
            <div>
              <p className="text-text-muted">{appointment.package ? 'Package' : 'Services'}</p>
              <p className="text-text-primary">
                {appointment.package ? appointment.package.name : appointment.services.map((s) => s.name).join(', ')}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Total Price</p>
              <p className="text-gold">{formatCurrency(appointment.totalPrice)}</p>
            </div>
            <div>
              <p className="text-text-muted">Status</p>
              <div className="mt-1">
                <AppointmentStatusSelect id={appointment._id} status={status} onChanged={setStatus} />
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div>
              <p className="text-sm text-text-muted">Customer notes</p>
              <p className="mt-1 text-sm text-text-primary">{appointment.notes}</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="font-display text-lg text-text-primary">Internal Note / Cancel Reason</h2>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            placeholder="Not shown to the customer"
          />
          <Button size="sm" isLoading={isSavingReason} onClick={saveCancelReason}>
            Save Note
          </Button>
        </CardBody>
      </Card>

      {appointment.invoice && (
        <a href={`/api/invoices/${appointment.invoice}/download`}>
          <Button variant="secondary">Download Invoice</Button>
        </a>
      )}
    </div>
  );
}
