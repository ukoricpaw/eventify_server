import { DeskListInstance } from '../../models/DeskList.js';
import { PublicHandlersType } from './publicHandlers.js';
import listRepository from '../../repositories/listRepository.js';

export default function publicColumnHandlers({ socket, io, emitErrorMessage, userSessionParams }: PublicHandlersType) {
  function getNewColumn(column: DeskListInstance, socketRender?: boolean) {
    try {
      if (socketRender) {
        io.in(String(userSessionParams.deskId)).emit('desk:newcol', column);
      } else {
        socket.to(String(userSessionParams.deskId)).emit('desk:newcol', column);
      }
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  async function changeColumn(listId: number, secondListId: number | null, socketRender?: boolean) {
    try {
      const list = await listRepository.findOneColumn(listId);
      let secondList = null;
      if (secondListId) {
        secondList = await listRepository.findOneColumn(secondListId);
      }

      if (socketRender) {
        io.in(String(userSessionParams.deskId)).emit('item:getNewOrder', { list, secondList });
      } else {
        socket.to(String(userSessionParams.deskId)).emit('item:getNewOrder', { list, secondList });
      }
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewColumnName(listId: number, name: string) {
    try {
      io.in(String(userSessionParams.deskId)).emit('list:newName', { listId, name });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewColumnDescription(listId: number, description: string | null) {
    try {
      io.in(String(userSessionParams.deskId)).emit('list:newDescription', { listId, description });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  return { getNewColumn, changeColumn, provideNewColumnDescription, provideNewColumnName };
}
