import { OAuth2Client } from 'google-auth-library';
import { inject, injectable } from 'tsyringe';
import { config } from '@/config';
import { UnauthorizedError } from '@/core/errors';
import { DI } from '@/infrastructure/di/tokens';
import {
  type GoogleOAuthService,
  type GoogleProfile,
} from '../../application/ports/google-oauth';

@injectable()
export class GoogleOAuthServiceImpl implements GoogleOAuthService {
  constructor(@inject(DI.GoogleOAuthClient) private readonly client: OAuth2Client) {}

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!config.google.clientIds.length) {
      throw new UnauthorizedError('Google sign-in is not configured');
    }

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: config.google.clientIds,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedError('Invalid Google token');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      firstName: payload.given_name ?? null,
      lastName: payload.family_name ?? null,
      avatarUrl: payload.picture ?? null,
      emailVerified: payload.email_verified === true,
    };
  }
}
