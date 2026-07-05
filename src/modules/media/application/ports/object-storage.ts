export type MediaUploadPurpose = 'business_logo' | 'business_banner' | 'product_image';

export interface CreateUploadSessionInput {
  purpose: MediaUploadPurpose;
  contentType: string;
  userId: string;
  businessId?: string | undefined;
  productId?: string | undefined;
}

export interface UploadSession {
  objectKey: string;
  uploadUrl: string;
  publicUrl: string;
  expiresAt: Date;
  headers?: Record<string, string> | undefined;
}

export interface ObjectStorageService {
  createUploadSession(input: CreateUploadSessionInput): Promise<UploadSession>;
}
