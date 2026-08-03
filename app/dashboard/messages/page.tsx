"use client";

import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import { useCrud } from "@/hooks/useCrud";
import { formatDate } from "@/utils/helpers";

interface MessageRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesAdminPage() {
  const { items, loading, page, pages, setPage, search, setSearch, update, remove } = useCrud<MessageRow>({ endpoint: "/api/contact", limit: 10 });

  const columns: Column<MessageRow>[] = [
    {
      header: "From",
      render: (r) => (
        <div>
          <p className="font-medium text-dark">{r.name}</p>
          <p className="text-xs text-dark-300">{r.email}</p>
        </div>
      )
    },
    { header: "Phone", render: (r) => r.phone || "—" },
    { header: "Message", render: (r) => <span className="line-clamp-2 max-w-xs text-dark-300">{r.message}</span> },
    { header: "Received", render: (r) => formatDate(r.createdAt) },
    {
      header: "Status",
      render: (r) => (
        <button
          onClick={async () => { try { await update(r._id, { read: !r.read }); } catch (e: any) { toast.error(e.message); } }}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.read ? "bg-dark-100 text-dark-300" : "bg-primary/15 text-primary-700"}`}
        >
          {r.read ? "Read" : "Unread"}
        </button>
      )
    }
  ];

  return (
    <div>
      <AdminPageHeader title="Contact Messages" description="Messages submitted through your contact form" />
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
        emptyTitle="No messages yet"
      />
    </div>
  );
}
