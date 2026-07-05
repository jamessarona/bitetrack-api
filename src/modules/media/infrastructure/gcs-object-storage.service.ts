import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Storage } from '@google-cloud/storage';
import { inject, injectable } from 'tsyringe';
import { config } from '@/config';
import { BadRequestError } from '@/core/errors';
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

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@injectable()
export class GcsObjectStorageService implements ObjectStorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
  ) {
    this.bucketName = config.storage.gcsBucket;
    this.storage = new Storage({
      ...(config.storage.gcsProjectId ? { projectId: config.storage.gcsProjectId } : {}),
      ...(config.storage.gcsKeyFile ? { keyFilename: config.storage.gcsKeyFile } : {}),
    });
  }

  async createUploadSession(input: CreateUploadSessionInput): Promise<UploadSession> {
    if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
      throw new BadRequestError('Unsupported image content type');
    }

    await this.assertUploadAccess(input);

    const extension = extensionForContentType(input.contentType);
    const objectKey = this.buildObjectKey(input, extension);
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectKey);
    const expiresAt = new Date(Date.now() + config.storage.uploadUrlTtlMs);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType: input.contentType,
    });

    return {
      objectKey,
      uploadUrl,
      publicUrl: this.publicUrl(objectKey),
      expiresAt,
      headers: { 'Content-Type': input.contentType },
    };
  }

  private async assertUploadAccess(input: CreateUploadSessionInput): Promise<void> {
    if (input.purpose === 'business_logo' || input.purpose === 'business_banner') {
      if (!input.businessId) {
        throw new BadRequestError('businessId is required for business media uploads');
      }
      const owned = await this.businesses.isOwnedByUser(input.businessId, input.userId);
      if (!owned) {
        throw new BadRequestError('You do not own this business');
      }
      return;
    }

    if (input.purpose === 'product_image') {
      if (!input.productId) {
        throw new BadRequestError('productId is required for product image uploads');
      }
      const product = await this.products.findById(input.productId);
      if (!product) {
        throw new BadRequestError('Product not found');
      }
      const owned = await this.businesses.isOwnedByUser(product.businessId, input.userId);
      if (!owned) {
        throw new BadRequestError('You do not own this product');
      }
    }
  }

  private buildObjectKey(input: CreateUploadSessionInput, extension: string): string {
    const fileName = `${randomUUID()}${extension}`;

    if (input.purpose === 'product_image' && input.productId) {
      return path.posix.join('products', input.productId, fileName);
    }

    if (input.businessId) {
      const folder = input.purpose === 'business_banner' ? 'banners' : 'logos';
      return path.posix.join('businesses', input.businessId, folder, fileName);
    }

    return path.posix.join('uploads', input.userId, fileName);
  }

  private publicUrl(objectKey: string): string {
    const base = config.storage.publicBaseUrl.replace(/\/$/, '');
    return `${base}/${this.bucketName}/${objectKey}`;
  }
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '';
  }
}
