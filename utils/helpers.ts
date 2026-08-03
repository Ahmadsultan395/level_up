export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function truncateHtml(html: string, maxLength = 150) {
  const text = html.replace(/<[^>]*>/g, "");
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function isDeadlinePassed(deadline: string | Date) {
  return new Date(deadline).getTime() < Date.now();
}
