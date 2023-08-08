import { Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import deskService from '../services/deskService.js';
import { UploadedFile } from 'express-fileupload';
import deskActsService from '../services/deskActsService.js';

class DeskController {
  async addNewDesk(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const deskId = req.params.id;
      if (!deskId || !req.user) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const { name, description } = req.body;
      let img;
      if (req.files) {
        const background = req.files.background as UploadedFile;
        img = background;
      }
      if (!name) {
        throw ApiError.BadRequest('Некорректные данные');
      }

      const newDesk = await deskService.addNewDesk(Number(deskId), Number(req.user.id), name, description, img);
      res.json(newDesk);
    } catch (err) {
      next(err);
    }
  }

  async updateDesk(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, id } = req.params;
      const { delete_img } = req.body;
      if (!req.user) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      let img;
      if (req.files) {
        const background = req.files.background as UploadedFile;
        img = background;
      }
      await deskService.changeImage(Number(id), Number(wsid), req.user.id, img, delete_img);
      res.json({ message: 'Изображение было изменено' });
    } catch (err) {
      next(err);
    }
  }
  async deleteDesk(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, id } = req.params;
      if (!wsid || !id || !req.user) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await deskService.deleteDesk(Number(wsid), Number(id), req.user.id);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async getDesk(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, id } = req.params;
      const { archive } = req.query;
      if (!wsid || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      let userId = null;
      if (req.user) {
        userId = req.user.id;
      }
      let isArchived: true | null = null;
      if (archive === 'true') {
        isArchived = true;
      }
      const desk = await deskService.getFullDesk(Number(wsid), Number(id), userId, isArchived);
      res.json(desk);
    } catch (err) {
      next(err);
    }
  }

  async addDeskAct(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const deskAct = await deskActsService.addDeskAct(name);
      res.json(deskAct);
    } catch (err) {
      next(err);
    }
  }

  async deleteDeskAct(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await deskActsService.deleteDeskAct(Number(id));
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async getStory(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, id } = req.params;
      if (!wsid || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      let userId = null;
      if (req.user) {
        userId = req.user.id;
      }
      const story = await deskActsService.getStory(Number(wsid), Number(id), userId);
      res.json(story);
    } catch (err) {
      next(err);
    }
  }

  async getItems(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, id } = req.params;
      if (!wsid || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      let userId = null;
      if (req.user) {
        userId = req.user.id;
      }
      const items = await deskService.getItems(Number(wsid), Number(id), userId);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
}

export default new DeskController();
