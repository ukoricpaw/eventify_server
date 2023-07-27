import { Socket, Server } from 'socket.io';
import deskService from '../services/deskService.js';

export type GettingDeskType = {
  wsId: number;
  deskId: number;
  userId: number;
};

export default function publicHandlers(io: Server, socket: Socket, userSessionParams: GettingDeskType) {
  async function getDesk(socketRender?: boolean) {
    const desk = await deskService.getFullDesk(
      userSessionParams.wsId,
      userSessionParams.deskId,
      userSessionParams.userId,
      null,
    );
    const items = await deskService.getItems(
      userSessionParams.wsId,
      userSessionParams.deskId,
      userSessionParams.userId,
    );
    if (socketRender) {
      io.in(String(userSessionParams.deskId)).emit('desk', { desk, items });
    } else {
      socket.to(String(userSessionParams.deskId)).emit('desk', { desk, items });
    }
  }

  return { getDesk };
}
