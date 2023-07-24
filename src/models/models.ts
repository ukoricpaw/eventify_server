import User from './User.js';
import Token from './Token.js';
import WorkingSpace from './WorkingSpace.js';
import Desk from './Desk.js';
import DeskList from './DeskList.js';
import DeskListItem from './DeskItem.js';
import WorkingSpaceRole from './WorkingSpaceRole.js';
import Role from './Role.js';
import DeskAct from './DeskAct.js';
import DeskStory from './DeskStory.js';

User.hasOne(Token, {
  sourceKey: 'id',
  foreignKey: 'userId',
});
Token.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(WorkingSpace, {
  sourceKey: 'id',
  foreignKey: 'userId',
});

WorkingSpace.belongsTo(User, {
  foreignKey: 'userId',
});

WorkingSpace.hasMany(Desk, {
  sourceKey: 'id',
  foreignKey: 'workingSpaceId',
});

Desk.belongsTo(WorkingSpace, {
  foreignKey: 'workingSpaceId',
});

Desk.hasMany(DeskList, {
  sourceKey: 'id',
  foreignKey: 'deskId',
});

Desk.hasMany(DeskListItem, {
  sourceKey: 'id',
  foreignKey: 'deskId',
});

DeskListItem.belongsTo(Desk, {
  foreignKey: 'deskId',
});

DeskList.belongsTo(Desk, {
  foreignKey: 'deskId',
});

DeskList.hasMany(DeskListItem, {
  sourceKey: 'id',
  foreignKey: 'deskListId',
});

DeskListItem.belongsTo(DeskList, {
  foreignKey: 'deskListId',
});

User.hasMany(WorkingSpaceRole, {
  sourceKey: 'id',
  foreignKey: 'userId',
});

WorkingSpaceRole.belongsTo(User, {
  foreignKey: 'userId',
});

WorkingSpace.hasMany(WorkingSpaceRole, {
  sourceKey: 'id',
  foreignKey: 'workingSpaceId',
});

WorkingSpaceRole.belongsTo(WorkingSpace, {
  foreignKey: 'workingSpaceId',
});

Role.hasMany(WorkingSpaceRole, {
  sourceKey: 'id',
  foreignKey: 'roleId',
});

WorkingSpaceRole.belongsTo(Role, {
  foreignKey: 'roleId',
});

DeskAct.hasMany(DeskStory, {
  sourceKey: 'id',
  foreignKey: 'deskActId',
});

DeskStory.belongsTo(DeskAct, {
  foreignKey: 'deskActId',
});

Desk.hasMany(DeskStory, {
  sourceKey: 'id',
  foreignKey: 'deskId',
});

DeskStory.belongsTo(Desk, {
  foreignKey: 'deskId',
});

User.hasMany(DeskStory, {
  sourceKey: 'id',
  foreignKey: 'userId',
});

DeskStory.belongsTo(User, {
  foreignKey: 'userId',
});
export default {
  User,
  Token,
  WorkingSpace,
  Desk,
  DeskList,
  DeskListItem,
  WorkingSpaceRole,
  Role,
  DeskAct,
  DeskStory,
};
