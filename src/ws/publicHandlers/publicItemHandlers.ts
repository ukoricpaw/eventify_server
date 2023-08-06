import { PublicHandlersType } from './publicHandlers.js';
import { DeskListItemInstance } from '../../models/DeskItem.js';

export default function publicItemHandlers({ userSessionParams, io, socket, emitErrorMessage }: PublicHandlersType) {
  function getArchivedListItems(listId: number, type: 'toArchive' | 'fromArchive') {
    try {
      io.in(String(userSessionParams.deskId)).emit('list:archiveList', { listId, type });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function getNewColumnItem(listId: number, item: DeskListItemInstance, socketRender?: boolean) {
    try {
      if (socketRender) {
        io.in(String(userSessionParams.deskId)).emit('list:getItem', { listId, item });
      } else {
        socket.to(String(userSessionParams.deskId)).emit('list:getItem', { listId, item });
      }
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideColumnItemName(item: number, name: string) {
    try {
      io.in(String(userSessionParams.deskId)).emit('item:newName', { itemId: item, name });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewItemDescription(item: number, description: string) {
    try {
      io.in(String(userSessionParams.deskId)).emit('item:newDescription', { itemId: item, description });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewItemDeadline(item: number, deadline: Date) {
    try {
      io.in(String(userSessionParams.deskId)).emit('item:newDeadline', { itemId: item, deadline });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  return {
    getArchivedListItems,
    getNewColumnItem,
    provideColumnItemName,
    provideNewItemDescription,
    provideNewItemDeadline,
  };
}
