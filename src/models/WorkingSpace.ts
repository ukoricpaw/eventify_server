import sequelize from '../db.js';
import { Model, Optional, DataTypes } from 'sequelize';

interface WorkingSpaceAttributes {
  id: number;
  name: string;
  description?: string;
  private: boolean;
  userId: number;
  inviteLink: string;
}

interface WorkingSpaceInstance
  extends Model<WorkingSpaceAttributes, Optional<WorkingSpaceAttributes, 'id'>>,
    WorkingSpaceAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkingSpace = sequelize.define<WorkingSpaceInstance>('working_space', {
  id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  private: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  inviteLink: { type: DataTypes.STRING, allowNull: false, unique: true },
});
export default WorkingSpace;
