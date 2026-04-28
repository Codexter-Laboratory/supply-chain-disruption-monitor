import { Module } from '@nestjs/common';
import { FetchHttpClient } from './fetch-http-client';

export const HTTP_CLIENT = Symbol('HTTP_CLIENT');

export const httpClientProvider = {
  provide: HTTP_CLIENT,
  useClass: FetchHttpClient,
};

@Module({
  providers: [httpClientProvider],
  exports: [HTTP_CLIENT],
})
export class HttpClientModule {}
