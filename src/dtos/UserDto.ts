import { UserInstance } from '../models/User.js';

class UserDto {
  public id: number;
  public email: string;
  public isActivated: boolean;
  public role: 'ADMIN' | 'USER';
  public avatar: string | null | undefined;

  constructor(user: UserInstance) {
    this.id = user.id;
    this.email = user.email;
    this.isActivated = user.isActivated;
    this.role = user.role;
    this.avatar = user.avatar;
  }
}

export default UserDto;
