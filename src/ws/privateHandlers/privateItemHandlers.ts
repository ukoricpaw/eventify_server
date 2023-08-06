import { GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { PublicHandlersType } from '../types.js';
import listItemService from '../../services/listItemService.js';

export default function privateItemHandlers(userSessionParams: GettingDeskType, publicHandlers: PublicHandlersType) {
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

  async function changeItemName(listId: number, item: number, name: string) {
    try {
      const itemName = await listItemService.changeItemInfo(
        { type: 'name', content: name },
        userSessionParams.deskId,
        listId,
        item,
        userSessionParams.userId,
      );
      publicHandlers.provideNewItemName(item, itemName as string);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeItemDescription(listId: number, item: number, description: string) {
    try {
      const itemDescription = await listItemService.changeItemInfo(
        { type: 'description', content: description },
        userSessionParams.deskId,
        listId,
        item,
        userSessionParams.userId,
      );
      publicHandlers.provideNewItemDescription(item, itemDescription as string);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeItemDeadline(listId: number, item: number, deadline: string) {
    try {
      const date = new Date(deadline);
      const newDeadline = await listItemService.changeItemInfo(
        { type: 'deadline', content: date },
        userSessionParams.deskId,
        listId,
        item,
        userSessionParams.userId,
      );
      publicHandlers.provideNewItemDeadline(item, newDeadline as Date);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  return { addNewItemToColumn, reorderItemsInColumns, changeItemName, changeItemDescription, changeItemDeadline };
}
