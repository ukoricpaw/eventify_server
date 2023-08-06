import { GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { PublicHandlersType } from '../types.js';
import listService from '../../services/listService.js';

export default function privateColumnHandlers(userSessionParams: GettingDeskType, publicHandlers: PublicHandlersType) {
  async function addColumnList(name: string) {
    try {
      const column = await listService.addNewList(userSessionParams.deskId, userSessionParams.userId, name);
      publicHandlers.getNewColumn(column, true);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function deleteColumnList(listId: number) {
    try {
      await listService.deleteList(userSessionParams.deskId, userSessionParams.userId, listId);
      await publicHandlers.getDesk(false);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function reorderColumns(listId: number, order: number) {
    try {
      await listService.changeOrder(userSessionParams.deskId, listId, order);
      await publicHandlers.getDesk(false);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeColumnName(listId: number, name: string) {
    try {
      const listName = await listService.changeListInfo(
        'name',
        name,
        listId,
        userSessionParams.deskId,
        userSessionParams.userId,
      );
      publicHandlers.provideNewColumnName(listId, listName as string);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeColumnDescription(listId: number, description: string) {
    try {
      const listDescription = await listService.changeListInfo(
        'description',
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
