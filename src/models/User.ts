import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  isActivated: boolean;
  activationLink: string | null;
}

export interface UserInstance extends Model<UserAttributes, Optional<UserAttributes, 'id'>>, UserAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const User = sequelize.define<UserInstance>('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isActivated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  activationLink: { type: DataTypes.STRING, allowNull: true },
});

export default User;
