import { Response } from 'express';

export const setTokensToCookiesInResponse = (res: Response, data: { refreshToken: string; accessToken: string }) => {
  res.cookie('refreshToken', data.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
  res.cookie('accessToken', data.accessToken, { maxAge: 60 * 15 * 1000, httpOnly: true });
};
