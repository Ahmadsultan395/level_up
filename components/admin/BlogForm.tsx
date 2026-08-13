'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Camera, Loader2, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { uploadFile } from '@/lib/upload-client';
import type { BlogInput } from '@/validations/blog';

interface CategoryOption {
  _id: string;
  name: string;
}

interface BlogFormProps {
  blogId?: string;
  initial?: Partial<BlogInput>;
  categories: CategoryOption[];
}

export function BlogForm({ blogId, initial, categories }: BlogFormProps) {
  const router = useRouter();
  const isEditing = !!blogId;

  const [title, setTitle] = useState(initial?.title || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [content, setContent] = useState(initial?.content || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl);
  const [coverImagePublicId, setCoverImagePublicId] = useState(initial?.coverImagePublicId);
  const [status, setStatus] = useState<BlogInput['status']>(initial?.status || 'active');
  const [publishedAt, setPublishedAt] = useState(initial?.publishedAt ? initial.publishedAt.slice(0, 10) : '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addTag() {
    const v = tagInput.trim().toLowerCase();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'blogs');
      setCoverImageUrl(result.url);
      setCoverImagePublicId(result.publicId);
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
      const res = await fetch(isEditing ? `/api/admin/blogs/${blogId}` : '/api/admin/blogs', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category: category || undefined,
          tags,
          coverImageUrl,
          coverImagePublicId,
          status,
          publishedAt: publishedAt || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Could not save post');
        return;
      }
      toast.success(isEditing ? 'Post updated' : 'Post created');
      router.push('/admin/blogs');
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
            <div className="relative h-20 w-32 overflow-hidden rounded-md bg-bg-secondary">
              {coverImageUrl && <Image src={coverImageUrl} alt="" fill className="object-cover" />}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-text-primary" /> : <Camera className="h-5 w-5 text-text-primary" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <p className="text-sm text-text-muted">Cover image</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              required
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              required
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
              placeholder="Write in plain paragraphs — each line break starts a new paragraph."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Category</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Publish Date</label>
              <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
              <p className="mt-1 text-xs text-text-muted">Leave blank to save as a draft.</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g. grooming"
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as BlogInput['status'])} className="max-w-xs">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-display text-lg text-text-primary">SEO</h2>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">SEO Title</label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">SEO Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              maxLength={160}
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/blogs')}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {isEditing ? 'Save Changes' : 'Publish Post'}
        </Button>
      </div>
    </form>
  );
}
