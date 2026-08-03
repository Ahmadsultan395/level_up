"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Clock, Search } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Loader";
import { formatDate, isDeadlinePassed } from "@/utils/helpers";
import { JOB_TYPES } from "@/utils/constants";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobType, setJobType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "9", status: "open" });
    if (jobType) params.set("jobType", jobType);
    if (search) params.set("search", search);
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    if (data.success) {
      setJobs(data.data);
      setPages(data.meta.pages);
    }
    setLoading(false);
  }, [page, jobType, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Careers</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Open Positions</h1>
      </div>

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search jobs..."
            className="w-full rounded-full border border-dark-100 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setPage(1); setJobType(""); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${!jobType ? "bg-dark text-white" : "bg-dark-50 text-dark-300"}`}
          >
            All
          </button>
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setPage(1); setJobType(t); }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${jobType === t ? "bg-dark text-white" : "bg-dark-50 text-dark-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No open positions" description="Check back soon for new opportunities." />
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/jobs/${job.slug}`}
                className="flex flex-col gap-3 rounded-2xl border border-dark-100 bg-white p-6 transition-all hover:border-primary hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-display text-lg font-bold text-dark">{job.jobTitle}</h3>
                  <p className="text-sm text-dark-300">{job.companyName}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-dark-300">
                    <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={13} /> {job.jobType}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> Apply by {formatDate(job.deadline)}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                    isDeadlinePassed(job.deadline) ? "bg-dark-50 text-dark-300" : "bg-primary text-dark"
                  }`}
                >
                  {isDeadlinePassed(job.deadline) ? "Closed" : "Apply Now"}
                </span>
              </Link>
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
