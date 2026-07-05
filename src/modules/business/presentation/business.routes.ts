import { Router } from 'express';
import { validateBody } from '@/core/middleware/validate';
import { authenticate } from '@/modules/auth/presentation/middleware/authenticate';
import { businessController } from './business.controller';
import {
  createBusinessSchema,
  createProductSchema,
  sellingLocationSchema,
  updateBusinessSchema,
  updateProductSchema,
} from './validators/business.validator';

export const businessRouter = Router();

businessRouter.get('/categories', businessController.listCategories);
businessRouter.get('/businesses/nearby', businessController.listNearbyBusinesses);
businessRouter.get('/businesses', businessController.listPublicBusinesses);
businessRouter.get('/businesses/:slug', businessController.getBusinessBySlug);
businessRouter.get('/businesses/:slug/products', businessController.listBusinessProductsBySlug);

const meRouter = Router();
meRouter.use(authenticate);

meRouter.get('/businesses', businessController.listMyBusinesses);
meRouter.post('/businesses', validateBody(createBusinessSchema), businessController.createBusiness);
meRouter.patch(
  '/businesses/:businessId',
  validateBody(updateBusinessSchema),
  businessController.updateBusiness,
);
meRouter.delete('/businesses/:businessId', businessController.deleteBusiness);
meRouter.get('/businesses/:businessId/products', businessController.listMyBusinessProducts);
meRouter.post(
  '/businesses/:businessId/products',
  validateBody(createProductSchema),
  businessController.createProduct,
);
meRouter.patch(
  '/products/:productId',
  validateBody(updateProductSchema),
  businessController.updateProduct,
);
meRouter.delete('/products/:productId', businessController.deleteProduct);
meRouter.get('/businesses/:businessId/selling', businessController.getSellingStatus);
meRouter.post(
  '/businesses/:businessId/selling/start',
  validateBody(sellingLocationSchema),
  businessController.startSelling,
);
meRouter.post('/businesses/:businessId/selling/stop', businessController.stopSelling);
meRouter.post(
  '/businesses/:businessId/selling/location',
  validateBody(sellingLocationSchema),
  businessController.updateSellingLocation,
);

businessRouter.use('/me', meRouter);
