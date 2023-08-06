import Role from '../models/Role.js';
import { WorkingSpaceRoleInstance } from '../models/WorkingSpaceRole.js';
import getRoleId from '../utils/getRoleId.js';

class RoleService {
  async addRole(name: string) {
    const role = await Role.create({ name });
    return role;
  }

  isRoleValid(workingSpaceRole: WorkingSpaceRoleInstance | null) {
    if (
      workingSpaceRole &&
      (workingSpaceRole.roleId === getRoleId('ADMIN') || workingSpaceRole.roleId === getRoleId('MODERATOR'))
    ) {
      return true;
    }
    return false;
  }

  async deleteRole(id: number) {
    const role = await Role.findOne({ where: { id } });
    if (!role) {
      return null;
    }
    await role.destroy();
    return { message: 'роль была удалена' };
  }
}

export default new RoleService();
