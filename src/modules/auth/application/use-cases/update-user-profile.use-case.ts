import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { NotFoundError } from '@/core/errors';
import { toPublicUser, type PublicUser } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';

export interface UpdateUserProfileInput {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

function normalizeOptionalText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

@injectable()
export class UpdateUserProfileUseCase {
  constructor(@inject(DI.UserRepository) private readonly users: UserRepository) {}

  async execute(userId: string, input: UpdateUserProfileInput): Promise<PublicUser> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const user = await this.users.updateProfile(userId, {
      firstName: normalizeOptionalText(input.firstName),
      lastName: normalizeOptionalText(input.lastName),
      phone: normalizeOptionalText(input.phone),
    });

    return toPublicUser(user);
  }
}
