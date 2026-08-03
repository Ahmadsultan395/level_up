import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, icon: Icon = Inbox }: { title: string; description?: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dark-100 bg-dark-50/40 px-6 py-16 text-center">
      <Icon size={40} className="mb-4 text-dark-200" />
      <h3 className="text-base font-semibold text-dark">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-dark-300">{description}</p>}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onChange
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="px-3 text-sm text-dark-300">
        Page {page} of {pages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}
