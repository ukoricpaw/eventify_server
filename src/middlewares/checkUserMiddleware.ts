import { NextFunction, Response } from 'express';
import tokenService from '../services/tokenService.js';
import { ReqWithUserPayload } from './checkAuthMiddleware.js';

const checkUserMiddleware = (req: ReqWithUserPayload, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const token = req.headers.authorization?.split(' ')[1]; //Bearer token;
    if (token) {
      const verified = tokenService.validateAccessToken(token);
      if (verified) {
        req.user = verified;
      }
    }
    next();
  } catch (err) {
    next();
  }
};

export default checkUserMiddleware;
