import { GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { PublicHandlersType } from '../types.js';
import listService from '../../services/listService.js';

export default function privateColumnHandlers(userSessionParams: GettingDeskType, publicHandlers: PublicHandlersType) {
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

  async function changeColumnArchiveStatus(listId: number, isarchived: string) {
    try {
      await listService.changeArchiveStatus(isarchived, listId, userSessionParams.deskId, userSessionParams.userId);
      const type = isarchived === 'true' ? 'toArchive' : 'fromArchive';
      publicHandlers.getArchivedListItems(listId, type);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  return {
    changeColumnArchiveStatus,
    changeColumnDescription,
    changeColumnName,
    addColumnList,
    deleteColumnList,
    reorderColumns,
  };
}
