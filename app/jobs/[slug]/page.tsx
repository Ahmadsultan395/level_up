import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Briefcase, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import RichHtml from "@/components/common/RichHtml";
import { Button } from "@/components/ui/button";
import { formatDate, isDeadlinePassed } from "@/utils/helpers";
import ImagePreview from "@/components/common/ImagePreview";

interface Props {
  params: { slug: string };
}

async function getJob(slug: string) {
  await connectDB();
  return Job.findOne({ slug }).lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job: any = await getJob(params.slug);
  if (!job) return { title: "Job not found" };
  return { title: job.jobTitle, description: job.companyName };
}

export default async function JobDetailPage({ params }: Props) {
  const job: any = await getJob(params.slug);
  if (!job) notFound();

  const closed = isDeadlinePassed(job.deadline) || job.status === "closed";

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <Link
        href="/jobs"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark-300 hover:text-dark"
      >
        <ArrowLeft size={16} /> Back to jobs
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-dark sm:text-4xl">
            {job.jobTitle}
          </h1>
          <p className="mt-1 text-dark-300">{job.companyName}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-dark-300">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase size={15} /> {job.jobType}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1.5">
                <DollarSign size={15} /> {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={15} /> Apply by {formatDate(job.deadline)}
            </span>
          </div>
        </div>
        {job.posterImage && (
          <ImagePreview src={job.posterImage} alt={job.jobTitle} />
        )}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-bold text-dark">
            Job Description
          </h2>
          <RichHtml html={job.description} className="mt-3" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-dark">
            Requirements
          </h2>
          <RichHtml html={job.requirements} className="mt-3" />
        </div>
      </div>

      <div className="mt-10">
        {closed ? (
          <Button disabled size="lg">
            Applications Closed
          </Button>
        ) : (
          <Link href={`/jobs/${job.slug}/apply`}>
            <Button size="lg">Apply For This Position</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
