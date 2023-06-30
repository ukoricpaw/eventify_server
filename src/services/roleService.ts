import Role from '../models/Role.js';

class RoleService {
  async addRole(name: string) {
    const role = await Role.create({ name });
    return role;
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
