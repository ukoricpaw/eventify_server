import User from '../models/User.js';
import ApiError from '../error/ApiError.js';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import UserDto from '../dtos/UserDto.js';
import tokenService from './tokenService.js';
import mailService from './mailService.js';
import { UploadedFile } from 'express-fileupload';
import imageService from './imageService.js';
import { userAttributes } from './workingSpaceService.js';

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

  async updateUser(id: number, avatar: UploadedFile | null, delete_img: boolean | null) {
    const user = await User.findOne({ where: { id }, attributes: userAttributes });
    if (!user) {
      throw ApiError.BadRequest('Данного пользователя не существует');
    }
    if (delete_img) {
      if (!user.avatar) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      imageService.deleteFile(user.avatar);
      user.avatar = null;
    } else if (avatar) {
      const avatarName = v4() + '.jpg';
      if (user.avatar) {
        imageService.deleteFile(user.avatar);
      }
      await imageService.uploadFile(avatarName, avatar.data);
      user.avatar = avatarName;
    }
    await user.save();
    return user;
  }

  async changeUserPassword(id: number, oldPassword: string, newPassword: string) {
    const candidate = await User.findOne({ where: { id } });
    if (!candidate) {
      throw ApiError.BadRequest('Данного пользователя не существует');
    }
    const compared = await bcrypt.compare(oldPassword, candidate.password);
    if (!compared) {
      throw ApiError.BadRequest('Неверный старый пароль');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 5);
    candidate.password = hashedPassword;
    await candidate.save();
    return { message: 'Пароль был успешно изменён' };
  }
}

export default new UserService();
