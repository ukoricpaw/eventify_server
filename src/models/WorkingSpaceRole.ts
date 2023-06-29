import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface WorkingSpaceRoleAttributes {
  id: number;
  workingSpaceId: number;
  userId: number;
  roleId: number;
}

interface WorkingSpaceRoleInstance
  extends Model<WorkingSpaceRoleAttributes, Optional<WorkingSpaceRoleAttributes, 'id'>>,
    WorkingSpaceRoleAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkingSpaceRole = sequelize.define<WorkingSpaceRoleInstance>('working_space_role', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  workingSpaceId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
});

export default WorkingSpaceRole;
