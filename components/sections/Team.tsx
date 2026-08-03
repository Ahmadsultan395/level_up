import Image from "next/image";
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react";
import type { ITeamMember } from "@/models/Team";

const socialIcons: Record<string, any> = { linkedin: Linkedin, twitter: Twitter, instagram: Instagram, facebook: Facebook };

export function TeamGrid({ team }: { team: ITeamMember[] }) {
  if (!team.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {team.map((member) => (
        <div key={member._id} className="group rounded-2xl border border-dark-100 bg-white p-5 text-center transition-shadow hover:shadow-xl">
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-dark-50">
            {member.photo ? (
              <Image src={member.photo} alt={member.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-700">
                {member.name.charAt(0)}
              </div>
            )}
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-dark">{member.name}</h3>
          <p className="text-xs font-medium text-primary-700">{member.designation}</p>
          <div className="mt-3 flex justify-center gap-2">
            {Object.entries(member.socialLinks || {}).map(([key, url]) => {
              const Icon = socialIcons[key];
              if (!url || !Icon) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-50 text-dark-300 hover:bg-primary hover:text-dark"
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamPreview({ team }: { team: ITeamMember[] }) {
  if (!team.length) return null;

  return (
    <section className="bg-dark-50/40 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Our Team</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">The People Behind The Work</h2>
        </div>
        <TeamGrid team={team.slice(0, 4)} />
      </div>
    </section>
  );
}
