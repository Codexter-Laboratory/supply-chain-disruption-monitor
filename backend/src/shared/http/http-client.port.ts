export type HttpGetOptions = {
  readonly headers?: Record<string, string>;
  readonly query?: Record<string, string | number>;
};

export interface HttpClientPort {
  get<T>(url: string, options?: HttpGetOptions): Promise<T>;

  /** Response body as plain text (e.g. RSS/XML); same timeout/query/header behaviour as `get`. */
  getText(url: string, options?: HttpGetOptions): Promise<string>;
}
