/**
 * Shared status types used across the whole app so that Active/Inactive
 * and Approve/Reject behave identically in every module (spec section 17).
 */

/** Controls whether an entity is shown on the public site. */
export type VisibilityStatus = 'active' | 'inactive';

/** Moderation state for anything a non-admin user submits. */
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

/** Appointment lifecycle (spec section 10). */
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/** Payment lifecycle. */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

/** Contact message lifecycle (spec section 6). */
export type MessageStatus = 'new' | 'replied' | 'resolved' | 'archived';

/** Generic paginated API response shape — every list endpoint returns this. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** Generic query params every list endpoint accepts (search + filter + pagination + sort). */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  [key: string]: string | number | undefined;
}
