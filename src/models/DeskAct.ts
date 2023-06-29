import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface DeskActAttributes {
  id: number;
  name: string;
}

interface DeskActInstance extends Model<DeskActAttributes, Optional<DeskActAttributes, 'id'>>, DeskActAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeskAct = sequelize.define<DeskActInstance>('desk_act', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
});

export default DeskAct;
