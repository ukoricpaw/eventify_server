import { DataTypes, Optional, Model } from 'sequelize';
import sequelize from '../db.js';

interface DeskAttributes {
  id: number;
  name: string;
  description: string;
  background: string;
  isarchived: boolean;
}

interface DeskInstance extends Model<DeskAttributes, Optional<DeskAttributes, 'id'>>, DeskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const Desk = sequelize.define<DeskInstance>('desk', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  background: { type: DataTypes.STRING, allowNull: true },
  isarchived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

export default Desk;
