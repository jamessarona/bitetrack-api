import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { NotFoundError } from '@/core/errors';
import { toPublicUser, type PublicUser } from '../../domain/entities/user.entity';
import {
  type UpdateUserProfileInput,
  type UserRepository,
} from '../../domain/repositories/user.repository';

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildProfilePatch(input: UpdateUserProfileInput): UpdateUserProfileInput {
  const patch: UpdateUserProfileInput = {};

  if (input.firstName !== undefined) {
    patch.firstName = normalizeOptionalText(input.firstName);
  }
  if (input.lastName !== undefined) {
    patch.lastName = normalizeOptionalText(input.lastName);
  }
  if (input.phone !== undefined) {
    patch.phone = normalizeOptionalText(input.phone);
  }

  return patch;
}

@injectable()
export class UpdateUserProfileUseCase {
  constructor(@inject(DI.UserRepository) private readonly users: UserRepository) {}

  async execute(userId: string, input: UpdateUserProfileInput): Promise<PublicUser> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const user = await this.users.updateProfile(userId, buildProfilePatch(input));

    return toPublicUser(user);
  }
}
