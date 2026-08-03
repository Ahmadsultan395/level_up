import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loader({ fullscreen = false, className }: { fullscreen?: boolean; className?: string }) {
  if (fullscreen) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className={cn("animate-spin text-primary", className)} size={36} />
      </div>
    );
  }
  return <Loader2 className={cn("animate-spin text-primary", className)} size={20} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-dark-100/60", className)} />;
}
