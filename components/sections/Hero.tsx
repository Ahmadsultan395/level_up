import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import RichHtml from "@/components/common/RichHtml";
import type { IHeroSection } from "@/models/HeroSection";

export default function Hero({ hero }: { hero: IHeroSection | null }) {
  const heading = hero?.heading || "We Build Digital Experiences That Grow Brands";
  const description =
    hero?.description ||
    "<p>A full-service digital agency helping ambitious businesses design, build, and launch products people love.</p>";
  const buttonText = hero?.buttonText || "Start a Project";
  const buttonLink = hero?.buttonLink || "/contact";

  return (
    <section className="relative overflow-hidden bg-dark text-white">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles size={14} /> Digital Agency
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <div className="mt-5 max-w-lg text-dark-100">
            <RichHtml html={description} className="text-dark-100 [&_a]:text-primary" />
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={buttonLink}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary-400 hover:shadow-primary/40"
            >
              {buttonText}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/50"
            >
              View Our Work
            </Link>
          </div>
        </div>

        <div className="relative animate-fadeUp [animation-delay:150ms]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-dark-600 shadow-2xl">
            {hero?.bannerImage ? (
              <Image src={hero.bannerImage} alt={heading} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-600 to-dark-800 text-dark-200">
                Banner Image
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
