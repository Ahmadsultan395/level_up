import type { Metadata } from "next";
import { getSettings } from "@/lib/getSettings";
import RichHtml from "@/components/common/RichHtml";
import { Target, Eye, BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">About Us</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Our Story</h1>
      </div>

      <div className="rounded-2xl border border-dark-100 bg-white p-8">
        <div className="flex items-center gap-2 text-primary-700">
          <BookOpen size={20} />
          <h2 className="font-display text-lg font-bold text-dark">Company Story</h2>
        </div>
        <RichHtml
          html={settings?.aboutStory || "<p>Our story starts with a simple idea: build digital products that genuinely help businesses grow.</p>"}
          className="mt-3"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-dark p-8 text-white">
          <div className="flex items-center gap-2 text-primary">
            <Target size={20} />
            <h2 className="font-display text-lg font-bold">Mission</h2>
          </div>
          <RichHtml html={settings?.aboutMission || "<p>To empower businesses through thoughtful digital design and technology.</p>"} className="mt-3 text-dark-100" />
        </div>
        <div className="rounded-2xl bg-primary p-8">
          <div className="flex items-center gap-2 text-dark">
            <Eye size={20} />
            <h2 className="font-display text-lg font-bold text-dark">Vision</h2>
          </div>
          <RichHtml html={settings?.aboutVision || "<p>To be the go-to digital partner for ambitious brands worldwide.</p>"} className="mt-3 text-dark-700" />
        </div>
      </div>
    </div>
  );
}
