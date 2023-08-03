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

  async function changeItemName(listId: number, item: number, name: string) {
    try {
      const itemName = await listItemService.changeItemName(
        userSessionParams.deskId,
        listId,
        item,
        userSessionParams.userId,
        name,
      );
      publicHandlers.provideNewItemName(item, itemName);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeItemDescription(listId: number, item: number, description: string) {
    try {
      const itemDescription = await listItemService.changeItemDescription(
        userSessionParams.deskId,
        listId,
        item,
        userSessionParams.userId,
        description,
      );
      publicHandlers.provideNewItemDescription(item, itemDescription);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  return { addNewItemToColumn, reorderItemsInColumns, changeItemName, changeItemDescription };
}
