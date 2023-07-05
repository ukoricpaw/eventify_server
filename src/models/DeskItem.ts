import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface DeskListItemAttributes {
  id: number;
  name: string;
  description?: string | null;
  deadline?: Date | null;
  order: number;
  deskListId: number;
}

interface DeskListItemInstance
  extends Model<DeskListItemAttributes, Optional<DeskListItemAttributes, 'id'>>,
    DeskListItemAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeskListItem = sequelize.define<DeskListItemInstance>('desk_list_item', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  order: { type: DataTypes.INTEGER, allowNull: false },
  deskListId: { type: DataTypes.INTEGER, allowNull: false },
  deadline: { type: DataTypes.DATE, allowNull: true },
});

export default DeskListItem;
