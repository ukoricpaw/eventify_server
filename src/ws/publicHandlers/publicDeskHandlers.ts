import { PublicHandlersType } from './publicHandlers.js';
import deskService from '../../services/deskService.js';

export default function publicDeskHandlers({ socket, io, emitErrorMessage, userSessionParams }: PublicHandlersType) {
  async function getDesk(socketRender?: boolean) {
    try {
      const desk = await deskService.searchDesk(userSessionParams.deskId, userSessionParams.wsId, true, null);
      if (socketRender) {
        io.in(String(userSessionParams.deskId)).emit('desk', { desk });
      } else {
        socket.to(String(userSessionParams.deskId)).emit('desk', { desk });
      }
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewDeskName(name: string) {
    try {
      io.in(String(userSessionParams.deskId)).emit('desk:newName', name);
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewDeskDescription(description: string | null) {
    try {
      io.in(String(userSessionParams.deskId)).emit('desk:newDescription', description);
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  return { getDesk, provideNewDeskDescription, provideNewDeskName };
}
