import { ValidationPipe } from '@nestjs/common';

/** Use on GraphQL resolvers with `@ArgsType()` inputs (global HTTP pipe may not run here). */
export const graphqlArgsValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
