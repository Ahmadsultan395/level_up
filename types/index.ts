export type Status = "active" | "inactive";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "editor";
}
