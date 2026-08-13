import { SkeletonTable } from '@/components/shared/States';

export default function Loading() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <SkeletonTable rows={6} cols={3} />
      </div>
    </main>
  );
}
