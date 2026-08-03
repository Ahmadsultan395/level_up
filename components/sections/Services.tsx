import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import RichHtml from "@/components/common/RichHtml";
import { truncateHtml } from "@/utils/helpers";
import type { IService } from "@/models/Service";

export default function Services({ services }: { services: IService[] }) {
  if (!services.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">What We Do</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Services Built For Growth</h2>
        </div>
        <Link href="/services" className="text-sm font-semibold text-dark underline underline-offset-4 hover:text-primary">
          View all services
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service._id}
            href={`/services#${service.slug}`}
            className="group rounded-2xl border border-dark-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary-700 group-hover:bg-primary group-hover:text-dark">
              {service.title.charAt(0)}
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-dark">{service.title}</h3>
            <p className="mt-2 text-sm text-dark-300">{truncateHtml(service.description, 90)}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-dark-300 group-hover:text-primary-700">
              Learn more <ArrowUpRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
