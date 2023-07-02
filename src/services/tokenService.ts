import Token from '../models/Token.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import ApiError from '../error/ApiError.js';
import UserDto from '../dtos/UserDto.js';

export interface UserPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER';
}

class TokenService {
  public async generateToken(payload: UserPayload) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY as string, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY as string, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  public async insertRefreshToken(userId: number, refresh: string) {
    const refreshToken = await Token.findOne({ where: { userId } });
    if (refreshToken) {
      refreshToken.refreshToken = refresh;
      await refreshToken.save();
    } else {
      await Token.create({ userId, refreshToken: refresh });
    }
  }

  public validateAccessToken(accessToken: string) {
    const verified = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY as string) as UserPayload;
    if (!verified) {
      return null;
    }
    return verified;
  }
  public validateRefreshToken(refreshToken: string) {
    const verified = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY as string) as UserPayload;
    if (!verified) {
      return null;
    }
    return verified;
  }

  public async refresh(refreshToken: string) {
    const verified = this.validateRefreshToken(refreshToken);
    if (!verified) {
      throw ApiError.NotAuthorized('Пользователь не авторизован');
    }
    const user = await User.findOne({ where: { id: verified.id } });
    if (!user) {
      throw ApiError.NotAuthorized('Ошибка запроса');
    }
    const tokenData = await this.generateToken({ id: user.id, email: user.email, role: user.role });
    const userDto = new UserDto(user);
    await this.insertRefreshToken(user.id, tokenData.refreshToken);
    return { ...tokenData, user: { ...userDto } };
  }

  public async deleteToken(refreshToken: string) {
    const token = await this.findToken(refreshToken);
    await token.destroy();
    return { message: 'logout' };
  }

  public async findToken(refreshToken: string) {
    const token = await Token.findOne({ where: { refreshToken } });
    if (!token) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    return token;
  }
}

export default new TokenService();
