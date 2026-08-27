import { SetMetadata } from '@nestjs/common';
import { TrainerRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TrainerRole[]) => SetMetadata(ROLES_KEY, roles);
