import { HandlerProperties, GettingDeskType } from '../publicHandlers/publicHandlers.js';
import listService from '../../services/listService.js';
import { EmitEventsInterface } from '../publicHandlers/typesOfPublicHandlers.js';
import deskService from '../../services/deskService.js';

export default function privateColumnHandlers(
  userSessionParams: GettingDeskType,
  publicHandlers: EmitEventsInterface[HandlerProperties.EMIT_HANDLERS_NUMBER],
) {
  async function addColumnList(name: string) {
    const column = await listService.addNewList(userSessionParams.deskId, userSessionParams.userId, name);
    publicHandlers.getNewColumn(column, true);
  }

  async function deleteColumnList(listId: number) {
    await listService.deleteList(userSessionParams.deskId, userSessionParams.userId, listId);
    const desk = await deskService.searchDesk(userSessionParams.deskId, userSessionParams.wsId, true, null);
    publicHandlers.getDesk({ desk }, false);
  }

  async function reorderColumns(listId: number, order: number) {
    await listService.changeOrder(userSessionParams.deskId, listId, order);
    const desk = await deskService.searchDesk(userSessionParams.deskId, userSessionParams.wsId, true, null);
    publicHandlers.getDesk({ desk }, false);
  }

  async function changeColumnName(listId: number, name: string) {
    const listName = await listService.changeListInfo(
      'name',
      name,
      listId,
      userSessionParams.deskId,
      userSessionParams.userId,
    );
    publicHandlers.provideNewColumnName({ listId, name: listName as string }, true);
  }

  async function changeColumnDescription(listId: number, description: string) {
    const listDescription = await listService.changeListInfo(
      'description',
      description,
      listId,
      userSessionParams.deskId,
      userSessionParams.userId,
    );
    publicHandlers.provideNewColumnDescription({ listId, description: listDescription }, true);
  }

  async function changeColumnArchiveStatus(listId: number, isarchived: string) {
    await listService.changeArchiveStatus(isarchived, listId, userSessionParams.deskId, userSessionParams.userId);
    const type = isarchived === 'true' ? 'toArchive' : 'fromArchive';
    publicHandlers.getArchivedListItems({ listId, type }, true);
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

export type ColHandlersType = ReturnType<typeof privateColumnHandlers>;
