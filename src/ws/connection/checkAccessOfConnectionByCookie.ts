import { Socket } from 'socket.io';
import tokenService from '../../services/tokenService.js';

export default function checkAccessOfConnectionByCookie(socket: Socket, cookie: string | undefined) {
  if (!cookie) {
    throw new Error('Ошибка соединения');
  }
  const token = cookie.split('; accessToken=')[1];
  const verified = tokenService.validateAccessToken(token);

  if (!token || !verified) {
    throw new Error('Доступ запрещён');
  }
  const { wspaceId, deskId } = socket.handshake.query;
  if (!wspaceId || !deskId) {
    throw new Error('Некорректные данные рабочего пространства');
  }
  return { wspaceId, deskId, verified };
}
