import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(['CUSTOMER', 'VENDOR']).default('CUSTOMER'),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const googleSignInSchema = z.object({
  idToken: z.string().min(1),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshBody = z.infer<typeof refreshSchema>;
export type LogoutBody = z.infer<typeof logoutSchema>;
export type GoogleSignInBody = z.infer<typeof googleSignInSchema>;
