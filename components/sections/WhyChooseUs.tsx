import { ShieldCheck, Zap, Users2, TrendingUp } from "lucide-react";
import type { IWhyChooseUsItem } from "@/models/Settings";

const fallbackIcons = [ShieldCheck, Zap, Users2, TrendingUp];
const defaultItems: IWhyChooseUsItem[] = [
  { title: "Proven Expertise", description: "Years of experience delivering results across industries.", icon: "ShieldCheck" },
  { title: "Fast Turnaround", description: "Agile process that gets your product to market quickly.", icon: "Zap" },
  { title: "Dedicated Team", description: "A team that treats your product like their own.", icon: "Users2" },
  { title: "Growth Focused", description: "Every decision tied back to measurable business impact.", icon: "TrendingUp" }
];

export default function WhyChooseUs({ items }: { items?: IWhyChooseUsItem[] }) {
  const data = items && items.length ? items : defaultItems;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Why Choose Us</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Built On Trust &amp; Results</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item, i) => {
          const Icon = fallbackIcons[i % fallbackIcons.length];
          return (
            <div key={i} className="rounded-2xl bg-dark p-6 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-dark">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-dark-100">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
