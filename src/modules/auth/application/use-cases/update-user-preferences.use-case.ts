import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { NotFoundError } from '@/core/errors';
import {
  toPublicUser,
  type PublicUser,
  type ThemePreference,
} from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type BusinessRepository } from '@/modules/business/domain/repositories/business.repository';

export interface UpdateUserPreferencesInput {
  themePreference: ThemePreference;
}

@injectable()
export class UpdateUserPreferencesUseCase {
  constructor(
    @inject(DI.UserRepository) private readonly users: UserRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async execute(userId: string, input: UpdateUserPreferencesInput): Promise<PublicUser> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const user = await this.users.updatePreferences(userId, input);
    const businessCount = await this.businesses.countByOwner(userId);
    return toPublicUser(user, businessCount);
  }
}
