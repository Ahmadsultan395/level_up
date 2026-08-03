import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Job from "@/models/Job";
import JobApplyForm from "@/components/sections/JobApplyForm";
import { isDeadlinePassed } from "@/utils/helpers";

interface Props {
  params: { slug: string };
}

export const metadata = { title: "Apply Now" };

export default async function JobApplyPage({ params }: Props) {
  await connectDB();
  const job: any = await Job.findOne({ slug: params.slug }).lean();
  if (!job || isDeadlinePassed(job.deadline) || job.status === "closed") notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
      <Link href={`/jobs/${job.slug}`} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark-300 hover:text-dark">
        <ArrowLeft size={16} /> Back to job details
      </Link>
      <h1 className="font-display text-2xl font-extrabold text-dark sm:text-3xl">Apply for {job.jobTitle}</h1>
      <p className="mt-2 text-dark-300">at {job.companyName}</p>
      <div className="mt-8">
        <JobApplyForm jobId={job._id.toString()} jobTitle={job.jobTitle} />
      </div>
    </div>
  );
}
