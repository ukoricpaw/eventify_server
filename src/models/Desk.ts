import { DataTypes, Optional, Model } from 'sequelize';
import sequelize from '../db.js';

interface DeskAttributes {
  id: number;
  name: string;
  description?: string;
  background?: string | null;
  workingSpaceId: number;
}

interface DeskInstance extends Model<DeskAttributes, Optional<DeskAttributes, 'id'>>, DeskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const Desk = sequelize.define<DeskInstance>('desk', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  background: { type: DataTypes.STRING, allowNull: true },
  workingSpaceId: { type: DataTypes.INTEGER, allowNull: false },
});

export default Desk;
