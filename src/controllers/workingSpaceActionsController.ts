import { ReqWithUserPayload } from '../middlewares/checkAuthMiddleware.js';
import { Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';
import getQueryParameters from '../utils/getQueryParameters.js';
import workingSpaceActionsService from '../services/workingSpaceActionsService.js';

class WorkingSpaceActionsController {
  async inviteUserToWS(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { link } = req.params;
      if (!link || !req.user) {
        throw ApiError.BadRequest('Некорректная ссылка');
      }
      const message = await workingSpaceActionsService.inviteUserToWS(req.user.id, link);
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
      const message = await workingSpaceActionsService.changePermission(Number(id), req.user.id, userId, roleId);
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
      const users = await workingSpaceActionsService.getAllWSUsers(
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

  async leaveFromWorkingSpace(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!req.user) {
        throw ApiError.NotAuthorized('Ошибка доступа');
      }
      const messageOfResult = await workingSpaceActionsService.leaveFromWorkingSpace(req.user.id, Number(id));
      res.json(messageOfResult);
    } catch (err) {
      next(err);
    }
  }

  async deleteUserFromWorkingSpace(req: ReqWithUserPayload, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      if (!req.user) {
        throw ApiError.NotAuthorized('Ошибка доступа');
      }
      if (!userId || !id) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      const messageOfResult = await workingSpaceActionsService.deleteUserFromWorkingSpace(
        req.user.id,
        userId,
        Number(id),
      );
      res.json(messageOfResult);
    } catch (err) {
      next(err);
    }
  }
}

export default new WorkingSpaceActionsController();
