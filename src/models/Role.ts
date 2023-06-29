import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db.js';

interface RoleAttributes {
  id: number;
  name: string;
}

interface RoleInstance extends Model<RoleAttributes, Optional<RoleAttributes, 'id'>>, RoleAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const Role = sequelize.define<RoleInstance>('role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
});

export default Role;
