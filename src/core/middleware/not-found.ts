import { type RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { fail } from '@/core/http/api-response';

export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .json(fail('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
};
