import { Injectable } from '@nestjs/common';
import type { HttpClientPort } from './http-client.port';

@Injectable()
export class FetchHttpClient implements HttpClientPort {
  private static readonly DEFAULT_TIMEOUT_MS = 5000;

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
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      FetchHttpClient.DEFAULT_TIMEOUT_MS,
    );

    let res: Response;
    try {
      res = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        ...(options?.headers !== undefined && Object.keys(options.headers).length > 0
          ? { headers: options.headers }
          : {}),
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`HTTP timeout after ${FetchHttpClient.DEFAULT_TIMEOUT_MS}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    return (await res.json()) as T;
  }
}
