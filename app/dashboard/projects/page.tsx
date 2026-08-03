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
import { projectSchema } from "@/validation/projectValidation";
import { truncateHtml } from "@/utils/helpers";

interface ProjectRow {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  clientName: string;
  projectLink: string;
}

const emptyValues = { title: "", description: "", category: "", image: "", clientName: "", projectLink: "" };

export default function ProjectsAdminPage() {
  const { items, loading, page, pages, setPage, search, setSearch, create, update, remove } = useCrud<ProjectRow>({ endpoint: "/api/projects", limit: 8 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRow | null>(null);

  const columns: Column<ProjectRow>[] = [
    { header: "Title", render: (r) => <span className="font-medium text-dark">{r.title}</span> },
    { header: "Client", render: (r) => r.clientName || "—" },
    { header: "Category", render: (r) => r.category },
    { header: "Description", render: (r) => <span className="text-dark-300">{truncateHtml(r.description, 50)}</span> }
  ];

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Manage your portfolio / case studies"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Add Project</Button>}
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
        emptyTitle="No projects yet"
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Edit Project" : "Add Project"} size="lg">
        <Formik
          initialValues={editing ? { title: editing.title, description: editing.description, category: editing.category, image: editing.image, clientName: editing.clientName, projectLink: editing.projectLink } : emptyValues}
          validationSchema={projectSchema}
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
                  <Field name="category" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="category" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Client Name</label>
                  <Field name="clientName" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Project Link</label>
                  <Field name="projectLink" placeholder="https://" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="projectLink" component="p" className="mt-1 text-xs text-red-500" />
                </div>
              </div>

              <ImageUploadField label="Project Image" value={values.image} onChange={(url) => setFieldValue("image", url)} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Description</label>
                <RichTextEditor value={values.description} onChange={(html) => setFieldValue("description", html)} placeholder="Describe this project..." />
                <ErrorMessage name="description" component="p" className="mt-1 text-xs text-red-500" />
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full">
                {editing ? "Update Project" : "Create Project"}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
