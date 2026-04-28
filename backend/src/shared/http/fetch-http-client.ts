import { Injectable } from '@nestjs/common';
import type { HttpClientPort } from './http-client.port';

@Injectable()
export class FetchHttpClient implements HttpClientPort {
  async get<T>(
    url: string,
    options?: {
      headers?: Record<string, string>;
      query?: Record<string, string | number>;
    },
  ): Promise<T> {
    const queryString =
      options?.query !== undefined && Object.keys(options.query).length > 0
        ? `?${Object.entries(options.query)
            .map(
              ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
            )
            .join('&')}`
        : '';

    const fullUrl = `${url}${queryString}`;

    const res = await fetch(fullUrl, {
      method: 'GET',
      ...(options?.headers !== undefined && Object.keys(options.headers).length > 0
        ? { headers: options.headers }
        : {}),
    });

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    return (await res.json()) as T;
  }
}
