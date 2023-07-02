import { NextFunction, Response } from 'express';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import imageService from '../services/imageService.js';
import ApiError from '../error/ApiError.js';

class ImageController {
  async getImage(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const uuid = req.params.uuid;
      if (!uuid) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      await imageService
        .getImage(uuid)
        .then(url => {
          res.redirect(url);
        })
        .catch(err => {
          throw ApiError.BadRequest(err.message);
        });
    } catch (err) {
      next(err);
    }
  }
}

export default new ImageController();
