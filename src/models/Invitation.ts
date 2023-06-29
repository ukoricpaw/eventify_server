import { Model, Optional, DataTypes } from 'sequelize';
import sequelize from '../db.js';

interface InvitationAttributes {
  id: number;
  userId: number;
  inviting_user: string;
  workingSpaceId: number;
}

interface InvitationInstance
  extends Model<InvitationAttributes, Optional<InvitationAttributes, 'id'>>,
    InvitationAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const Invitation = sequelize.define<InvitationInstance>('invitation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  inviting_user: { type: DataTypes.STRING, allowNull: false },
  workingSpaceId: { type: DataTypes.INTEGER, allowNull: false },
});

export default Invitation;
