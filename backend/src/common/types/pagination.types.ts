/** Cursor-based page (GraphQL / API input). */
export interface PageInput {
  readonly cursor?: string;
  readonly limit: number;
}

/** Offset page for simple list UIs. */
export interface OffsetPageInput {
  readonly offset: number;
  readonly limit: number;
}

export interface PageInfo {
  readonly endCursor: string | null;
  readonly hasNextPage: boolean;
}

export interface OffsetPageMeta {
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
}
