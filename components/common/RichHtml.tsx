import parse from "html-react-parser";
import { cn } from "@/lib/utils";

export default function RichHtml({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={cn("prose prose-sm max-w-none text-dark-300", className)}>{parse(html)}</div>;
}
