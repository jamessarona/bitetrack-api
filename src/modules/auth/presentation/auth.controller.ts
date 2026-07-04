import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from '@/infrastructure/di/container';
import { asyncHandler } from '@/core/http/async-handler';
import { ok } from '@/core/http/api-response';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case';
import { GoogleSignInUseCase } from '../application/use-cases/google-sign-in.use-case';
import { UpdateUserPreferencesUseCase } from '../application/use-cases/update-user-preferences.use-case';
import { UpdateUserProfileUseCase } from '../application/use-cases/update-user-profile.use-case';
import {
  type GoogleSignInBody,
  type LoginBody,
  type LogoutBody,
  type RefreshBody,
  type RegisterBody,
  type UpdatePreferencesBody,
  type UpdateProfileBody,
} from './validators/auth.validator';
import { type AuthenticatedRequest } from './middleware/authenticate';

function clientMeta(req: Request): { userAgent?: string; ipAddress?: string } {
  const meta: { userAgent?: string; ipAddress?: string } = {};
  const userAgent = req.headers['user-agent'];
  if (userAgent) meta.userAgent = userAgent;
  if (req.ip) meta.ipAddress = req.ip;
  return meta;
}

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RegisterBody;
    const useCase = container.resolve(RegisterUseCase);
    const result = await useCase.execute(body);
    res.status(StatusCodes.CREATED).json(ok(result));
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body as LoginBody;
    const useCase = container.resolve(LoginUseCase);
    const result = await useCase.execute({ ...body, ...clientMeta(req) });
    res.status(StatusCodes.OK).json(ok(result));
  });

  googleSignIn = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body as GoogleSignInBody;
    const useCase = container.resolve(GoogleSignInUseCase);
    const result = await useCase.execute({ ...body, ...clientMeta(req) });
    res.status(StatusCodes.OK).json(ok(result));
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RefreshBody;
    const useCase = container.resolve(RefreshTokenUseCase);
    const result = await useCase.execute({ ...body, ...clientMeta(req) });
    res.status(StatusCodes.OK).json(ok(result));
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body as LogoutBody;
    const useCase = container.resolve(LogoutUseCase);
    await useCase.execute(body);
    res.status(StatusCodes.NO_CONTENT).send();
  });

  me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const useCase = container.resolve(GetCurrentUserUseCase);
    const user = await useCase.execute(auth.sub);
    res.status(StatusCodes.OK).json(ok(user));
  });

  updatePreferences = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as UpdatePreferencesBody;
    const useCase = container.resolve(UpdateUserPreferencesUseCase);
    const user = await useCase.execute(auth.sub, body);
    res.status(StatusCodes.OK).json(ok(user));
  });

  updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as UpdateProfileBody;
    const useCase = container.resolve(UpdateUserProfileUseCase);
    const user = await useCase.execute(auth.sub, body);
    res.status(StatusCodes.OK).json(ok(user));
  });
}

export const authController = new AuthController();
