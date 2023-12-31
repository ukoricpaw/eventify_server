import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface TokenAttributes {
  id: number;
  refreshToken: string;
  userId: number;
}

interface TokenInstance extends Model<TokenAttributes, Optional<TokenAttributes, 'id'>>, TokenAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const Token = sequelize.define<TokenInstance>('token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  refreshToken: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

export default Token;
