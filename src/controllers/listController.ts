import { Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import listService from '../services/listService.js';

class ListController {
  async addNewList(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid } = req.params;
      const { name } = req.body;
      if (!wsid || !deskid || !name || !req.user) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const list = await listService.addNewList(Number(wsid), Number(deskid), req.user.id, name);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async updateList(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, id } = req.params;
      const { description, isarchived, name } = req.body;
      if (!wsid || !deskid || (!description && !isarchived && !name) || !req.user || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const updatedList = await listService.updateList(
        Number(wsid),
        Number(deskid),
        req.user.id,
        Number(id),
        description,
        isarchived,
        name,
      );
      res.json(updatedList);
    } catch (err) {
      next(err);
    }
  }
  async deleteList(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, id } = req.params;
      if (!wsid || !deskid || !req.user || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await listService.deleteList(Number(wsid), Number(deskid), req.user.id, Number(id));
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async changeOrder(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, id } = req.params;
      const order = req.body.order;
      if (!wsid || !deskid || !req.user || !id || !order) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await listService.changeOrder(Number(wsid), Number(deskid), req.user.id, Number(id), order);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }
}

export default new ListController();
