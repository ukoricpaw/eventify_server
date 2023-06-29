import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface DeskListAttributes {
  id: number;
  name: string;
  description: string;
  order: number;
  deskId: number;
}

interface DeskListInstance extends Model<DeskListAttributes, Optional<DeskListAttributes, 'id'>>, DeskListAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeskList = sequelize.define<DeskListInstance>('desk_list', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  order: { type: DataTypes.INTEGER, allowNull: false },
  deskId: { type: DataTypes.INTEGER, allowNull: false },
});

export default DeskList;