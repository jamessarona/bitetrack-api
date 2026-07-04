import {
  googleSignInSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from './auth.validator';

describe('auth validators', () => {
  it('validates register payload', () => {
    const parsed = registerSchema.parse({
      email: 'user@test.com',
      password: 'password123',
      role: 'CUSTOMER',
      firstName: 'Test',
    });

    expect(parsed.email).toBe('user@test.com');
    expect(parsed.role).toBe('CUSTOMER');
  });

  it('rejects invalid register email', () => {
    expect(() =>
      registerSchema.parse({
        email: 'not-an-email',
        password: 'password123',
      }),
    ).toThrow();
  });

  it('validates login payload', () => {
    const parsed = loginSchema.parse({
      email: 'user@test.com',
      password: 'secret',
    });

    expect(parsed.email).toBe('user@test.com');
  });

  it('validates refresh payload', () => {
    const parsed = refreshSchema.parse({ refreshToken: 'token-value' });
    expect(parsed.refreshToken).toBe('token-value');
  });

  it('validates logout payload', () => {
    const parsed = logoutSchema.parse({ refreshToken: 'token-value' });
    expect(parsed.refreshToken).toBe('token-value');
  });

  it('validates google sign-in payload', () => {
    const parsed = googleSignInSchema.parse({ idToken: 'google-id-token' });
    expect(parsed.idToken).toBe('google-id-token');
  });
});
