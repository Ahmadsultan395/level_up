'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Check, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonTable, EmptyState } from '@/components/shared/States';
import { formatCurrency, cn } from '@/lib/utils';

interface ServiceOption {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  durationMinutes: number;
}

interface PackageOption {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  durationMinutes: number;
  services: { _id: string; name: string }[];
}

interface BarberOption {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  services: string[];
}

const STEPS = ['Service', 'Barber', 'Date & Time', 'Review'] as const;

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'service' | 'package'>(searchParams.get('package') ? 'package' : 'service');
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(searchParams.get('package'));
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(searchParams.get('barber'));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preload catalog
  useEffect(() => {
    fetch('/api/services?pageSize=100&sortBy=order&sortOrder=asc')
      .then((res) => res.json())
      .then((body) => {
        setServices(body.data || []);
        const preselect = searchParams.get('service');
        if (preselect) {
          const match = (body.data || []).find((s: ServiceOption & { slug?: string }) => (s as never as { slug: string }).slug === preselect);
          if (match) setSelectedServiceIds([match._id]);
        }
      })
      .catch(() => setServices([]));

    fetch('/api/packages?pageSize=100&sortBy=order&sortOrder=asc')
      .then((res) => res.json())
      .then((body) => setPackages(body.data || []))
      .catch(() => setPackages([]));

    fetch('/api/barbers?pageSize=100')
      .then((res) => res.json())
      .then((body) =>
        setBarbers(
          (body.data || []).map((b: { _id: string; name: string; slug: string; imageUrl?: string; services: string[] }) => ({
            _id: b._id,
            name: b.name,
            slug: b.slug,
            imageUrl: b.imageUrl,
            services: b.services,
          }))
        )
      )
      .catch(() => setBarbers([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPackage = packages.find((p) => p._id === selectedPackageId) || null;
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s._id));

  const totalDuration = mode === 'package' ? selectedPackage?.durationMinutes ?? 0 : selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice =
    mode === 'package'
      ? selectedPackage?.discountPrice ?? selectedPackage?.price ?? 0
      : selectedServices.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);

  const eligibleBarbers = useMemo(() => {
    if (mode === 'package') return barbers; // packages span multiple services; keep it simple and show all
    if (selectedServiceIds.length === 0) return barbers;
    return barbers.filter((b) => selectedServiceIds.every((id) => b.services.includes(id)));
  }, [barbers, mode, selectedServiceIds]);

  // Fetch availability when barber/date/duration change
  useEffect(() => {
    if (!selectedBarberId || !selectedDate || totalDuration === 0) {
      setAvailableSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/booking/availability?barberId=${selectedBarberId}&date=${selectedDate}&durationMinutes=${totalDuration}`)
      .then((res) => res.json())
      .then((body) => setAvailableSlots(body.slots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setIsLoadingSlots(false));
  }, [selectedBarberId, selectedDate, totalDuration]);

  const canProceedFromStep0 = mode === 'package' ? !!selectedPackageId : selectedServiceIds.length > 0;
  const canProceedFromStep1 = !!selectedBarberId;
  const canProceedFromStep2 = !!selectedDate && !!selectedTime;

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: selectedBarberId,
          serviceIds: mode === 'service' ? selectedServiceIds : [],
          packageId: mode === 'package' ? selectedPackageId : undefined,
          date: selectedDate,
          startTime: selectedTime,
          notes: notes || undefined,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error || 'Could not book this appointment.');
        if (res.status === 409) {
          setSelectedTime(null);
          setStep(2);
        }
        return;
      }

      toast.success('Appointment reserved! Complete payment to confirm.');
      router.push(`/dashboard/book/payment/${body._id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const minDate = new Date().toISOString().slice(0, 10);
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                i < step ? 'bg-gold text-text-inverse' : i === step ? 'border-2 border-gold text-gold' : 'border border-border text-text-muted'
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn('hidden text-sm sm:inline', i === step ? 'text-text-primary' : 'text-text-muted')}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-8">
        {step === 0 && (
          <div>
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setMode('service')}
                className={cn('rounded-full px-4 py-1.5 text-sm', mode === 'service' ? 'bg-gold text-text-inverse' : 'border border-border text-text-secondary')}
              >
                Choose services
              </button>
              <button
                onClick={() => setMode('package')}
                className={cn('rounded-full px-4 py-1.5 text-sm', mode === 'package' ? 'bg-gold text-text-inverse' : 'border border-border text-text-secondary')}
              >
                Choose a package
              </button>
            </div>

            {mode === 'service' ? (
              services.length === 0 ? (
                <SkeletonTable rows={3} cols={1} />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => {
                    const selected = selectedServiceIds.includes(s._id);
                    return (
                      <button
                        key={s._id}
                        onClick={() =>
                          setSelectedServiceIds((prev) =>
                            selected ? prev.filter((id) => id !== s._id) : [...prev, s._id]
                          )
                        }
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-4 text-left transition-colors',
                          selected ? 'border-gold bg-gold/10' : 'border-border hover:border-border-strong'
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">{s.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                            <Clock className="h-3 w-3" /> {s.durationMinutes} min
                          </p>
                        </div>
                        <span className="font-display text-gold">{formatCurrency(s.discountPrice ?? s.price)}</span>
                      </button>
                    );
                  })}
                </div>
              )
            ) : packages.length === 0 ? (
              <SkeletonTable rows={3} cols={1} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((p) => {
                  const selected = selectedPackageId === p._id;
                  return (
                    <button
                      key={p._id}
                      onClick={() => setSelectedPackageId(p._id)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-4 text-left transition-colors',
                        selected ? 'border-gold bg-gold/10' : 'border-border hover:border-border-strong'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{p.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                          <Clock className="h-3 w-3" /> {p.durationMinutes} min • {p.services.length} services
                        </p>
                      </div>
                      <span className="font-display text-gold">{formatCurrency(p.discountPrice ?? p.price)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            {eligibleBarbers.length === 0 ? (
              <EmptyState title="No barbers available" description="Try selecting different services." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {eligibleBarbers.map((b) => {
                  const selected = selectedBarberId === b._id;
                  return (
                    <button
                      key={b._id}
                      onClick={() => setSelectedBarberId(b._id)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                        selected ? 'border-gold bg-gold/10' : 'border-border hover:border-border-strong'
                      )}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
                        {b.imageUrl && <Image src={b.imageUrl} alt={b.name} fill className="object-cover" />}
                      </div>
                      <p className="text-sm font-medium text-text-primary">{b.name}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Select a date</label>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary outline-none focus:border-gold"
            />

            {selectedDate && (
              <div className="mt-6">
                <label className="mb-2 block text-sm text-text-secondary">Available times</label>
                {isLoadingSlots ? (
                  <SkeletonTable rows={1} cols={4} />
                ) : availableSlots.length === 0 ? (
                  <EmptyState title="No times available" description="Try a different date." />
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {availableSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={cn(
                          'rounded-md border py-2 text-sm transition-colors',
                          selectedTime === t ? 'border-gold bg-gold text-text-inverse' : 'border-border text-text-secondary hover:border-gold'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <Card>
            <CardBody className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{mode === 'package' ? 'Package' : 'Services'}</span>
                <span className="text-text-primary">
                  {mode === 'package' ? selectedPackage?.name : selectedServices.map((s) => s.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Barber</span>
                <span className="text-text-primary">{barbers.find((b) => b._id === selectedBarberId)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Date &amp; Time</span>
                <span className="text-text-primary">
                  {selectedDate} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Duration</span>
                <span className="text-text-primary">{totalDuration} min</span>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-base">
                <span className="font-medium text-text-primary">Total</span>
                <span className="font-display text-gold">{formatCurrency(totalPrice)}</span>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">
                  Notes for your barber <span className="text-text-muted">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                  placeholder="Anything we should know before your visit?"
                />
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            disabled={(step === 0 && !canProceedFromStep0) || (step === 1 && !canProceedFromStep1) || (step === 2 && !canProceedFromStep2)}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button isLoading={isSubmitting} onClick={handleConfirm}>
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
