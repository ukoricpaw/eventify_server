import { Socket, Server } from 'socket.io';
import deskService from '../services/deskService.js';
import DeskList, { DeskListInstance } from '../models/DeskList.js';
import { DeskListItemInstance } from '../models/DeskItem.js';
import DeskListItem from '../models/DeskItem.js';
import { deskListAttributes } from '../services/deskService.js';

export type GettingDeskType = {
  wsId: number;
  deskId: number;
  userId: number;
};

export default function publicHandlers(io: Server, socket: Socket, userSessionParams: GettingDeskType) {
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
      const list = await DeskList.findOne({
        where: { id: listId },
        order: [[{ model: DeskListItem, as: 'desk_list_items' }, 'order', 'ASC']],
        include: [
          {
            model: DeskListItem,
            order: [['order', 'ASC']],
            as: 'desk_list_items',
            attributes: deskListAttributes,
            required: false,
          },
        ],
      });
      let secondList = null;
      if (secondListId) {
        secondList = await DeskList.findOne({
          where: { id: secondListId },
          order: [[{ model: DeskListItem, as: 'desk_list_items' }, 'order', 'ASC']],
          include: [
            {
              model: DeskListItem,
              order: [['order', 'ASC']],
              as: 'desk_list_items',
              attributes: deskListAttributes,
              required: false,
            },
          ],
        });
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

  function provideNewColumnName(listId: number, name: string) {
    try {
      socket.to(String(userSessionParams.deskId)).emit('list:newName', { listId, name });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewColumnDescription(listId: number, description: string | null) {
    try {
      socket.to(String(userSessionParams.deskId)).emit('list:newDescription', { listId, description });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function getArchivedListItems(listId: number, type: 'toArchive' | 'fromArchive') {
    try {
      io.in(String(userSessionParams.deskId)).emit('list:archiveList', { listId, type });
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function emitErrorMessage(err: Error) {
    socket.emit('errorMessage', err.message ?? 'Произошла ошибка');
  }

  function provideNewDeskName(name: string) {
    try {
      socket.to(String(userSessionParams.deskId)).emit('desk:newName', name);
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  function provideNewDeskDescription(description: string | null) {
    try {
      socket.to(String(userSessionParams.deskId)).emit('desk:newDescription', description);
    } catch (err) {
      emitErrorMessage(err as Error);
    }
  }

  return {
    getDesk,
    getNewColumn,
    emitErrorMessage,
    getNewColumnItem,
    changeColumn,
    provideNewColumnName,
    provideNewColumnDescription,
    getArchivedListItems,
    provideNewDeskName,
    provideNewDeskDescription,
  };
}
