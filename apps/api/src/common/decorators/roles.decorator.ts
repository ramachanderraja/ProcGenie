import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict endpoint access to specific roles.
 * Use with RolesGuard.
 *
 * @example
 * @Roles('admin', 'procurement_manager')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
