import { Response, NextFunction } from 'express';
import { ReqWithUserPayload } from './checkAuthMiddleware.js';
import tokenService from '../services/tokenService.js';

const checkRoleMiddeware = (role: 'ADMIN' | 'USER') => (req: ReqWithUserPayload, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    } else {
      const token = req.cookies.accessToken;
      if (!token) {
        return res.status(401).json({ message: 'Пользователь не авторизован' });
      }
      const verified = tokenService.validateAccessToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Пользователь не авторизован' });
      }
      if (verified.role !== role) {
        return res.status(403).json({ message: 'Нет доступа' });
      }
      req.user = verified;
      next();
    }
  } catch (err) {
    res.status(403).json({ message: 'Нет доступа' });
  }
};

export default checkRoleMiddeware;
