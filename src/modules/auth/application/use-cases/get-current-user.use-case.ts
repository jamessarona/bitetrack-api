import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { NotFoundError } from '@/core/errors';
import { toPublicUser, type PublicUser } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';

@injectable()
export class GetCurrentUserUseCase {
  constructor(@inject(DI.UserRepository) private readonly users: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toPublicUser(user);
  }
}
