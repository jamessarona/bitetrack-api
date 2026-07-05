import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
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
export class LocalObjectStorageService implements ObjectStorageService {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
  ) {}

  async createUploadSession(input: CreateUploadSessionInput): Promise<UploadSession> {
    if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
      throw new BadRequestError('Unsupported image content type');
    }

    await this.assertUploadAccess(input);

    const extension = extensionForContentType(input.contentType);
    const objectKey = this.buildObjectKey(input, extension);
    const absolutePath = path.join(process.cwd(), config.storage.localDir, objectKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });

    const token = randomUUID();
    const uploadPath = `${config.app.apiPrefix}/media/dev-upload/${token}`;
    const uploadUrl = `${config.storage.localPublicBaseUrl.replace(/\/uploads\/?$/, '')}${uploadPath}`;
    const pendingPath = path.join(process.cwd(), config.storage.localDir, '.pending', `${token}.json`);
    await mkdir(path.dirname(pendingPath), { recursive: true });
    await writeFile(
      pendingPath,
      JSON.stringify({
        absolutePath,
        objectKey,
        contentType: input.contentType,
        expiresAt: new Date(Date.now() + config.storage.uploadUrlTtlMs).toISOString(),
      }),
      'utf8',
    );

    return {
      objectKey,
      uploadUrl,
      publicUrl: `${config.storage.localPublicBaseUrl.replace(/\/$/, '')}/${objectKey.replace(/\\/g, '/')}`,
      expiresAt: new Date(Date.now() + config.storage.uploadUrlTtlMs),
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
      return path.join('products', input.productId, fileName);
    }

    if (input.businessId) {
      const folder = input.purpose === 'business_banner' ? 'banners' : 'logos';
      return path.join('businesses', input.businessId, folder, fileName);
    }

    return path.join('uploads', input.userId, fileName);
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
