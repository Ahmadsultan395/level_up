import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { ContactMessage } from '@/models/ContactMessage';
import { MessageDetailPanel } from '@/components/admin/MessageDetailPanel';

export const metadata: Metadata = { title: 'Message | Admin' };

export default async function AdminMessageDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  const message = await ContactMessage.findById(params.id).lean();
  if (!message) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/admin/messages" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Messages
      </Link>

      <div className="mt-6">
        <MessageDetailPanel
          message={{
            _id: message._id.toString(),
            name: message.name,
            email: message.email,
            phone: message.phone,
            subject: message.subject,
            message: message.message,
            status: message.status,
            createdAt: message.createdAt.toISOString(),
            replies: message.replies.map((r) => ({
              message: r.message ?? '',
              repliedBy: r.repliedBy ?? '',
              repliedAt: r.repliedAt ? r.repliedAt.toISOString() : new Date().toISOString(),
            })),
          }}
        />
      </div>
    </div>
  );
}
