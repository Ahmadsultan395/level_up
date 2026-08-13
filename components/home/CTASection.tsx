import { BookCTA } from '@/components/public/BookCTA';
import { getPublicSiteSettings } from '@/lib/queries/public';

export async function CTASection() {
  const settings = await getPublicSiteSettings();

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-text-primary sm:text-4xl">
          Ready for your next great haircut?
        </h2>
        <p className="mt-4 text-text-secondary">
          {settings.contactPhone
            ? `Book online or call us at ${settings.contactPhone}.`
            : 'Book your appointment online in under a minute.'}
        </p>
        <BookCTA className="mt-8 inline-block" />
      </div>
    </section>
  );
}
