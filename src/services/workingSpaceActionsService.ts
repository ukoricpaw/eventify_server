import ApiError from '../error/ApiError.js';
import workingSpaceRepository from '../repositories/workingSpaceRepository.js';
import getRoleId from '../utils/getRoleId.js';
import roleRepository from '../repositories/roleRepository.js';

class WorkingSpaceActionsService {
  async inviteUserToWS(userId: number, link: string) {
    const workingSpace = await workingSpaceRepository.findByLink(link);
    await workingSpaceRepository.checkCountOfAllWorkingSpacesByUserId(userId);
    const workingSpaceRole = await roleRepository.findByUserIdAndWorkingSpaceId({
      workingSpaceId: workingSpace.id,
      userId,
      includeRoleInfo: false,
    });
    if (workingSpaceRole) {
      throw ApiError.BadRequest('Вы уже являетесь участником данного рабочего пространства');
    }
    const roleId = getRoleId('READER');
    await roleRepository.createRole(workingSpace.id, userId, roleId);
    return { message: `Теперь Вы участник рабочего пространства - ${workingSpace.name}` };
  }

  async changePermission(wsId: number, ownerId: number, userId: number, roleId: number) {
    const checkRoleRegEx = /[2-3]/g;
    if (!roleId.toString().match(checkRoleRegEx)) {
      throw ApiError.BadRequest('Такой роли не существует');
    }
    const checkOwnerRole = await roleRepository.findByUserIdAndWorkingSpaceId({
      workingSpaceId: wsId,
      userId: ownerId,
      includeRoleInfo: false,
    });
    if (!checkOwnerRole || checkOwnerRole.roleId !== 1) {
      throw ApiError.NoAccess('Нет доступа');
    }
    const userRole = await roleRepository.findByUserIdAndWorkingSpaceId({
      workingSpaceId: wsId,
      userId,
      includeRoleInfo: false,
    });
    if (!userRole) {
      throw ApiError.BadRequest('Пользователь не является участником рабочего пространства');
    }
    userRole.roleId = roleId;
    await userRole.save();
    return { message: 'Роль была изменена' };
  }

  async getAllWSUsers(wsId: number, reqUserId: number | null, offset: number, limit: number, search: string) {
    let userId = reqUserId;
    if (!userId) {
      userId = -1;
    }
    const wsRole = await roleRepository.findByUserIdAndWorkingSpaceId({
      workingSpaceId: wsId,
      userId,
      includeRoleInfo: false,
    });
    const ws = await workingSpaceRepository.findByWorkingSpaceId(wsId);
    if (!ws || (!wsRole && ws.private)) {
      throw ApiError.BadRequest('Нет доступа');
    }
    const users = await workingSpaceRepository.getAllWorkingSpaceUsers(wsId, search, limit, offset);
    return users;
  }

  async leaveFromWorkingSpace(userId: number, wsId: number) {
    const role = await roleRepository.findByUserIdAndWorkingSpaceId({
      workingSpaceId: wsId,
      userId,
      includeRoleInfo: false,
    });
    if (!role) {
      throw ApiError.BadRequest('Пользователь не состоит в участниках данного рабочего пространства');
    }
    if (role.roleId === 1) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    await role.destroy();
    return { message: 'Вы покинули рабочее пространство' };
  }

  async deleteUserFromWorkingSpace(userId: number, userThatWillBeDeleted: number, wsId: number) {
    if (userId === userThatWillBeDeleted) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    const roleOfOwnUser = await roleRepository.findByUserIdAndWorkingSpaceId({
      userId,
      workingSpaceId: wsId,
      includeRoleInfo: false,
    });
    const roleOfResponsedUser = await roleRepository.findByUserIdAndWorkingSpaceId({
      userId: userThatWillBeDeleted,
      workingSpaceId: wsId,
      includeRoleInfo: false,
    });
    if (!roleOfOwnUser || !roleOfResponsedUser) {
      throw ApiError.NotAuthorized('Ошибка доступа');
    }
    if (roleOfOwnUser.roleId !== 1) {
      throw ApiError.NoAccess('Отказано в доступе');
    }
    await roleOfResponsedUser.destroy();
    return { message: 'Пользователь покинул рабочее пространство' };
  }
}

export default new WorkingSpaceActionsService();
