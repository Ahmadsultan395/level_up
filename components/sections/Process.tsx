import type { IProcessStep } from "@/models/Settings";

const defaultProcess: IProcessStep[] = [
  { title: "Discussion", description: "We start by understanding your goals, audience, and challenges." },
  { title: "Planning", description: "We map out strategy, scope, and timeline before any design begins." },
  { title: "Designing", description: "Wireframes and visual design tailored to your brand." },
  { title: "Development", description: "Clean, scalable code built for performance." },
  { title: "Delivery", description: "Launch, handover, and ongoing support." }
];

export default function Process({ steps }: { steps?: IProcessStep[] }) {
  const data = steps && steps.length ? steps : defaultProcess;

  return (
    <section className="bg-dark-50/40 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Our Process</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">How We Work</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {data.map((step, i) => (
            <div key={i} className="relative">
              <span className="font-display text-4xl font-extrabold text-primary/30">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-base font-bold text-dark">{step.title}</h3>
              <p className="mt-2 text-sm text-dark-300">{step.description}</p>
              {i < data.length - 1 && (
                <span className="absolute right-[-1rem] top-4 hidden h-px w-8 bg-dark-100 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
