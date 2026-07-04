import argon2 from 'argon2';
import { injectable } from 'tsyringe';
import { type PasswordHasher } from '@/modules/auth/application/ports/password-hasher';

@injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
