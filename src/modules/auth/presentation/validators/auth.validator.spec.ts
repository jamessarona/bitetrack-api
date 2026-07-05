import {
  googleSignInSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from './auth.validator';

describe('auth validators', () => {
  it('validates register payload', () => {
    const parsed = registerSchema.parse({
      email: 'user@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(parsed.email).toBe('user@test.com');
    expect(parsed.firstName).toBe('Test');
    expect(parsed.lastName).toBe('User');
  });

  it('rejects register payload without names', () => {
    expect(() =>
      registerSchema.parse({
        email: 'user@test.com',
        password: 'password123',
      }),
    ).toThrow();
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

  it('validates update preferences payload', () => {
    const parsed = updatePreferencesSchema.parse({ themePreference: 'DARK' });
    expect(parsed.themePreference).toBe('DARK');
  });

  it('validates update profile payload', () => {
    const parsed = updateProfileSchema.parse({
      firstName: 'Test',
      lastName: 'User',
      phone: '+639171234567',
    });

    expect(parsed.firstName).toBe('Test');
    expect(parsed.phone).toBe('+639171234567');
  });
});
