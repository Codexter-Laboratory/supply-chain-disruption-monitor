import { Injectable } from '@nestjs/common';
import type { HttpClientPort } from './http-client.port';

@Injectable()
export class StubHttpClient implements HttpClientPort {
  async get<T>(): Promise<T> {
    throw new Error(
      'HttpClient.get() called but no real HTTP client is configured',
    );
  }

  async getText(): Promise<string> {
    throw new Error(
      'HttpClient.getText() called but no real HTTP client is configured',
    );
  }
}
