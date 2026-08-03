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
import { useCrud } from "@/hooks/useCrud";
import { serviceSchema } from "@/validation/serviceValidation";
import { truncateHtml } from "@/utils/helpers";

interface ServiceRow {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "inactive";
}

const emptyValues = { title: "", description: "", icon: "", category: "", status: "active" as const };

export default function ServicesAdminPage() {
  const { items, loading, page, pages, setPage, search, setSearch, create, update, remove } = useCrud<ServiceRow>({ endpoint: "/api/services", limit: 8 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);

  const columns: Column<ServiceRow>[] = [
    { header: "Title", render: (r) => <span className="font-medium text-dark">{r.title}</span> },
    { header: "Category", render: (r) => r.category },
    { header: "Description", render: (r) => <span className="text-dark-300">{truncateHtml(r.description, 60)}</span> },
    {
      header: "Status",
      render: (r) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "active" ? "bg-green-100 text-green-700" : "bg-dark-100 text-dark-300"}`}>
          {r.status}
        </span>
      )
    }
  ];

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Manage the services shown on your website"
        action={
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={16} /> Add Service
          </Button>
        }
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
        onDelete={async (row) => {
          try { await remove(row._id); } catch (e: any) { toast.error(e.message); }
        }}
        rowKey={(r) => r._id}
        emptyTitle="No services yet"
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Edit Service" : "Add Service"} size="lg">
        <Formik
          initialValues={editing ? { title: editing.title, description: editing.description, icon: "", category: editing.category, status: editing.status } : emptyValues}
          validationSchema={serviceSchema}
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
                  <label className="mb-1.5 block text-sm font-medium text-dark">Title</label>
                  <Field name="title" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="title" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Category</label>
                  <Field name="category" placeholder="e.g. Branding" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="category" component="p" className="mt-1 text-xs text-red-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Description</label>
                <RichTextEditor value={values.description} onChange={(html) => setFieldValue("description", html)} placeholder="Describe this service..." />
                <ErrorMessage name="description" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Status</label>
                <Field as="select" name="status" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Field>
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full">
                {editing ? "Update Service" : "Create Service"}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
