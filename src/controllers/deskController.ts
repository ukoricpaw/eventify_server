import { Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import deskService from '../services/deskService.js';
import { UploadedFile } from 'express-fileupload';

class DeskController {
  async addNewDesk(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id || !req.user) {
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

      const newDesk = await deskService.addNewDesk(Number(id), Number(req.user.id), name, description, img);
      res.json(newDesk);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async updateDesk(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { wsid, id } = req.params;
      if (!wsid || !id || !req.user) {
        throw ApiError.BadRequest('Некорректные параметры');
      }
      const { name, description, delete_img } = req.body;
      if (!name && !description && !delete_img && !req.files) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      let img;
      if (req.files) {
        const background = req.files.background as UploadedFile;
        img = background;
      }
      const updatedDesk = await deskService.updateDesk(
        Number(wsid),
        Number(id),
        req.user.id,
        name,
        description,
        img,
        delete_img,
      );
      res.json(updatedDesk);
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
      const deskAct = await deskService.addDeskAct(name);
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
      const message = await deskService.deleteDeskAct(Number(id));
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
      const story = await deskService.getStory(Number(wsid), Number(id), userId);
      res.json(story);
    } catch (err) {
      next(err);
    }
  }
}

export default new DeskController();
