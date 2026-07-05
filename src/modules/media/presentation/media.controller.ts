import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from '@/infrastructure/di/container';
import { config } from '@/config';
import { asyncHandler } from '@/core/http/async-handler';
import { ok } from '@/core/http/api-response';
import { BadRequestError, NotFoundError } from '@/core/errors';
import { type AuthenticatedRequest } from '@/modules/auth/presentation/middleware/authenticate';
import { CreateUploadSessionUseCase } from '../application/use-cases/create-upload-session.use-case';
import { type CreateUploadSessionBody } from '@/modules/business/presentation/validators/business.validator';

interface PendingUpload {
  absolutePath: string;
  objectKey: string;
  contentType: string;
  expiresAt: string;
}

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

  devUpload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (config.storage.driver !== 'local') {
      throw new NotFoundError('Not found');
    }

    const token = req.params.token!;
    const pendingPath = path.join(
      process.cwd(),
      config.storage.localDir,
      '.pending',
      `${token}.json`,
    );

    let pendingRaw: string;
    try {
      pendingRaw = await readFile(pendingPath, 'utf8');
    } catch {
      throw new NotFoundError('Upload session not found or expired');
    }

    const pending = JSON.parse(pendingRaw) as PendingUpload;
    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      await unlink(pendingPath).catch(() => undefined);
      throw new BadRequestError('Upload session expired');
    }

    const contentType = req.headers['content-type'];
    if (contentType !== pending.contentType) {
      throw new BadRequestError('Content-Type must match the upload session');
    }

    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      throw new BadRequestError('Request body must contain image bytes');
    }

    const { writeFile, mkdir } = await import('node:fs/promises');
    await mkdir(path.dirname(pending.absolutePath), { recursive: true });
    await writeFile(pending.absolutePath, body);
    await unlink(pendingPath).catch(() => undefined);

    res.status(StatusCodes.NO_CONTENT).send();
  });
}

export const mediaController = new MediaController();
