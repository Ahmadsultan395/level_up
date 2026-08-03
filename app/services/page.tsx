import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import RichHtml from "@/components/common/RichHtml";
import { EmptyState } from "@/components/common/EmptyState";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = { title: "Services" };
export const revalidate = 60;

export default async function ServicesPage() {
  await connectDB();
  const services = await Service.find({ status: "active" }).sort("-createdAt").lean();

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Services</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">What We Offer</h1>
        <p className="mx-auto mt-3 max-w-xl text-dark-300">
          End-to-end digital services to help your brand launch, grow, and stand out.
        </p>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={Briefcase} title="No services yet" description="Check back soon — we're updating our services." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service: any) => (
            <div key={service._id} id={service.slug} className="scroll-mt-24 rounded-2xl border border-dark-100 bg-white p-7">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-700">
                {service.category}
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-dark">{service.title}</h2>
              <RichHtml html={service.description} className="mt-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
