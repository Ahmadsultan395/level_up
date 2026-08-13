'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/shared/Pagination';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { uploadFile } from '@/lib/upload-client';
import { formatDate, cn } from '@/lib/utils';

interface ReviewableAppointment {
  _id: string;
  date: string;
  startTime: string;
  barber: { name: string; imageUrl?: string };
}

interface MyReviewItem {
  _id: string;
  rating: number;
  comment: string;
  moderationStatus: string;
  createdAt: string;
  barber?: { name: string };
}

function ReviewComposer({ appointment, onSubmitted, onCancel }: { appointment?: ReviewableAppointment; onSubmitted: () => void; onCancel?: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'customers');
      setImages((prev) => [...prev, { url: result.url, publicId: result.publicId }]);
    } catch {
      toast.error('Could not upload photo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  async function submit() {
    if (comment.trim().length < 5) {
      toast.error('Please write at least 5 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment?._id, rating, comment, images }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not submit review');
        return;
      }
      toast.success('Review submitted for approval!');
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-primary">
            {appointment ? `${formatDate(appointment.date)} with ${appointment.barber.name}` : 'Share your experience'}
          </p>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={cn('h-5 w-5', n <= rating ? 'fill-gold text-gold' : 'text-border')} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="How was your visit?"
          className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
        />

        <div className="flex flex-wrap items-center gap-2">
          {images.map((img) => (
            <div key={img.publicId} className="relative h-14 w-14 overflow-hidden rounded-md bg-bg-secondary">
              <Image src={img.url} alt="Review photo" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((i) => i.publicId !== img.publicId))}
                className="absolute right-0 top-0 rounded-bl bg-bg-overlay p-0.5"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3 text-text-primary" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border text-text-muted hover:border-gold hover:text-gold"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
        </div>

        <div className="flex gap-2">
          <Button size="sm" isLoading={isSubmitting} onClick={submit}>
            Submit Review
          </Button>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function MyReviews() {
  const [reviewable, setReviewable] = useState<ReviewableAppointment[]>([]);
  const [isLoadingReviewable, setIsLoadingReviewable] = useState(true);
  const [showGeneralComposer, setShowGeneralComposer] = useState(false);

  function loadReviewable() {
    setIsLoadingReviewable(true);
    fetch('/api/customers/me/reviewable-appointments')
      .then((res) => res.json())
      .then((body) => setReviewable(body.data || []))
      .catch(() => setReviewable([]))
      .finally(() => setIsLoadingReviewable(false));
  }

  useEffect(() => {
    loadReviewable();
  }, []);

  const table = useDataTable({ defaultPageSize: 10 });
  const { data, pagination, isLoading, error, refetch } = useListData<MyReviewItem>({
    endpoint: '/api/customers/me/reviews',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  return (
    <div className="space-y-10">
      <div>
        {showGeneralComposer ? (
          <ReviewComposer
            onCancel={() => setShowGeneralComposer(false)}
            onSubmitted={() => {
              setShowGeneralComposer(false);
              refetch();
            }}
          />
        ) : (
          <Button onClick={() => setShowGeneralComposer(true)}>Write a Review</Button>
        )}
      </div>

      {!isLoadingReviewable && reviewable.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-primary">Ready to review</h2>
          <div className="mt-4 space-y-4">
            {reviewable.map((appt) => (
              <ReviewComposer
                key={appt._id}
                appointment={appt}
                onSubmitted={() => {
                  loadReviewable();
                  refetch();
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-xl text-text-primary">Your Reviews</h2>
        <div className="mt-4">
          {isLoading ? (
            <SkeletonTable rows={3} cols={1} />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : data.length === 0 ? (
            <EmptyState title="No reviews yet" description="Reviews you write will appear here." />
          ) : (
            <div className="space-y-3">
              {data.map((review) => (
                <Card key={review._id}>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-current' : 'text-border')} />
                        ))}
                      </div>
                      <Badge status={review.moderationStatus} />
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      {formatDate(review.createdAt)} {review.barber && `• with ${review.barber.name}`}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && !error && data.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={table.setPage}
              onPageSizeChange={table.setPageSize}
            />
          )}
        </div>
      </div>
    </div>
  );
}
