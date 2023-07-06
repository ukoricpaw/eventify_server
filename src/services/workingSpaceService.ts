import WorkingSpace from '../models/WorkingSpace.js';
import WorkingSpaceRole from '../models/WorkingSpaceRole.js';
import ApiError from '../error/ApiError.js';
import Desk from '../models/Desk.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import { v4 } from 'uuid';

class WorkingSpaceService {
  async addNewWorkingSpace(name: string, description: string | undefined, userId: number) {
    const workingSpaces = await WorkingSpace.count({ where: { userId } });
    if (workingSpaces > 4) {
      throw ApiError.BadRequest('Превышен лимит рабочих пространств');
    }
    const inviteLink = v4();
    const newWorkingSpace = await WorkingSpace.create({ name, description, userId, private: true, inviteLink });
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
          exclude: ['createdAt', 'updatedAt', 'id'],
        },
      });
    }
    let workingSpace = null;
    if (workingSpaceRole && (workingSpaceRole.roleId === 1 || workingSpaceRole.roleId === 2)) {
      workingSpace = await WorkingSpace.findOne({
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
    } else {
      workingSpace = await WorkingSpace.findOne({
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
          exclude: ['createdAt', 'updatedAt', 'userId', 'inviteLink'],
        },
      });
    }
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    if (!workingSpaceRole && workingSpace.private) {
      throw ApiError.BadRequest('У Вас нет доступа к данному рабочему пространству');
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
        exclude: ['updatedAt', 'private', 'inviteLink'],
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

  async inviteUserToWS(userId: number, link: string) {
    const workingSpace = await WorkingSpace.findOne({ where: { inviteLink: link } });
    if (!workingSpace) {
      throw ApiError.BadRequest('Некорректная ссылка');
    }
    const workingSpaceRole = await WorkingSpaceRole.findOne({ where: { workingSpaceId: workingSpace.id, userId } });
    if (workingSpaceRole) {
      throw ApiError.BadRequest('Вы уже являетесь участником данного рабочего пространства');
    }
    await WorkingSpaceRole.create({ workingSpaceId: workingSpace.id, userId, roleId: 3 });
    return { message: `Теперь Вы участник рабочего пространства - ${workingSpace.name}` };
  }
}

export default new WorkingSpaceService();
