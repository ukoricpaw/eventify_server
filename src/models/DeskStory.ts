import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface DeskStoryAttribute {
  id: number;
  userId: number;
  deskActId: number;
  deskId: number;
  firstItem: string;
  secondItem?: string | null;
}

interface DeskStoryInstance extends Model<DeskStoryAttribute, Optional<DeskStoryAttribute, 'id'>>, DeskStoryAttribute {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeskStory = sequelize.define<DeskStoryInstance>('desk_story', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  deskActId: { type: DataTypes.INTEGER, allowNull: false },
  deskId: { type: DataTypes.INTEGER, allowNull: false },
  firstItem: { type: DataTypes.STRING, allowNull: false },
  secondItem: { type: DataTypes.STRING, allowNull: true },
});

export default DeskStory;
