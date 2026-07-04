export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface GoogleOAuthService {
  verifyIdToken(idToken: string): Promise<GoogleProfile>;
}
