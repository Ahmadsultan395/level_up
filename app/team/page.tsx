import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { TeamGrid } from "@/components/sections/Team";
import { EmptyState } from "@/components/common/EmptyState";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "Our Team" };
export const revalidate = 60;

export default async function TeamPage() {
  await connectDB();
  const team = await Team.find({ status: "active" }).sort("order").lean();

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Our Team</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Meet The People Behind Our Work</h1>
        <p className="mx-auto mt-3 max-w-xl text-dark-300">
          A team of designers, developers, and strategists dedicated to your success.
        </p>
      </div>

      {team.length === 0 ? (
        <EmptyState icon={Users} title="Team coming soon" description="We're putting the finishing touches on our team page." />
      ) : (
        <TeamGrid team={team as any} />
      )}
    </div>
  );
}
