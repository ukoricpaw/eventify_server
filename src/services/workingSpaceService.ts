import ApiError from '../error/ApiError.js';
import { v4 } from 'uuid';
import imageService from './imageService.js';
import workingSpaceRepository from '../repositories/workingSpaceRepository.js';
import getRoleId from '../utils/getRoleId.js';
import roleRepository from '../repositories/roleRepository.js';
import deskRepository from '../repositories/deskRepository.js';
import roleService from './roleService.js';

class WorkingSpaceService {
  async addNewWorkingSpace(name: string, description: string | undefined, userId: number) {
    const workingSpacesCount = await workingSpaceRepository.getCountByUserId(userId);
    if (workingSpacesCount > 4) {
      throw ApiError.BadRequest('Превышен лимит рабочих пространств');
    }
    const inviteLink = v4();
    const newWorkingSpace = await workingSpaceRepository.createNewWorkingSpace(
      name,
      description,
      userId,
      true,
      inviteLink,
    );
    const roleId = getRoleId('ADMIN');
    const role = await roleRepository.createRole(newWorkingSpace.id, userId, roleId);
    return { newWorkingSpace, role };
  }

  async checkWorkingSpaceRole(workingSpaceId: number, userId: number) {
    const role = await roleRepository.findByUserIdAndWorkingSpaceId({ workingSpaceId, userId, includeRoleInfo: false });
    if (!role || role.roleId !== 1) {
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
    await this.checkWorkingSpaceRole(workingSpaceId, userId);
    const workingSpace = await workingSpaceRepository.findByWorkingSpaceId(workingSpaceId);
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    workingSpace.name = name || workingSpace.name;
    workingSpace.description = description ?? workingSpace.description;
    workingSpace.private = isPrivate || workingSpace.private;
    await workingSpace.save();
    return workingSpace;
  }

  async deleteWorkingSpace(workingSpaceId: number, userId: number) {
    await this.checkWorkingSpaceRole(workingSpaceId, userId);
    const workingSpace = await workingSpaceRepository.findByWorkingSpaceId(workingSpaceId);
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    const allDesks = await deskRepository.findAllByWorkingSpaceId(workingSpaceId);
    if (allDesks) {
      allDesks.forEach(desk => {
        if (desk.background) {
          imageService.deleteFile(desk.background);
        }
      });
    }
    await workingSpace.destroy();
    return { message: 'Рабочее пространство было удалено' };
  }

  async getSinglePublicWS(userId: number | null, workingSpaceId: number) {
    let workingSpaceRole = null;
    if (userId) {
      workingSpaceRole = await roleRepository.findByUserIdAndWorkingSpaceId({
        workingSpaceId,
        userId,
        includeRoleInfo: true,
      });
    }
    let workingSpace = null;
    if (roleService.isRoleValid(workingSpaceRole)) {
      workingSpace = await workingSpaceRepository.findSingleWorkingSpace(workingSpaceId, true);
    } else {
      workingSpace = await workingSpaceRepository.findSingleWorkingSpace(workingSpaceId, false);
    }
    if (!workingSpace) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    if (!workingSpaceRole && workingSpace.private) {
      throw ApiError.BadRequest('У Вас нет доступа к данному рабочему пространству');
    }
    return { workingSpace, workingSpaceRole };
  }

  async getAllWorkingSpaces(userId: number, page: number, search: string) {
    const parametersObject = {
      userId,
      limit: 10,
      offset: page * 10 - 10,
      search,
    };
    const workingSpaces = await workingSpaceRepository.getAllWorkingSpacesByUserId(parametersObject);
    return workingSpaces;
  }

  async getAllUsersWorkingSpaces(offset: number, limit: number, search: string) {
    const workingSpaces = await workingSpaceRepository.getAllWorkingSpacesBySearch({
      offset,
      limit,
      search,
      isPrivate: false,
    });
    return workingSpaces;
  }

  async getAllPrivateWorkingSpaces(offset: number, limit: number, search: string) {
    const workingSpaces = await workingSpaceRepository.getAllWorkingSpacesBySearch({
      offset,
      limit,
      search,
      isPrivate: true,
    });
    return workingSpaces;
  }
}

export default new WorkingSpaceService();
