import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated user from the request.
 * Can optionally extract a specific property from the user object.
 *
 * @example
 * // Get entire user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { ... }
 *
 * @example
 * // Get specific property
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
