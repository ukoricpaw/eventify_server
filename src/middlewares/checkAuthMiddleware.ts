import { NextFunction, Request, Response } from 'express';
import { UserPayload } from '../services/tokenService.js';
import tokenService from '../services/tokenService.js';

export interface ReqWithUserPayload extends Request {
  user?: UserPayload;
}

const checkAuthMiddleware = (req: ReqWithUserPayload, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const token = req.headers.authorization?.split(' ')[1]; //Bearer token;
    if (!token) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }
    const verified = tokenService.validateAccessToken(token);
    if (!verified) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
};

export default checkAuthMiddleware;
