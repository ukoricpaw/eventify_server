import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface DeskListAttributes {
  id: number;
  name: string;
  description: string | null;
  order: number;
  deskId: number;
  isarchived?: boolean | string;
}

interface DeskListInstance extends Model<DeskListAttributes, Optional<DeskListAttributes, 'id'>>, DeskListAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeskList = sequelize.define<DeskListInstance>('desk_list', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  order: { type: DataTypes.INTEGER, allowNull: false },
  isarchived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  deskId: { type: DataTypes.INTEGER, allowNull: false },
});

export default DeskList;
