import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from '@/infrastructure/di/container';
import { asyncHandler } from '@/core/http/async-handler';
import { ok } from '@/core/http/api-response';
import { type AuthenticatedRequest } from '@/modules/auth/presentation/middleware/authenticate';
import { CreateUploadSessionUseCase } from '../application/use-cases/create-upload-session.use-case';
import { type CreateUploadSessionBody } from '@/modules/business/presentation/validators/business.validator';

export class MediaController {
  createUploadSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as CreateUploadSessionBody;
    const useCase = container.resolve(CreateUploadSessionUseCase);
    const session = await useCase.execute({
      purpose: body.purpose,
      contentType: body.contentType,
      userId: auth.sub,
      ...(body.businessId ? { businessId: body.businessId } : {}),
      ...(body.productId ? { productId: body.productId } : {}),
    });
    res.status(StatusCodes.CREATED).json(ok(session));
  });
}

export const mediaController = new MediaController();
