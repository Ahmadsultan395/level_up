import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/States';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-6">
      <EmptyState
        title="This page doesn't exist"
        description="The page you're looking for may have been moved or removed."
        action={
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        }
      />
    </main>
  );
}
