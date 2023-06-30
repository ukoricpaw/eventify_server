import WorkingSpace from '../models/WorkingSpace.js';
import WorkingSpaceRole from '../models/WorkingSpaceRole.js';
import ApiError from '../error/ApiError.js';
import Desk from '../models/Desk.js';
import Role from '../models/Role.js';
import User from '../models/User.js';

class WorkingSpaceService {
  async addNewWorkingSpace(name: string, description: string | undefined, userId: number) {
    const workingSpaces = await WorkingSpace.findAndCountAll({ where: { userId } });
    if (workingSpaces.count > 4) {
      throw ApiError.BadRequest('Превышен лимит рабочих пространств');
    }
    const newWorkingSpace = await WorkingSpace.create({ name, description, userId, private: true });
    const role = await WorkingSpaceRole.create({ workingSpaceId: newWorkingSpace.id, userId, roleId: 1 });
    return { newWorkingSpace, role };
  }

  async getWorkingSpaceRole(workingSpaceId: number, userId: number) {
    const workingSpaceRole = await WorkingSpaceRole.findOne({
      where: {
        workingSpaceId,
        userId,
      },
    });
    if (!workingSpaceRole || workingSpaceRole.roleId !== 1) {
      throw ApiError.NoAccess('Нет доступа');
    }
  }

  async updateWorkingSpace(
    userId: number,
    workingSpaceId: number,
    name: string | undefined,
    description: string | undefined,
    isPrivate: boolean | undefined,
  ) {
    await this.getWorkingSpaceRole(workingSpaceId, userId);
    const workingSpace = await WorkingSpace.findOne({ where: { id: workingSpaceId } });
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    workingSpace.name = name || workingSpace.name;
    workingSpace.description = description || workingSpace.description;
    workingSpace.private = isPrivate || workingSpace.private;
    await workingSpace.save();
    return workingSpace;
  }

  async deleteWorkingSpace(workingSpaceId: number, userId: number) {
    await this.getWorkingSpaceRole(workingSpaceId, userId);
    const workingSpace = await WorkingSpace.findOne({ where: { id: workingSpaceId } });
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    await workingSpace.destroy();
    return { message: 'Рабочее пространство было удалено' };
  }

  async getSinglePublicWS(userId: number | null, workingSpaceId: number) {
    const workingSpace = await WorkingSpace.findOne({
      where: { id: workingSpaceId },
      include: [
        { model: Desk, as: 'desks', required: false },
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'isActivated', 'role', 'createdAt', 'updatedAt', 'activationLink'],
          },
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'userId'],
      },
    });
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    let workingSpaceRole = null;
    if (userId) {
      workingSpaceRole = await WorkingSpaceRole.findOne({
        where: {
          workingSpaceId,
          userId,
        },
        include: {
          model: Role,
          as: 'role',
        },
        attributes: {
          exclude: ['roleId', 'createdAt', 'updatedAt', 'id'],
        },
      });

      if (!workingSpaceRole && workingSpace.private) {
        throw ApiError.BadRequest('У Вас нет доступа к данному рабочему пространству');
      }
    }
    return { workingSpace, workingSpaceRole };
  }

  async getAllWorkingSpaces(userId: number) {
    const workingSpaces = await WorkingSpace.findAndCountAll({
      where: { userId },
      attributes: {
        exclude: ['updatedAt'],
      },
      order: [['id', 'ASC']],
    });
    return workingSpaces;
  }

  async getAllPublicWorkingSpaces(offset: number, limit: number) {
    const workingSpaces = await WorkingSpace.findAndCountAll({
      where: {
        private: false,
      },
      attributes: {
        exclude: ['updatedAt', 'private'],
      },
      include: {
        model: User,
        as: 'user',
        attributes: {
          exclude: ['password', 'isActivated', 'role', 'createdAt', 'updatedAt', 'activationLink'],
        },
      },
      offset,
      limit,
    });
    return workingSpaces;
  }

  async getAllPrivateWorkingSpaces(offset: number, limit: number) {
    const workingSpaces = await WorkingSpace.findAndCountAll({
      attributes: {
        exclude: ['updatedAt'],
      },
      include: {
        model: User,
        as: 'user',
        attributes: {
          exclude: ['password', 'isActivated', 'role', 'createdAt', 'updatedAt', 'activationLink'],
        },
      },
      offset,
      limit,
    });
    return workingSpaces;
  }
}

export default new WorkingSpaceService();
