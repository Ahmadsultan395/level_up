'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Camera, Loader2 } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';
import type { ServiceInput } from '@/validations/service';

interface CategoryOption {
  _id: string;
  name: string;
}

interface ServiceFormProps {
  serviceId?: string;
  initial?: Partial<ServiceInput>;
  categories: CategoryOption[];
}

export function ServiceForm({ serviceId, initial, categories }: ServiceFormProps) {
  const router = useRouter();
  const isEditing = !!serviceId;

  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || categories[0]?._id || '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discountPrice, setDiscountPrice] = useState(initial?.discountPrice);
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 30);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId);
  const [status, setStatus] = useState<ServiceInput['status']>(initial?.status || 'active');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'services');
      setImageUrl(result.url);
      setImagePublicId(result.publicId);
    } catch {
      toast.error('Could not upload image');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/services/${serviceId}` : '/api/admin/services', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          price,
          discountPrice: discountPrice || undefined,
          durationMinutes,
          imageUrl,
          imagePublicId,
          status,
          featured,
          order,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not save service');
        return;
      }
      toast.success(isEditing ? 'Service updated' : 'Service added');
      router.push('/admin/services');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-md bg-bg-secondary">
              {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" />}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-text-primary" /> : <Camera className="h-5 w-5 text-text-primary" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <p className="text-sm text-text-muted">Click to upload a photo</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Price</label>
              <Input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">
                Discount Price <span className="text-text-muted">(optional)</span>
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={discountPrice ?? ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Duration (minutes)</label>
              <Input type="number" min={5} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as ServiceInput['status'])}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm text-text-primary">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
              Featured on homepage
            </label>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Display Order</label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/services')}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {isEditing ? 'Save Changes' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
}
