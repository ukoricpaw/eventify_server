import { Response } from 'express';

export const clearCookieInResponse = (res: Response) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
};
