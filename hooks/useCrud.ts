"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UseCrudOptions {
  endpoint: string;
  limit?: number;
}

export function useCrud<T = any>({ endpoint, limit = 10 }: UseCrudOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`${endpoint}?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setPages(data.meta?.pages || 1);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const create = async (payload: any) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast.success("Created successfully");
    fetchItems();
    return data.data;
  };

  const update = async (id: string, payload: any) => {
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast.success("Updated successfully");
    fetchItems();
    return data.data;
  };

  const remove = async (id: string) => {
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast.success("Deleted successfully");
    fetchItems();
  };

  return { items, loading, page, pages, setPage, search, setSearch, create, update, remove, refetch: fetchItems };
}
