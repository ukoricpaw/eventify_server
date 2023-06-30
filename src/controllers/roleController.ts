import { Response, NextFunction } from 'express';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import roleService from '../services/roleService.js';
import ApiError from '../error/ApiError.js';

class RoleController {
  async addRole(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const role = await roleService.addRole(name);
      res.json(role);
    } catch (err) {
      next(err);
    }
  }

  async deleteRole(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id) {
        throw ApiError.BadRequest('id не был указан');
      }
      const message = await roleService.deleteRole(Number(id));
      if (!message) {
        throw ApiError.BadRequest('Роль не найдена');
      }
      return res.json(message);
    } catch (err) {
      next(err);
    }
  }
}

export default new RoleController();
