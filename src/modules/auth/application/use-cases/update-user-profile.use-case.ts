import { inject, injectable } from 'tsyringe';
import { BadRequestError, NotFoundError } from '@/core/errors';
import { DI } from '@/infrastructure/di/tokens';
import { toPublicUser, type PublicUser } from '../../domain/entities/user.entity';
import {
  type UpdateUserProfileInput,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import { type BusinessRepository } from '@/modules/business/domain/repositories/business.repository';

function normalizeOptionalPhone(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildProfilePatch(input: UpdateUserProfileInput): UpdateUserProfileInput {
  const patch: UpdateUserProfileInput = {};

  if (input.firstName !== undefined) {
    const trimmed = input.firstName.trim();
    if (trimmed.length === 0) {
      throw new BadRequestError('First name is required');
    }
    patch.firstName = trimmed;
  }
  if (input.lastName !== undefined) {
    const trimmed = input.lastName.trim();
    if (trimmed.length === 0) {
      throw new BadRequestError('Last name is required');
    }
    patch.lastName = trimmed;
  }
  if (input.phone !== undefined) {
    patch.phone = normalizeOptionalPhone(input.phone);
  }

  return patch;
}

@injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @inject(DI.UserRepository) private readonly users: UserRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async execute(userId: string, input: UpdateUserProfileInput): Promise<PublicUser> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const user = await this.users.updateProfile(userId, buildProfilePatch(input));
    const businessCount = await this.businesses.countByOwner(userId);

    return toPublicUser(user, businessCount);
  }
}
