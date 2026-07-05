import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from '@/infrastructure/di/container';
import { asyncHandler } from '@/core/http/async-handler';
import { ok } from '@/core/http/api-response';
import { routeParam } from '@/core/http/route-param';
import { type AuthenticatedRequest } from '@/modules/auth/presentation/middleware/authenticate';
import {
  CreateBusinessUseCase,
  DeleteBusinessUseCase,
  GetBusinessBySlugUseCase,
  ListCategoriesUseCase,
  ListMyBusinessesUseCase,
  ListPublicBusinessesUseCase,
  UpdateBusinessUseCase,
} from '../application/use-cases/business.use-cases';
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  ListBusinessProductsUseCase,
  UpdateProductUseCase,
} from '../application/use-cases/product.use-cases';
import {
  type CreateBusinessBody,
  type CreateProductBody,
  type UpdateBusinessBody,
  type UpdateProductBody,
} from './validators/business.validator';

export class BusinessController {
  listCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const useCase = container.resolve(ListCategoriesUseCase);
    const categories = await useCase.execute();
    res.status(StatusCodes.OK).json(ok(categories));
  });

  listPublicBusinesses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const limit =
      typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : undefined;
    const useCase = container.resolve(ListPublicBusinessesUseCase);
    const businesses = await useCase.execute({
      ...(categoryId ? { categoryId } : {}),
      ...(limit && !Number.isNaN(limit) ? { limit } : {}),
    });
    res.status(StatusCodes.OK).json(ok(businesses));
  });

  getBusinessBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const useCase = container.resolve(GetBusinessBySlugUseCase);
    const business = await useCase.execute(routeParam(req.params.slug, 'slug'));
    res.status(StatusCodes.OK).json(ok(business));
  });

  listBusinessProductsBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const businessUseCase = container.resolve(GetBusinessBySlugUseCase);
    const business = await businessUseCase.execute(routeParam(req.params.slug, 'slug'));
    const productUseCase = container.resolve(ListBusinessProductsUseCase);
    const products = await productUseCase.execute(business.id);
    res.status(StatusCodes.OK).json(ok(products));
  });

  listMyBusinesses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const useCase = container.resolve(ListMyBusinessesUseCase);
    const businesses = await useCase.execute(auth.sub);
    res.status(StatusCodes.OK).json(ok(businesses));
  });

  createBusiness = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as CreateBusinessBody;
    const useCase = container.resolve(CreateBusinessUseCase);
    const business = await useCase.execute({ userId: auth.sub, ...body });
    res.status(StatusCodes.CREATED).json(ok(business));
  });

  updateBusiness = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as UpdateBusinessBody;
    const useCase = container.resolve(UpdateBusinessUseCase);
    const business = await useCase.execute(
      routeParam(req.params.businessId, 'businessId'),
      auth.sub,
      body,
    );
    res.status(StatusCodes.OK).json(ok(business));
  });

  deleteBusiness = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const useCase = container.resolve(DeleteBusinessUseCase);
    await useCase.execute(routeParam(req.params.businessId, 'businessId'), auth.sub);
    res.status(StatusCodes.NO_CONTENT).send();
  });

  listMyBusinessProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const useCase = container.resolve(ListBusinessProductsUseCase);
    const products = await useCase.execute(
      routeParam(req.params.businessId, 'businessId'),
      auth.sub,
    );
    res.status(StatusCodes.OK).json(ok(products));
  });

  createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as CreateProductBody;
    const useCase = container.resolve(CreateProductUseCase);
    const product = await useCase.execute(
      routeParam(req.params.businessId, 'businessId'),
      auth.sub,
      body,
    );
    res.status(StatusCodes.CREATED).json(ok(product));
  });

  updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as UpdateProductBody;
    const useCase = container.resolve(UpdateProductUseCase);
    const product = await useCase.execute(routeParam(req.params.productId, 'productId'), auth.sub, body);
    res.status(StatusCodes.OK).json(ok(product));
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const useCase = container.resolve(DeleteProductUseCase);
    await useCase.execute(routeParam(req.params.productId, 'productId'), auth.sub);
    res.status(StatusCodes.NO_CONTENT).send();
  });
}

export const businessController = new BusinessController();
