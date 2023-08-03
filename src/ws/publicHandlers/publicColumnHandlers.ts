import { DeskListInstance } from '../../models/DeskList.js';
import DeskListItem from '../../models/DeskItem.js';
import { deskListAttributes } from '../../services/deskService.js';
import DeskList from '../../models/DeskList.js';
import { PublicHandlersType } from './publicHandlers.js';

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
