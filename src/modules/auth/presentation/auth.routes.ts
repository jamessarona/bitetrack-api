import { Router } from 'express';
import { validateBody } from '@/core/middleware/validate';
import { authController } from './auth.controller';
import { authenticate } from './middleware/authenticate';
import {
  googleSignInSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from './validators/auth.validator';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/google', validateBody(googleSignInSchema), authController.googleSignIn);
authRouter.post('/refresh', validateBody(refreshSchema), authController.refresh);
authRouter.post('/logout', validateBody(logoutSchema), authController.logout);
authRouter.get('/me', authenticate, authController.me);
