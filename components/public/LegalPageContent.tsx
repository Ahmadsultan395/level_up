interface LegalPageContentProps {
  title: string;
  content?: string;
  fallback: string;
}

/** Renders CMS-editable legal content (Privacy/Terms/Refund), falling back to sensible boilerplate if not yet set in the admin panel. */
export function LegalPageContent({ title, content, fallback }: LegalPageContentProps) {
  const body = content || fallback;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-4xl text-text-primary">{title}</h1>
      <div className="mt-8 space-y-4 text-text-secondary">
        {body
          .split('\n')
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="leading-relaxed">
              {para}
            </p>
          ))}
      </div>
    </div>
  );
}
