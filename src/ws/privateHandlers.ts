import { Socket } from 'socket.io';
import listService from '../services/listService.js';
import { GettingDeskType } from './publicHandlers.js';
import listItemService from '../services/listItemService.js';
import { PublicHandlersType } from './types.js';
import deskService from '../services/deskService.js';
export default function privateHandlers(
  socket: Socket,
  userSessionParams: GettingDeskType,
  publicHandlers: PublicHandlersType,
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
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function deleteColumnList(listId: number) {
    try {
      await listService.deleteList(userSessionParams.wsId, userSessionParams.deskId, userSessionParams.userId, listId);
      await publicHandlers.getDesk(false);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
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
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function reorderItemsInColumns(listId: number, itemId: number, order: number, secondList: number | null) {
    try {
      await listItemService.changeOrder(userSessionParams.deskId, listId, itemId, order, secondList);
      publicHandlers.changeColumn(listId, secondList);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
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
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeColumnName(listId: number, name: string) {
    try {
      const listName = await listService.changeListName(
        name,
        listId,
        userSessionParams.deskId,
        userSessionParams.userId,
      );
      publicHandlers.provideNewColumnName(listId, listName);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeColumnDescription(listId: number, description: string) {
    try {
      const listDescription = await listService.changeListDescription(
        description,
        listId,
        userSessionParams.deskId,
        userSessionParams.userId,
      );
      publicHandlers.provideNewColumnDescription(listId, listDescription);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeDeskName(deskId: number, name: string) {
    try {
      const deskName = await deskService.changeDeskName(deskId, userSessionParams.wsId, userSessionParams.userId, name);
      publicHandlers.provideNewDeskName(deskName);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeColumnArchiveStatus(listId: number, isarchived: string) {
    try {
      await listService.changeArchiveStatus(isarchived, listId, userSessionParams.deskId, userSessionParams.userId);
      const type = isarchived === 'true' ? 'toArchive' : 'fromArchive';
      publicHandlers.getArchivedListItems(listId, type);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeDeskDescription(deskId: number, description: string) {
    try {
      const deskDescription = await deskService.changeDeskDescription(
        deskId,
        userSessionParams.wsId,
        userSessionParams.userId,
        description,
      );
      publicHandlers.provideNewDeskDescription(deskDescription ?? null);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }
  socket.on('list:add', addColumnList);
  socket.on('list:delete', deleteColumnList);
  socket.on('list:reorder', reorderColumns);
  socket.on('list:newItem', addNewItemToColumn);
  socket.on('item:reorder', reorderItemsInColumns);
  socket.on('list:name', changeColumnName);
  socket.on('list:description', changeColumnDescription);
  socket.on('list:archive', changeColumnArchiveStatus);
  socket.on('desk:name', changeDeskName);
  socket.on('desk:description', changeDeskDescription);
}
