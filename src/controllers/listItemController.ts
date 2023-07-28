import ApiError from '../error/ApiError.js';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import { Response, NextFunction } from 'express';
import listItemService from '../services/listItemService.js';

class ListItemController {
  async addNewItem(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, listid } = req.params;
      const { name } = req.body;
      if (!wsid || !deskid || !listid || !req.user || !name) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const newListItem = await listItemService.addNewListItem(
        Number(wsid),
        Number(deskid),
        Number(listid),
        req.user.id,
        name,
      );
      res.json(newListItem);
    } catch (err) {
      next(err);
    }
  }

  async updateListItem(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, listid, id } = req.params;
      const { name, description, deadline } = req.body;
      if (!wsid || !deskid || !listid || !req.user || !id || (!name && !description && !deadline)) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const updatedItem = await listItemService.updateListItem(
        Number(wsid),
        Number(deskid),
        Number(listid),
        Number(id),
        req.user.id,
        name,
        description,
        new Date(deadline),
      );
      res.json(updatedItem);
    } catch (err) {
      next(err);
    }
  }

  async deleteListItem(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, listid, id } = req.params;
      if (!wsid || !deskid || !listid || !req.user || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await listItemService.deleteListItem(
        Number(wsid),
        Number(deskid),
        Number(listid),
        Number(id),
        req.user.id,
      );
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async changeOrder(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, deskid, listid, id } = req.params;
      const { order, listId } = req.body;
      let list = null;
      if (!wsid || !deskid || !req.user || !listid || !id || (!order && order !== 0)) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      if (listId) {
        list = listId;
      }
      const message = await listItemService.changeOrder(Number(deskid), Number(listid), Number(id), order, list);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }
}

export default new ListItemController();
