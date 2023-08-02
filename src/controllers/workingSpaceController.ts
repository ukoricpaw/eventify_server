import { Response, NextFunction, Request } from 'express';
import ApiError from '../error/ApiError.js';
import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import workingSpaceService from '../services/workingSpaceService.js';
import getQueryParameters from '../utils/getQueryParameters.js';
class WorkingSpaceController {
  async addNewWorkingSpace(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name || !req.user) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const newWorkingSpace = await workingSpaceService.addNewWorkingSpace(name, description, req.user.id);
      res.json(newWorkingSpace);
    } catch (err) {
      next(err);
    }
  }

  async updateWorkingSpace(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const { name, description, isPrivate } = req.body;
      if (!req.user || !id || (!name && !description && description !== '' && !isPrivate)) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const changedWorkingSpace = await workingSpaceService.updateWorkingSpace(
        req.user.id,
        Number(id),
        name,
        description,
        isPrivate,
      );
      res.json(changedWorkingSpace);
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkingSpace(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id || !req.user) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await workingSpaceService.deleteWorkingSpace(Number(id), req.user.id);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async getSingleWorkingSpace(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      let userId = null;
      if (!id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      if (req.user) {
        userId = req.user.id;
      }
      const message = await workingSpaceService.getSinglePublicWS(userId, Number(id));
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async getAllWorkingSpaces(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.NoAccess('Нет доступа');
      }
      const workingSpaces = await workingSpaceService.getAllWorkingSpaces(req.user.id);
      res.json(workingSpaces);
    } catch (err) {
      next(err);
    }
  }

  async getAllPublicWS(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, page, search } = req.query;
      const queryParams = getQueryParameters(
        limit as string | undefined,
        page as string | undefined,
        search as string | undefined,
      );
      const workingSpaces = await workingSpaceService.getAllPublicWorkingSpaces(
        queryParams.offset,
        Number(queryParams.limit),
        queryParams.search,
      );
      res.json(workingSpaces);
    } catch (err) {
      next(err);
    }
  }

  async getAllPrivateWS(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { limit, page, search } = req.query;
      const queryParams = getQueryParameters(
        limit as string | undefined,
        page as string | undefined,
        search as string | undefined,
      );
      const workingSpaces = await workingSpaceService.getAllPrivateWorkingSpaces(
        queryParams.offset,
        Number(queryParams.limit),
        queryParams.search,
      );
      res.json(workingSpaces);
    } catch (err) {
      next(err);
    }
  }

  async inviteUserToWS(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { link } = req.params;
      if (!link || !req.user) {
        throw ApiError.BadRequest('Некорректная ссылка');
      }
      const message = await workingSpaceService.inviteUserToWS(req.user.id, link);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async changePermission(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const { roleId, userId } = req.body;
      if (!roleId || !req.user || !userId) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const message = await workingSpaceService.changePermission(Number(id), req.user.id, userId, roleId);
      res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async getAllWSUsers(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit, page, search } = req.query;
      const queryParams = getQueryParameters(
        limit as string | undefined,
        page as string | undefined,
        search as string | undefined,
      );
      if (!id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      let userId = null;
      if (req.user) {
        userId = req.user.id;
      }
      const users = await workingSpaceService.getAllWSUsers(
        Number(id),
        userId,
        Number(queryParams.offset),
        Number(queryParams.limit),
        queryParams.search,
      );
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
}

export default new WorkingSpaceController();
