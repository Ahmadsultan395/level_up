import { ReactNode } from "react";

export default function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-dark-300">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
