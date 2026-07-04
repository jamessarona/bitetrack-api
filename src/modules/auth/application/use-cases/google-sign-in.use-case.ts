import { inject, injectable } from 'tsyringe';
import { ConflictError, UnauthorizedError } from '@/core/errors';
import { DI } from '@/infrastructure/di/tokens';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type AuthResult, type GoogleSignInInput } from '../dtos/auth.dto';
import { type GoogleOAuthService } from '../ports/google-oauth';
import { AuthTokenIssuer } from '../services/auth-token-issuer';

@injectable()
export class GoogleSignInUseCase {
  constructor(
    @inject(DI.UserRepository) private readonly users: UserRepository,
    @inject(DI.GoogleOAuthService) private readonly googleOAuth: GoogleOAuthService,
    @inject(AuthTokenIssuer) private readonly tokenIssuer: AuthTokenIssuer,
  ) {}

  async execute(input: GoogleSignInInput): Promise<AuthResult> {
    const profile = await this.googleOAuth.verifyIdToken(input.idToken);

    let user = await this.users.findByGoogleId(profile.googleId);

    if (!user) {
      const byEmail = await this.users.findByEmail(profile.email);
      if (byEmail) {
        if (byEmail.googleId && byEmail.googleId !== profile.googleId) {
          throw new ConflictError('This email is linked to another Google account');
        }
        user = await this.users.linkGoogleAccount(byEmail.id, {
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: profile.emailVerified ? new Date() : byEmail.emailVerifiedAt,
        });
      } else {
        user = await this.users.createGoogleUser({
          email: profile.email,
          googleId: profile.googleId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: profile.emailVerified ? new Date() : null,
        });
      }
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
