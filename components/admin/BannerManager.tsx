'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import { useDataTable } from '@/hooks/useDataTable';
import { useListData } from '@/hooks/useListData';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/Filters';
import { Pagination } from '@/components/shared/Pagination';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';

interface BannerRow {
  _id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  imagePublicId: string;
  position: string;
  status: 'active' | 'inactive';
}

const POSITION_OPTIONS = [
  { label: 'Hero', value: 'hero' },
  { label: 'Homepage Secondary', value: 'homepage_secondary' },
  { label: 'Services Page', value: 'services_page' },
  { label: 'Promo', value: 'promo' },
];

export function BannerManager() {
  const table = useDataTable({ defaultPageSize: 9 });
  const { data, pagination, isLoading, error, refetch } = useListData<BannerRow>({
    endpoint: '/api/admin/banners',
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    sortBy: table.sortBy,
    sortOrder: table.sortOrder,
    filters: table.filters,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [position, setPosition] = useState('hero');
  const [image, setImage] = useState<{ url: string; publicId: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setCtaText('');
    setCtaLink('');
    setPosition('hero');
    setImage(null);
    setShowForm(true);
  }

  function openEdit(banner: BannerRow) {
    setEditingId(banner._id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setCtaText(banner.ctaText || '');
    setCtaLink(banner.ctaLink || '');
    setPosition(banner.position);
    setImage({ url: banner.imageUrl, publicId: banner.imagePublicId });
    setShowForm(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'banners');
      setImage({ url: result.url, publicId: result.publicId });
    } catch {
      toast.error('Could not upload image');
    } finally {
      setIsUploading(false);
    }
  }

  async function save() {
    if (!image) {
      toast.error('Upload a banner image');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle: subtitle || undefined,
          ctaText: ctaText || undefined,
          ctaLink: ctaLink || undefined,
          position,
          imageUrl: image.url,
          imagePublicId: image.publicId,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not save banner');
        return;
      }
      toast.success(editingId ? 'Banner updated' : 'Banner added');
      setShowForm(false);
      setEditingId(null);
      refetch();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('Delete this banner?')) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Could not delete banner');
    toast.success('Banner deleted');
    refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="Search banners..." className="min-w-[16rem] flex-1" />
        <FilterSelect
          label="Position"
          value={table.filters.position || ''}
          onChange={(v) => table.setFilter('position', v || null)}
          options={POSITION_OPTIONS}
          allLabel="All positions"
        />
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              {image ? (
                <div className="relative aspect-video w-40 overflow-hidden rounded-md bg-bg-secondary">
                  <Image src={image.url} alt="" fill className="object-cover" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-video w-40 items-center justify-center rounded-md border border-dashed border-border text-text-muted hover:border-gold"
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              <Select value={position} onChange={(e) => setPosition(e.target.value)}>
                {POSITION_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle (optional)" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Button text (optional)" />
              <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="Button link (optional)" />
            </div>

            <div className="flex gap-2">
              <Button size="sm" isLoading={isSaving} onClick={save}>
                {editingId ? 'Save Changes' : 'Save Banner'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="mt-6">
        {isLoading ? (
          <SkeletonTable rows={2} cols={3} />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState title="No banners yet" description="Add a banner for your hero section or promotions." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((b) => (
              <Card key={b._id}>
                <div className="relative aspect-video bg-bg-secondary">
                  <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="300px" />
                </div>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-primary">{b.title}</p>
                    <p className="text-xs capitalize text-text-muted">{b.position.replace('_', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusToggle id={b._id} status={b.status} endpoint={`/api/admin/banners/${b._id}`} onChanged={refetch} />
                    <button onClick={() => openEdit(b)} aria-label="Edit">
                      <Pencil className="h-4 w-4 text-text-muted hover:text-gold" />
                    </button>
                    <button onClick={() => deleteOne(b._id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-text-muted hover:text-status-danger" />
                    </button>
                  </div>
                </CardBody>
              </Card>
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
        />
      )}
    </div>
  );
}
