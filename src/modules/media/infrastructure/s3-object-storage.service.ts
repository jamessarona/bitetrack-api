import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { inject, injectable } from 'tsyringe';
import { config } from '@/config';
import { DI } from '@/infrastructure/di/tokens';
import {
  type BusinessRepository,
  type ProductRepository,
} from '@/modules/business/domain/repositories/business.repository';
import {
  type CreateUploadSessionInput,
  type ObjectStorageService,
  type UploadSession,
} from '../application/ports/object-storage';
import {
  assertAllowedContentType,
  assertUploadAccess,
  buildObjectKey,
  extensionForContentType,
} from './storage-upload.helper';

@injectable()
export class S3ObjectStorageService implements ObjectStorageService {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
  ) {
    this.bucketName = config.storage.s3Bucket;
    this.client = new S3Client({
      region: config.storage.s3Region,
      credentials: {
        accessKeyId: config.storage.s3AccessKeyId,
        secretAccessKey: config.storage.s3SecretAccessKey,
      },
    });
  }

  async createUploadSession(input: CreateUploadSessionInput): Promise<UploadSession> {
    assertAllowedContentType(input.contentType);
    await assertUploadAccess(input, this.businesses, this.products);

    const extension = extensionForContentType(input.contentType);
    const objectKey = buildObjectKey(input, extension);
    const expiresAt = new Date(Date.now() + config.storage.uploadUrlTtlMs);
    const expiresInSeconds = Math.max(60, Math.floor(config.storage.uploadUrlTtlMs / 1000));

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });

    return {
      objectKey,
      uploadUrl,
      publicUrl: this.publicUrl(objectKey),
      expiresAt,
      headers: { 'Content-Type': input.contentType },
    };
  }

  private publicUrl(objectKey: string): string {
    const base = config.storage.s3PublicBaseUrl.replace(/\/$/, '');
    return `${base}/${objectKey}`;
  }
}
