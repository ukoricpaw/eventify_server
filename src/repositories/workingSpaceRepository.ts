import WorkingSpace, { WorkingSpaceInstance } from '../models/WorkingSpace.js';
import Desk from '../models/Desk.js';
import User from '../models/User.js';
import WorkingSpaceRole from '../models/WorkingSpaceRole.js';
import { Attributes, FindAndCountOptions, Op } from 'sequelize';
import Role from '../models/Role.js';
import ApiError from '../error/ApiError.js';

class WorkingSpaceRepository {
  userAttributes = {
    exclude: ['password', 'isActivated', 'role', 'createdAt', 'updatedAt', 'activationLink'],
  };

  async getCountByUserId(userId: number) {
    const data = await WorkingSpace.count({ where: { userId } });
    return data;
  }

  async findByWorkingSpaceId(workingSpaceId: number) {
    const data = await WorkingSpace.findOne({ where: { id: workingSpaceId } });
    return data;
  }

  async findByLink(inviteLink: string) {
    const data = await WorkingSpace.findOne({ where: { inviteLink } });
    if (!data) {
      throw ApiError.BadRequest('Некорректная ссылка');
    }
    return data;
  }

  async createNewWorkingSpace(
    name: string,
    description: string | undefined,
    userId: number,
    isPrivate: boolean,
    inviteLink: string,
  ) {
    const data = await WorkingSpace.create({ name, description, userId, private: isPrivate, inviteLink });
    return data;
  }

  async findSingleWorkingSpace(workingSpaceId: number, roleIsValid: boolean) {
    const excludeAttributes = ['createdAt', 'updatedAt', 'userId'];
    if (!roleIsValid) {
      excludeAttributes.push('inviteLink');
    }
    const workingSpace = await WorkingSpace.findOne({
      where: { id: workingSpaceId },
      include: [
        { model: Desk, as: 'desks', required: false },
        {
          model: User,
          as: 'user',
          attributes: this.userAttributes,
        },
      ],
      attributes: {
        exclude: excludeAttributes,
      },
    });
    return workingSpace;
  }

  getOptionsForAllWorkingSpacesBySearch({
    userId,
    search,
    limit,
    offset,
  }: {
    userId: number;
    search: string;
    limit: number;
    offset: number;
  }): Omit<FindAndCountOptions<Attributes<WorkingSpaceInstance>>, 'group'> {
    return {
      attributes: {
        exclude: ['updatedAt', 'description', 'private', 'inviteLink', 'createdAt'],
      },
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      include: [
        {
          model: WorkingSpaceRole,
          as: 'working_space_roles',
          where: {
            userId,
          },
          attributes: {
            exclude: ['workingSpaceId', 'userId', 'createdAt', 'updatedAt', 'id'],
          },
        },
      ],
      order: [['id', 'ASC']],
      limit,
      offset,
    };
  }

  async getAllWorkingSpacesByUserId({
    userId,
    search,
    limit,
    offset,
  }: {
    userId: number;
    search: string;
    limit: number;
    offset: number;
  }) {
    const workingSpaces = await WorkingSpace.findAndCountAll(
      this.getOptionsForAllWorkingSpacesBySearch({ userId, limit, offset, search }),
    );
    return workingSpaces;
  }

  async checkCountOfAllWorkingSpacesByUserId(userId: number) {
    const count = await WorkingSpace.count({
      include: [
        {
          model: WorkingSpaceRole,
          as: 'working_space_roles',
          where: {
            userId,
            roleId: {
              [Op.ne]: 1,
            },
          },
        },
      ],
    });
    if (count > 4) {
      throw ApiError.BadRequest('Превышен лимит рабочих пространств');
    }
    return count;
  }

  async getAllWorkingSpacesBySearch({
    offset,
    limit,
    search,
    isPrivate,
  }: {
    offset: number;
    limit: number;
    search: string;
    isPrivate: boolean;
  }) {
    let excludeAttributes = ['updatedAt', 'private', 'inviteLink'];
    if (isPrivate) {
      excludeAttributes = ['updatedAt'];
    }

    const workingSpaces = await WorkingSpace.findAndCountAll({
      where: {
        private: isPrivate,
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      attributes: {
        exclude: excludeAttributes,
      },
      include: {
        model: User,
        as: 'user',
        attributes: this.userAttributes,
      },
      offset,
      limit,
    });
    return workingSpaces;
  }

  async getAllWorkingSpaceUsers(workingSpaceId: number, search: string, limit: number, offset: number) {
    const workingSpaceUsers = await WorkingSpaceRole.findAndCountAll({
      where: {
        workingSpaceId,
      },
      include: [
        {
          model: Role,
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          model: User,
          where: {
            email: {
              [Op.like]: `%${search}%`,
            },
          },
          attributes: this.userAttributes,
        },
      ],
      order: [['roleId', 'ASC']],
      limit,
      offset,
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'id'],
      },
    });
    return workingSpaceUsers;
  }
}

export default new WorkingSpaceRepository();
