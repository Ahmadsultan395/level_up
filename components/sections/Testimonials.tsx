import Image from "next/image";
import { Star, Quote } from "lucide-react";
import RichHtml from "@/components/common/RichHtml";
import type { ITestimonial } from "@/models/Testimonial";

export default function Testimonials({ testimonials }: { testimonials: ITestimonial[] }) {
  if (!testimonials.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Testimonials</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">What Clients Say</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t._id} className="rounded-2xl border border-dark-100 bg-white p-6">
            <Quote className="text-primary" size={24} />
            <RichHtml html={t.feedback} className="mt-3 text-sm text-dark-300" />
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={14} className="fill-primary text-primary" />
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              {t.clientPhoto ? (
                <Image src={t.clientPhoto} alt={t.clientName} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary-700">
                  {t.clientName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-dark">{t.clientName}</p>
                <p className="text-xs text-dark-300">{t.clientRole}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
