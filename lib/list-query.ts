import type { Model, FilterQuery, SortOrder, PopulateOptions } from 'mongoose';
import type { ListQueryParams, PaginatedResponse } from '@/types/common';

interface BuildListOptions {
  /** Fields eligible for direct equality filtering, e.g. ['status', 'category', 'barber'] */
  filterFields?: string[];
  /** Fields to regex-search when no text index is used (fallback / small collections) */
  searchFields?: string[];
  /** Use MongoDB $text search instead of regex (requires a text index on the model) */
  useTextSearch?: boolean;
  /** Default sort field if none provided */
  defaultSortBy?: string;
  /** Mongoose populate path(s), plain strings or { path, select } objects */
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
  /** Extra fixed filter merged into every query, e.g. { barber: barberId } */
  baseFilter?: FilterQuery<unknown>;
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Parses page/pageSize/search/filters/sort out of a Next.js request's
 * search params into a typed ListQueryParams object.
 */
export function parseListQuery(searchParams: URLSearchParams): ListQueryParams {
  const params: ListQueryParams = {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    pageSize: Math.min(MAX_PAGE_SIZE, Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE),
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };

  for (const [key, value] of searchParams.entries()) {
    if (!['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key) && value) {
      params[key] = value;
    }
  }

  return params;
}

/**
 * Runs a paginated, searchable, filterable, sortable query against any
 * Mongoose model and returns a consistent PaginatedResponse. This is the
 * single implementation every admin/customer/public list endpoint should
 * call, so pagination/search/filter behavior never drifts between modules.
 */
export async function buildListResponse<T>(
  model: Model<T>,
  query: ListQueryParams,
  options: BuildListOptions = {}
): Promise<PaginatedResponse<T>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const filter: FilterQuery<T> = { ...(options.baseFilter as FilterQuery<T>) };

  // Equality filters (status, category, barber, etc.)
  for (const field of options.filterFields ?? []) {
    const value = query[field];
    if (value !== undefined && value !== '' && value !== 'all') {
      (filter as Record<string, unknown>)[field] = value;
    }
  }

  // Date range filter convention: dateFrom / dateTo against a `date` or `createdAt` field
  if (query.dateFrom || query.dateTo) {
    const dateField = (query.dateField as string) || 'createdAt';
    (filter as Record<string, unknown>)[dateField] = {
      ...(query.dateFrom ? { $gte: new Date(query.dateFrom as string) } : {}),
      ...(query.dateTo ? { $lte: new Date(query.dateTo as string) } : {}),
    };
  }

  // Search
  if (query.search) {
    if (options.useTextSearch) {
      (filter as Record<string, unknown>).$text = { $search: query.search as string };
    } else if (options.searchFields?.length) {
      (filter as Record<string, unknown>).$or = options.searchFields.map((f) => ({
        [f]: { $regex: query.search, $options: 'i' },
      }));
    }
  }

  const sortBy = query.sortBy || options.defaultSortBy || 'createdAt';
  const sortOrder: SortOrder = query.sortOrder === 'asc' ? 1 : -1;

  let mongooseQuery = model
    .find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  if (options.populate) {
    mongooseQuery = mongooseQuery.populate(options.populate);
  }

  const [data, totalItems] = await Promise.all([
    mongooseQuery.exec(),
    model.countDocuments(filter),
  ]);

  return {
    data: data as unknown as T[],
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}
