import { Router } from 'express';
import { asyncHandler } from '@/core/http/async-handler';
import { liveness, readiness } from './health.controller';

export const healthRouter = Router();

healthRouter.get('/health', liveness);
healthRouter.get('/health/ready', asyncHandler(readiness));
