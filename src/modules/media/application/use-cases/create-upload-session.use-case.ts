import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import {
  type CreateUploadSessionInput,
  type ObjectStorageService,
  type UploadSession,
} from '../ports/object-storage';

@injectable()
export class CreateUploadSessionUseCase {
  constructor(@inject(DI.ObjectStorageService) private readonly storage: ObjectStorageService) {}

  async execute(input: CreateUploadSessionInput): Promise<UploadSession> {
    return this.storage.createUploadSession(input);
  }
}
