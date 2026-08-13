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
import type { CategoryInput } from '@/validations/category';

interface CategoryFormProps {
  categoryId?: string;
  initial?: Partial<CategoryInput>;
}

export function CategoryForm({ categoryId, initial }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!categoryId;

  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [type, setType] = useState<CategoryInput['type']>(initial?.type || 'service');
  const [status, setStatus] = useState<CategoryInput['status']>(initial?.status || 'active');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'gallery');
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
      const res = await fetch(isEditing ? `/api/admin/categories/${categoryId}` : '/api/admin/categories', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, type, status, order, imageUrl, imagePublicId }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not save category');
        return;
      }
      toast.success(isEditing ? 'Category updated' : 'Category added');
      router.push('/admin/categories');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-bg-secondary">
              {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" />}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-text-primary" /> : <Camera className="h-4 w-4 text-text-primary" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <p className="text-sm text-text-muted">Optional category image</p>
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
              rows={3}
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value as CategoryInput['type'])}>
                <option value="service">Service</option>
                <option value="blog">Blog</option>
                <option value="gallery">Gallery</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as CategoryInput['status'])}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Display Order</label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/categories')}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {isEditing ? 'Save Changes' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
}
