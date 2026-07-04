import { type NextFunction, type Request, type Response } from 'express';
import { container } from '@/infrastructure/di/container';
import { DI } from '@/infrastructure/di/tokens';
import { UnauthorizedError } from '@/core/errors';
import { type TokenService } from '@/modules/auth/application/ports/token-service';
import { type AccessTokenPayload } from '@/modules/auth/application/ports/token-service';

export interface AuthenticatedRequest extends Request {
  auth: AccessTokenPayload;
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  try {
    const tokenService = container.resolve<TokenService>(DI.TokenService);
    const payload = tokenService.verifyAccessToken(token);
    (req as AuthenticatedRequest).auth = payload;
    next();
  } catch (error) {
    next(error);
  }
}
