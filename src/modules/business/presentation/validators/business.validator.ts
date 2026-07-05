import { z } from 'zod';

export const createBusinessSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().uuid().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const updateBusinessSchema = z.object({
  businessName: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  status: z.enum(['OFFLINE', 'ONLINE', 'ON_ROUTE', 'AVAILABLE', 'BUSY']).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().trim().length(3).optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().trim().length(3).optional(),
  imageUrl: z.string().url().nullable().optional(),
  isAvailable: z.boolean().optional(),
});

export const sellingLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().optional(),
  speed: z.number().optional(),
});

export const createUploadSessionSchema = z.object({
  purpose: z.enum(['business_logo', 'business_banner', 'product_image']),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  businessId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export type CreateBusinessBody = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessBody = z.infer<typeof updateBusinessSchema>;
export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type CreateUploadSessionBody = z.infer<typeof createUploadSessionSchema>;
export type SellingLocationBody = z.infer<typeof sellingLocationSchema>;
