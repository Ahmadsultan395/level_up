"use client";

import { useState } from "react";
import Image from "next/image";
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
import { teamSchema } from "@/validation/teamValidation";

interface TeamRow {
  _id: string;
  name: string;
  designation: string;
  bio: string;
  photo: string;
  email: string;
  socialLinks: { linkedin?: string; twitter?: string; instagram?: string; facebook?: string };
  order: number;
  status: "active" | "inactive";
}

const emptyValues = {
  name: "", designation: "", bio: "", photo: "", email: "",
  socialLinks: { linkedin: "", twitter: "", instagram: "", facebook: "" },
  order: 0, status: "active" as const
};

export default function TeamAdminPage() {
  const { items, loading, page, pages, setPage, search, setSearch, create, update, remove } = useCrud<TeamRow>({ endpoint: "/api/team", limit: 8 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);

  const columns: Column<TeamRow>[] = [
    {
      header: "Member",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-dark-50">
            {r.photo ? <Image src={r.photo} alt={r.name} fill className="object-cover" /> : null}
          </div>
          <span className="font-medium text-dark">{r.name}</span>
        </div>
      )
    },
    { header: "Designation", render: (r) => r.designation },
    { header: "Order", render: (r) => r.order },
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
        title="Team"
        description="Manage team members shown on the Team page"
        action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Add Member</Button>}
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
        emptyTitle="No team members yet"
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? "Edit Member" : "Add Team Member"} size="lg">
        <Formik
          initialValues={editing || emptyValues}
          validationSchema={teamSchema}
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
                  <label className="mb-1.5 block text-sm font-medium text-dark">Name</label>
                  <Field name="name" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="name" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Designation</label>
                  <Field name="designation" placeholder="e.g. Lead Designer" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <ErrorMessage name="designation" component="p" className="mt-1 text-xs text-red-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Email</label>
                  <Field name="email" type="email" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Display Order</label>
                  <Field name="order" type="number" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <ImageUploadField label="Photo" value={values.photo} onChange={(url) => setFieldValue("photo", url)} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Bio</label>
                <RichTextEditor value={values.bio} onChange={(html) => setFieldValue("bio", html)} placeholder="Short bio..." />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">LinkedIn</label>
                  <Field name="socialLinks.linkedin" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Twitter / X</label>
                  <Field name="socialLinks.twitter" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Instagram</label>
                  <Field name="socialLinks.instagram" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Facebook</label>
                  <Field name="socialLinks.facebook" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark">Status</label>
                <Field as="select" name="status" className="w-full rounded-xl border border-dark-100 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Field>
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full">
                {editing ? "Update Member" : "Add Member"}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
