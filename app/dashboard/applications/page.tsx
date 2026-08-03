"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import { useCrud } from "@/hooks/useCrud";
import { formatDate } from "@/utils/helpers";

interface ApplicationRow {
  _id: string;
  applicantName: string;
  email: string;
  phone: string;
  cvUrl: string;
  message: string;
  appliedJob: { jobTitle: string } | null;
  createdAt: string;
}

export default function ApplicationsAdminPage() {
  const { items, loading, page, pages, setPage, search, setSearch, remove } = useCrud<ApplicationRow>({ endpoint: "/api/applications", limit: 10 });

  const columns: Column<ApplicationRow>[] = [
    { header: "Applicant", render: (r) => <span className="font-medium text-dark">{r.applicantName}</span> },
    { header: "Job", render: (r) => r.appliedJob?.jobTitle || "—" },
    { header: "Email", render: (r) => r.email },
    { header: "Phone", render: (r) => r.phone },
    { header: "Applied", render: (r) => formatDate(r.createdAt) },
    {
      header: "CV",
      render: (r) => (
        <a href={r.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-700 hover:underline">
          <Download size={14} /> Download
        </a>
      )
    }
  ];

  return (
    <div>
      <AdminPageHeader title="Job Applications" description="Applicants who applied for open positions" />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        search={search}
        onSearch={setSearch}
        page={page}
        pages={pages}
        onPageChange={setPage}
        onDelete={async (row) => { try { await remove(row._id); } catch (e: any) { toast.error(e.message); } }}
        rowKey={(r) => r._id}
        emptyTitle="No applications yet"
      />
    </div>
  );
}
