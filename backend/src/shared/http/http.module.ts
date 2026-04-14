import { Module } from '@nestjs/common';
import { StubHttpClient } from './stub-http-client';

export const HTTP_CLIENT = Symbol('HTTP_CLIENT');

export const httpClientProvider = {
  provide: HTTP_CLIENT,
  useClass: StubHttpClient,
};

@Module({
  providers: [httpClientProvider],
  exports: [HTTP_CLIENT],
})
export class HttpClientModule {}
