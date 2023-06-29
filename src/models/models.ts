import { User } from './User.js';
import { Token } from './Token.js';

User.hasOne(Token, {
  sourceKey: 'id',
  foreignKey: 'userId',
});
Token.belongsTo(User, {
  foreignKey: 'userId',
});

export default { User, Token };
