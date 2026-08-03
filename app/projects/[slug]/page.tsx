import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import RichHtml from "@/components/common/RichHtml";

interface Props {
  params: { slug: string };
}

async function getProject(slug: string) {
  await connectDB();
  return Project.findOne({ slug }).lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project: any = await getProject(params.slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.category };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project: any = await getProject(params.slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <Link href="/projects" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark-300 hover:text-dark">
        <ArrowLeft size={16} /> Back to projects
      </Link>

      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-700">{project.category}</span>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-dark sm:text-4xl">{project.title}</h1>

      <div className="mt-4 flex flex-wrap gap-6 text-sm text-dark-300">
        {project.clientName && <span>Client: <strong className="text-dark">{project.clientName}</strong></span>}
        {project.projectLink && (
          <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-700 hover:underline">
            Visit live site <ExternalLink size={14} />
          </a>
        )}
      </div>

      {project.image && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={project.image} alt={project.title} fill className="object-cover" />
        </div>
      )}

      <RichHtml html={project.description} className="mt-8 text-base" />
    </div>
  );
}
