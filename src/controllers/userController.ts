import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService.js';
import ApiError from '../error/ApiError.js';
import mailService from '../services/mailService.js';
import tokenService from '../services/tokenService.js';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import { UploadedFile } from 'express-fileupload';
import { checkValidationResultOfEmailAndPassword } from '../utils/checkValidationResultOfEmailAndPassword.js';
import { setTokensToCookiesInResponse } from '../utils/setTokensToCookies.js';
import { clearCookieInResponse } from '../utils/clearCookieInResponse.js';
import { checkRefreshTokenIfIsEmptyThrowException } from '../utils/checkRefreshTokenIfIsEmptyThrowException.js';
class UserController {
  public async registration(req: Request, res: Response, next: NextFunction) {
    try {
      checkValidationResultOfEmailAndPassword(req);
      const { email, password, role } = req.body;
      const tokenData = await userService.registration(email, password, role);
      setTokensToCookiesInResponse(res, { refreshToken: tokenData.refreshToken, accessToken: tokenData.accessToken });
      res.json(tokenData);
    } catch (err) {
      next(err);
    }
  }

  public async updateUser(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { delete_img } = req.body;
      let image = null;
      if (!req.user) {
        throw ApiError.BadRequest('Пользователь не авторизован');
      }
      if (req.files) {
        image = req.files.avatar as UploadedFile;
      }
      let rmImage = null;
      if (delete_img === 'true') {
        rmImage = true;
      }
      const updatedUser = await userService.updateUser(req.user.id, image, rmImage);
      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  }

  public async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const link = req.params.link;
      const activate = await mailService.activateEmail(link);
      if (!activate) {
        throw ApiError.BadRequest('Некорректная ссылка');
      }
      res.redirect(process.env.CLIENT_URL as string);
    } catch (err) {
      next(err);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw ApiError.BadRequest('Некорректные данные');
      }
      const tokenData = await userService.login(email, password);
      setTokensToCookiesInResponse(res, { refreshToken: tokenData.refreshToken, accessToken: tokenData.accessToken });
      res.json(tokenData);
    } catch (err) {
      next(err);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = checkRefreshTokenIfIsEmptyThrowException(req.cookies);
      const tokenData = await tokenService.refresh(refreshToken);
      setTokensToCookiesInResponse(res, { refreshToken: tokenData.refreshToken, accessToken: tokenData.accessToken });
      res.json(tokenData);
    } catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = checkRefreshTokenIfIsEmptyThrowException(req.cookies);
      const message = await tokenService.deleteToken(refreshToken);
      clearCookieInResponse(res);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  public async changePassword(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      checkValidationResultOfEmailAndPassword(req);
      if (!oldPassword || !newPassword || !req.user) {
        throw ApiError.BadRequest('Некорректные данные');
      }
      const message = await userService.changeUserPassword(req.user.id, oldPassword, newPassword);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
