import { inject, injectable } from 'tsyringe';
import { ConflictError } from '@/core/errors';
import { DI } from '@/infrastructure/di/tokens';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type AuthResult, type RegisterInput } from '../dtos/auth.dto';
import { type PasswordHasher } from '../ports/password-hasher';
import { AuthTokenIssuer } from '../services/auth-token-issuer';

@injectable()
export class RegisterUseCase {
  constructor(
    @inject(DI.UserRepository) private readonly users: UserRepository,
    @inject(DI.PasswordHasher) private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: AuthTokenIssuer,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return this.tokenIssuer.issue(user);
  }
}
