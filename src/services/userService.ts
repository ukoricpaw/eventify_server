import User from '../models/User.js';
import ApiError from '../error/ApiError.js';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import UserDto from '../dtos/UserDto.js';
import tokenService from './tokenService.js';
import mailService from './mailService.js';

class UserService {
  async registration(email: string, password: string, role: 'ADMIN' | 'USER') {
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw ApiError.BadRequest('Пользователь с таким email уже существует');
    }
    const activationLink = v4();
    const hashedPassword = await bcrypt.hash(password, 5);
    const user = await User.create({
      email,
      password: hashedPassword,
      activationLink,
      isActivated: false,
      role,
    });
    await mailService.sendMail(user.email, user.activationLink as string);
    const userDto = new UserDto(user);
    const tokens = await tokenService.generateToken({ ...userDto });
    await tokenService.insertRefreshToken(user.id, tokens.refreshToken);
    return { ...tokens, user: { ...userDto } };
  }

  async login(email: string, password: string) {
    const candidate = await User.findOne({ where: { email } });
    if (!candidate) {
      throw ApiError.BadRequest('Пользователя с данным email не существует');
    }
    const compared = await bcrypt.compare(password, candidate.password);
    if (!compared) {
      throw ApiError.BadRequest('Неверный пароль');
    }
    const userDto = new UserDto(candidate);
    const tokens = await tokenService.generateToken({ ...userDto });
    await tokenService.insertRefreshToken(candidate.id, tokens.refreshToken);
    return { ...tokens, user: { ...userDto } };
  }
}

export default new UserService();
