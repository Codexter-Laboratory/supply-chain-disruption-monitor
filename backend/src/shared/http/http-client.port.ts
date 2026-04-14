export interface HttpClientPort {
  get<T>(
    url: string,
    options?: {
      headers?: Record<string, string>;
      query?: Record<string, string | number>;
    },
  ): Promise<T>;
}
