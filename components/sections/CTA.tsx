import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-dark/10 blur-2xl" />
        <h2 className="relative font-display text-3xl font-extrabold text-dark sm:text-4xl">Have a project in mind?</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-dark-700">
          Let&apos;s talk about how we can help bring your idea to life — from strategy to launch.
        </p>
        <Link
          href="/contact"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-dark px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          Get In Touch <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
