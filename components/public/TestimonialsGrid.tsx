'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { TestimonialCard } from '@/components/shared/TestimonialCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ITestimonial } from '@/models/Testimonial';

const submitSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  roleOrTitle: z.string().optional(),
  message: z.string().min(10, 'Please write at least 10 characters'),
});
type SubmitInput = z.infer<typeof submitSchema>;

export function TestimonialsGrid() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<ITestimonial & { _id: string }>({
    endpoint: '/api/testimonials',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitInput>({ resolver: zodResolver(submitSchema) });

  async function onSubmit(values: SubmitInput) {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body = await res.json();

    if (!res.ok) {
      toast.error(body.error || 'Something went wrong.');
      return;
    }

    toast.success(body.message);
    reset();
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search testimonials..." className="max-w-md flex-1" />
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Share your experience'}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">Your name</label>
                  <Input {...register('name')} error={errors.name?.message} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">
                    Role/title <span className="text-text-muted">(optional)</span>
                  </label>
                  <Input {...register('roleOrTitle')} placeholder="Regular customer" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-text-secondary">Your testimonial</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
                  placeholder="Tell us about your experience..."
                />
                {errors.message && <p className="mt-1 text-xs text-status-danger">{errors.message.message}</p>}
              </div>
              <p className="text-xs text-text-muted">
                Submissions are reviewed by our team before appearing publicly.
              </p>
              <Button type="submit" isLoading={isSubmitting}>
                Submit
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={3} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No testimonials found" description="Try a different search term." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((t) => (
              <TestimonialCard key={t._id} testimonial={t} />
            ))}
          </div>
        )}
      </div>

      {!isLoading && !error && data.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          pageSizeOptions={[9, 18, 36]}
        />
      )}
    </div>
  );
}
