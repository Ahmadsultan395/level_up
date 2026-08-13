'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Camera, Loader2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { WorkingHoursEditor } from '@/components/admin/WorkingHoursEditor';
import { uploadFile } from '@/lib/upload-client';
import { DEFAULT_WORKING_HOURS, type BarberInput } from '@/validations/barber';

interface ServiceOption {
  _id: string;
  name: string;
}

interface BarberFormProps {
  barberId?: string; // present when editing
  initial?: Partial<BarberInput>;
  allServices: ServiceOption[];
}

export function BarberForm({ barberId, initial, allServices }: BarberFormProps) {
  const router = useRouter();
  const isEditing = !!barberId;

  const [name, setName] = useState(initial?.name || '');
  const [bio, setBio] = useState(initial?.bio || '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>(initial?.specialties || []);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [experienceYears, setExperienceYears] = useState(initial?.experienceYears ?? 0);
  const [selectedServices, setSelectedServices] = useState<string[]>(initial?.services || []);
  const [workingHours, setWorkingHours] = useState<BarberInput['workingHours']>(
    initial?.workingHours || DEFAULT_WORKING_HOURS
  );
  const [vacations, setVacations] = useState<BarberInput['vacations']>(initial?.vacations || []);
  const [socialLinks, setSocialLinks] = useState<BarberInput['socialLinks']>(initial?.socialLinks || []);
  const [status, setStatus] = useState<'active' | 'inactive'>(initial?.status || 'active');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const result = await uploadFile(file, 'barbers');
      setImageUrl(result.url);
      setImagePublicId(result.publicId);
    } catch {
      toast.error('Could not upload image');
    } finally {
      setIsUploadingImage(false);
    }
  }

  function addSpecialty() {
    const v = specialtyInput.trim();
    if (v && !specialties.includes(v)) setSpecialties([...specialties, v]);
    setSpecialtyInput('');
  }

  function toggleService(id: string) {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function addVacation() {
    setVacations([...vacations, { startDate: '', endDate: '', reason: '' }]);
  }
  function updateVacation(i: number, updates: Partial<BarberInput['vacations'][number]>) {
    setVacations(vacations.map((v, idx) => (idx === i ? { ...v, ...updates } : v)));
  }
  function removeVacation(i: number) {
    setVacations(vacations.filter((_, idx) => idx !== i));
  }

  function addSocialLink() {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  }
  function updateSocialLink(i: number, updates: Partial<{ platform: string; url: string }>) {
    setSocialLinks(socialLinks.map((s, idx) => (idx === i ? { ...s, ...updates } : s)));
  }
  function removeSocialLink(i: number) {
    setSocialLinks(socialLinks.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      bio,
      imageUrl,
      imagePublicId,
      specialties,
      experienceYears,
      services: selectedServices,
      workingHours,
      vacations,
      socialLinks,
      status,
    };

    setIsSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/barbers/${barberId}` : '/api/admin/barbers', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error || 'Could not save barber');
        return;
      }

      toast.success(isEditing ? 'Barber updated' : 'Barber added');
      router.push('/admin/barbers');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-display text-lg text-text-primary">Basic Information</h2>

          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-bg-secondary">
              {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" />}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-bg-overlay opacity-0 transition-opacity hover:opacity-100"
              >
                {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin text-text-primary" /> : <Camera className="h-5 w-5 text-text-primary" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <p className="text-sm text-text-muted">Click the photo to upload</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Barber's full name" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
              className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-text-primary outline-none focus:border-gold"
              placeholder="Experience, style, specialties..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Experience (years)</label>
              <Input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Specialties</label>
            <div className="flex gap-2">
              <Input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
                placeholder="e.g. Fades, Beard Sculpting"
              />
              <Button type="button" variant="secondary" onClick={addSpecialty}>
                Add
              </Button>
            </div>
            {specialties.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary">
                    {s}
                    <button type="button" onClick={() => setSpecialties(specialties.filter((x) => x !== s))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-display text-lg text-text-primary">Services Offered</h2>
          {allServices.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">No services exist yet. Create services first.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {allServices.map((s) => (
                <label key={s._id} className="flex items-center gap-2 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(s._id)}
                    onChange={() => toggleService(s._id)}
                    className="h-4 w-4 accent-[var(--color-gold)]"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-display text-lg text-text-primary">Working Hours</h2>
          <div className="mt-3">
            <WorkingHoursEditor value={workingHours} onChange={setWorkingHours} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text-primary">Vacations</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addVacation}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {vacations.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={v.startDate}
                  onChange={(e) => updateVacation(i, { startDate: e.target.value })}
                  className="h-9 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary"
                />
                <span className="text-text-muted">to</span>
                <input
                  type="date"
                  value={v.endDate}
                  onChange={(e) => updateVacation(i, { endDate: e.target.value })}
                  className="h-9 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary"
                />
                <Input
                  value={v.reason || ''}
                  onChange={(e) => updateVacation(i, { reason: e.target.value })}
                  placeholder="Reason (optional)"
                  className="max-w-[10rem]"
                />
                <button type="button" onClick={() => removeVacation(i)} aria-label="Remove vacation">
                  <X className="h-4 w-4 text-text-muted hover:text-status-danger" />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text-primary">Social Links</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addSocialLink}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {socialLinks.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={s.platform}
                  onChange={(e) => updateSocialLink(i, { platform: e.target.value })}
                  placeholder="Instagram"
                  className="max-w-[8rem]"
                />
                <Input
                  value={s.url}
                  onChange={(e) => updateSocialLink(i, { url: e.target.value })}
                  placeholder="https://..."
                />
                <button type="button" onClick={() => removeSocialLink(i)} aria-label="Remove link">
                  <X className="h-4 w-4 text-text-muted hover:text-status-danger" />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/barbers')}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {isEditing ? 'Save Changes' : 'Add Barber'}
        </Button>
      </div>
    </form>
  );
}
