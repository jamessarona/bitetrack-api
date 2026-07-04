import { inject, injectable } from 'tsyringe';
import { UnauthorizedError } from '@/core/errors';
import { DI } from '@/infrastructure/di/tokens';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type AuthResult, type LoginInput } from '../dtos/auth.dto';
import { type PasswordHasher } from '../ports/password-hasher';
import { AuthTokenIssuer } from '../services/auth-token-issuer';

@injectable()
export class LoginUseCase {
  constructor(
    @inject(DI.UserRepository) private readonly users: UserRepository,
    @inject(DI.PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @inject(AuthTokenIssuer) private readonly tokenIssuer: AuthTokenIssuer,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    return this.tokenIssuer.issue(user, {
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
  }
}
