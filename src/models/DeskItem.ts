import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface DeskListItemAttributes {
  id: number;
  name: string;
  description: string;
  deadline: Date;
  order: number;
  deskListId: number;
}

interface DeskListItemInstance
  extends Model<DeskListItemAttributes, Optional<DeskListItemAttributes, 'id'>>,
    DeskListItemAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeskListItem = sequelize.define<DeskListItemInstance>('desk_list', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  order: { type: DataTypes.INTEGER, allowNull: false },
  deskListId: { type: DataTypes.INTEGER, allowNull: false },
  deadline: { type: DataTypes.DATE, allowNull: false },
});

export default DeskListItem;
