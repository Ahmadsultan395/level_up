"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Loader";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "9" });
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    if (data.success) {
      setProjects(data.data);
      setPages(data.meta.pages);
      const cats = Array.from(new Set(data.data.map((p: any) => p.category))) as string[];
      setCategories((prev) => Array.from(new Set([...prev, ...cats])));
    }
    setLoading(false);
  }, [page, category, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Portfolio</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-dark sm:text-4xl">Our Projects</h1>
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
            placeholder="Search projects..."
            className="w-full rounded-full border border-dark-100 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setPage(1);
              setCategory("");
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${!category ? "bg-dark text-white" : "bg-dark-50 text-dark-300"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setPage(1);
                setCategory(c);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${category === c ? "bg-dark text-white" : "bg-dark-50 text-dark-300"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" description="Try a different search or category." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project._id} href={`/projects/${project.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-dark">
                {project.image ? (
                  <Image src={project.image} alt={project.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-dark-300">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{project.category}</span>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">{project.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
