import ApiError from '../error/ApiError.js';
import { CookieRequestType } from '../types/requestTypes.js';

export const checkRefreshTokenIfIsEmptyThrowException = (cookies: CookieRequestType) => {
  const refreshToken = cookies.refreshToken;
  if (!refreshToken) {
    throw ApiError.NotAuthorized('Ошибка запроса');
  }
  return refreshToken;
};
