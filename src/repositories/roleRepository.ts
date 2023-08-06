import WorkingSpaceRole from '../models/WorkingSpaceRole.js';
import Role from '../models/Role.js';
import { roleSettingsType } from '../types/roleTypes.js';

class RoleRepository {
  async createRole(workingSpaceId: number, userId: number, roleId: number) {
    const role = await WorkingSpaceRole.create({ workingSpaceId, userId, roleId });
    return role;
  }

  async findByUserIdAndWorkingSpaceId({
    workingSpaceId,
    userId,
    includeRoleInfo,
  }: {
    workingSpaceId: number;
    userId: number;
    includeRoleInfo: boolean;
  }) {
    const roleSettings: roleSettingsType = {
      where: {
        workingSpaceId,
        userId,
      },
    };
    if (includeRoleInfo) {
      roleSettings.include = { model: Role, as: 'role' };
      roleSettings.attributes = {
        exclude: ['createdAt', 'updatedAt', 'id'],
      };
    }

    const role = await WorkingSpaceRole.findOne(roleSettings);
    return role;
  }
}

export default new RoleRepository();
