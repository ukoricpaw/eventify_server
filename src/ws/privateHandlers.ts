import { Socket } from 'socket.io';
import listService from '../services/listService.js';
import { GettingDeskType } from './publicHandlers.js';
import { DeskListInstance } from '../models/DeskList.js';
import listItemService from '../services/listItemService.js';
import { DeskListItemInstance } from '../models/DeskItem.js';
export default function privateHandlers(
  socket: Socket,
  userSessionParams: GettingDeskType,
  publicHandlers: {
    getDesk: (socketRender?: boolean) => Promise<void>;
    getNewColumn: (column: DeskListInstance, socketRender?: boolean) => void;
    getNewColumnItem: (listId: number, item: DeskListItemInstance, socketRender?: boolean) => void;
    emitErrorMessage: () => void;
    changeColumn: (listId: number, secondListId: number | null, socketRender?: boolean) => void;
  },
) {
  async function addColumnList(name: string) {
    try {
      const column = await listService.addNewList(
        userSessionParams.wsId,
        userSessionParams.deskId,
        userSessionParams.userId,
        name,
      );
      publicHandlers.getNewColumn(column, true);
    } catch (err) {
      publicHandlers.emitErrorMessage();
    }
  }

  async function deleteColumnList(listId: number) {
    try {
      await listService.deleteList(userSessionParams.wsId, userSessionParams.deskId, userSessionParams.userId, listId);
      await publicHandlers.getDesk(true);
    } catch (err) {
      publicHandlers.emitErrorMessage();
    }
  }

  async function reorderColumns(listId: number, order: number) {
    try {
      await listService.changeOrder(
        userSessionParams.wsId,
        userSessionParams.deskId,
        userSessionParams.userId,
        listId,
        order,
      );
      await publicHandlers.getDesk(false);
    } catch (err) {
      publicHandlers.emitErrorMessage();
    }
  }

  async function reorderItemsInColumns(listId: number, itemId: number, order: number, secondList: number | null) {
    try {
      await listItemService.changeOrder(userSessionParams.deskId, listId, itemId, order, secondList);
      publicHandlers.changeColumn(listId, secondList);
    } catch (err) {
      publicHandlers.emitErrorMessage();
    }
  }

  async function addNewItemToColumn(listId: number, name: string) {
    try {
      const listItem = await listItemService.addNewListItem(
        userSessionParams.wsId,
        userSessionParams.deskId,
        listId,
        userSessionParams.userId,
        name,
      );
      publicHandlers.getNewColumnItem(listId, listItem, true);
    } catch (err) {
      publicHandlers.emitErrorMessage();
    }
  }

  socket.on('list:add', addColumnList);
  socket.on('list:delete', deleteColumnList);
  socket.on('list:reorder', reorderColumns);
  socket.on('list:newItem', addNewItemToColumn);
  socket.on('item:reorder', reorderItemsInColumns);
}
