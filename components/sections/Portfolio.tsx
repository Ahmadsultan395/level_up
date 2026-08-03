import Link from "next/link";
import Image from "next/image";
import type { IProject } from "@/models/Project";

export default function Portfolio({ projects }: { projects: IProject[] }) {
  if (!projects.length) return null;

  return (
    <section className="bg-dark-50/40 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Portfolio</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Recent Work</h2>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-dark underline underline-offset-4 hover:text-primary">
            See all projects
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-dark"
            >
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-dark-300">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/10 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{project.category}</span>
                <h3 className="mt-1 font-display text-lg font-bold text-white">{project.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
