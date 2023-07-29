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
      const desk = await deskService.getFullDesk(
        userSessionParams.wsId,
        userSessionParams.deskId,
        userSessionParams.userId,
        null,
      );
      if (socketRender) {
        io.in(String(userSessionParams.deskId)).emit('desk', { desk });
      } else {
        socket.to(String(userSessionParams.deskId)).emit('desk', { desk });
      }
    } catch (err) {
      emitErrorMessage();
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
      emitErrorMessage();
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
      emitErrorMessage();
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
      emitErrorMessage();
    }
  }

  function emitErrorMessage() {
    socket.emit('errorMessage', 'Ошибка запроса');
  }

  return { getDesk, getNewColumn, emitErrorMessage, getNewColumnItem, changeColumn };
}
