import { Injectable } from '@nestjs/common';
import type { HttpClientPort, HttpGetOptions } from './http-client.port';

/** Low-level `fetch` adapter implementing `HttpClientPort`; consolidate retries/pooling here in a future HTTP hardening PR. */

const DEFAULT_TIMEOUT_MS = 5000;

@Injectable()
export class FetchHttpClient implements HttpClientPort {
  async get<T>(url: string, options?: HttpGetOptions): Promise<T> {
    const res = await this.fetchOkResponse(url, options);
    return (await res.json()) as T;
  }

  async getText(url: string, options?: HttpGetOptions): Promise<string> {
    const res = await this.fetchOkResponse(url, options);
    return await res.text();
  }

  private async fetchOkResponse(url: string, options?: HttpGetOptions): Promise<Response> {
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
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        ...(options?.headers !== undefined && Object.keys(options.headers).length > 0
          ? { headers: options.headers }
          : {}),
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      return res;
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === 'AbortError'
      ) {
        throw new Error(`HTTP timeout after ${DEFAULT_TIMEOUT_MS}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
