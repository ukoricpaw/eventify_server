import { Request } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../error/ApiError.js';

export const checkValidationResultOfEmailAndPassword = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.BadRequest('Некорректные данные');
  }
};
