import { UserInstance } from '../models/User.js';

class UserDto {
  public id: number;
  public email: string;
  public isActivated: boolean;
  public role: 'ADMIN' | 'USER';

  constructor(user: UserInstance) {
    this.id = user.id;
    this.email = user.email;
    this.isActivated = user.isActivated;
    this.role = user.role;
  }
}

export default UserDto;
