"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/common/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useCrud } from "@/hooks/useCrud";
import { jobSchema } from "@/validation/jobValidation";
import { JOB_TYPES } from "@/utils/constants";
import { formatDate } from "@/utils/helpers";

interface JobRow {
  _id: string;
  jobTitle: string;
  companyName: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  jobType: string;
  posterImage: string;
  deadline: string;
  status: "open" | "closed";
}

const emptyValues = {
  jobTitle: "", companyName: "", description: "", requirements: "", salary: "",
  location: "", jobType: "Full-time" as const, posterImage: "",
  deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  status: "open" as const
};

export default function JobsAdminPage() {
  const { items, loading, page, pages, setPage, search, setSearch, create, update, remove } = useCrud<JobRow>({ endpoint: "/api/jobs", limit: 8 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobRow | null>(null);

  const columns: Column<JobRow>[] = [
    { header: "Title", render: (r) => <span className="font-medium text-dark">{r.jobTitle}</span> },
    { header: "Company", render: (r) => r.companyName },
    { header: "Type", render: (r) => r.jobType },
    { header: "Deadline", render: (r) => formatDate(r.deadline) },
    {
      header: "Status",
      render: (r) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "open" ? "bg-green-100 text-green-700" : "bg-dark-100 text-dark-300"}`}>
          {r.status}
        </span>
      )
    }
  ];

  return (
    <div>
      <AdminPageHeader
        title="Jobs"
        description="Post and manage job openings"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Post Job</Button>}
      />

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        search={search}
        onSearch={setSearch}
        page={page}
        pages={pages}
        onPageChange={setPage}
        onEdit={(row) => { setEditing(row); setModalOpen(true); }}
        onDelete={async (row) => { try { await remove(row._id); } catch (e: any) { toast.error(e.message); } }}
        rowKey={(r) => r._id}
        emptyTitle="No jobs posted yet"
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Edit Job" : "Post Job"} size="xl">
        <Formik
          initialValues={
            editing
              ? { ...editing, deadline: new Date(editing.deadline).toISOString().slice(0, 10) }
              : emptyValues
          }
          validationSchema={jobSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              if (editing) await update(editing._id, values);
              else await create(values);
              resetForm();
              setModalOpen(false);
            } catch (err: any) {
              toast.error(err.message || "Something went wrong");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Job Title</label>
                  <Field name="jobTitle" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="jobTitle" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Company Name</label>
                  <Field name="companyName" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="companyName" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Location</label>
                  <Field name="location" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="location" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Job Type</label>
                  <Field as="select" name="jobType" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Salary</label>
                  <Field name="salary" placeholder="e.g. $60k - $80k" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Deadline</label>
                  <Field name="deadline" type="date" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="deadline" component="p" className="mt-1 text-xs text-red-500" />
                </div>
              </div>

              <ImageUploadField label="Job Poster" value={values.posterImage} onChange={(url) => setFieldValue("posterImage", url)} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Description</label>
                <RichTextEditor value={values.description} onChange={(html) => setFieldValue("description", html)} placeholder="Job description..." />
                <ErrorMessage name="description" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Requirements</label>
                <RichTextEditor value={values.requirements} onChange={(html) => setFieldValue("requirements", html)} placeholder="List the requirements..." />
                <ErrorMessage name="requirements" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Status</label>
                <Field as="select" name="status" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </Field>
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full">
                {editing ? "Update Job" : "Post Job"}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
