/**
 * Meta information for paginated responses
 */
export interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic pagination response wrapper to be reused across modules
 */
export interface PaginationResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
