import { HandlerProperties, GettingDeskType } from '../publicHandlers/publicHandlers.js';
import listItemService from '../../services/listItemService.js';
import listRepository from '../../repositories/listRepository.js';
import { EmitEventsInterface } from '../publicHandlers/typesOfPublicHandlers.js';

export default function privateItemHandlers(
  userSessionParams: GettingDeskType,
  publicHandlers: EmitEventsInterface[HandlerProperties.EMIT_HANDLERS_NUMBER],
) {
  async function reorderItemsInColumns(listId: number, itemId: number, order: number, secondList: number | null) {
    await listItemService.changeOrder(userSessionParams.deskId, listId, itemId, order, secondList);
    const firstColumnlist = await listRepository.findOneColumn(listId);
    let secondColumnList = null;
    if (secondList) {
      secondColumnList = await listRepository.findOneColumn(secondList);
    }
    publicHandlers.changeColumn({ firstColumnlist, secondColumnList }, false);
  }

  async function addNewItemToColumn(listId: number, name: string) {
    const listItem = await listItemService.addNewListItem(
      userSessionParams.deskId,
      listId,
      userSessionParams.userId,
      name,
    );
    publicHandlers.getNewColumnItem({ listId, item: listItem }, true);
  }

  async function changeItemName(listId: number, item: number, name: string) {
    const itemName = await listItemService.changeItemInfo(
      { type: 'name', content: name },
      userSessionParams.deskId,
      listId,
      item,
      userSessionParams.userId,
    );
    publicHandlers.provideNewItemName({ itemId: item, name: itemName as string }, true);
  }

  async function changeItemDescription(listId: number, item: number, description: string) {
    const itemDescription = await listItemService.changeItemInfo(
      { type: 'description', content: description },
      userSessionParams.deskId,
      listId,
      item,
      userSessionParams.userId,
    );
    publicHandlers.provideNewItemDescription({ itemId: item, description: itemDescription as string }, true);
  }

  async function changeItemDeadline(listId: number, item: number, deadline: string) {
    const date = new Date(deadline);
    const newDeadline = await listItemService.changeItemInfo(
      { type: 'deadline', content: date },
      userSessionParams.deskId,
      listId,
      item,
      userSessionParams.userId,
    );
    publicHandlers.provideNewItemDeadline({ itemId: item, deadline: newDeadline as Date }, true);
  }

  return { addNewItemToColumn, reorderItemsInColumns, changeItemName, changeItemDescription, changeItemDeadline };
}

export type ItemHandlersType = ReturnType<typeof privateItemHandlers>;
