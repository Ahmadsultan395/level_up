import type { Metadata } from 'next';
import { BeforeAfterManager } from '@/components/admin/BeforeAfterManager';

export const metadata: Metadata = { title: 'Before & After | Admin' };

export default function AdminBeforeAfterPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Before &amp; After</h1>
      <p className="mt-1 text-text-secondary">Showcase transformations.</p>
      <div className="mt-8">
        <BeforeAfterManager />
      </div>
    </div>
  );
}
