import ApiError from '../error/ApiError.js';
import { DeskListItemInstance } from '../models/DeskItem.js';
import deskActsService from './deskActsService.js';
import listItemRepository from '../repositories/listItemRepository.js';
import { InfoItemType } from '../types/listItemTypes.js';

class ListItemService {
  async addNewListItem(deskId: number, listId: number, userId: number, name: string) {
    let listItems = await listItemRepository.getCountByListId(listId);
    if (listItems > 19) {
      throw ApiError.BadRequest('Превышен лимит элементов списка');
    }
    let order = 0;
    if (listItems) {
      order = ++listItems - 1;
    }
    const newListItem = await listItemRepository.createNewListItem({ name, deskId, deskListId: listId, order });
    deskActsService.addStoryItem(userId, 10, deskId, newListItem.name, null);
    return newListItem;
  }

  async changeItemInfo(infoType: InfoItemType, deskId: number, listId: number, id: number, userId: number) {
    const item = await listItemRepository.findOneListItem(deskId, listId, id);
    item[infoType.type] = infoType.content as any;

    await item.save();
    deskActsService.addStoryItem(
      userId,
      infoType.type === 'name' ? 12 : infoType.type === 'description' ? 13 : 11,
      deskId,
      item.name,
      infoType.type === 'deadline' ? (infoType.content ? infoType.content.toISOString() : null) : infoType.content,
    );
    return item[infoType.type];
  }

  async deleteListItem(deskId: number, listId: number, id: number, userId: number) {
    const item = await listItemRepository.findOneListItem(deskId, listId, id);
    const items = await listItemRepository.findAllItems(deskId, listId, item.order, false);
    if (items) {
      items.forEach(item => {
        item.order--;
        item.save();
      });
    }
    deskActsService.addStoryItem(userId, 14, deskId, item.name, null);
    await item.destroy();
    return { message: 'Элемент списка был удалён' };
  }

  async changeOrderInSameColumn(item: DeskListItemInstance, order: number, listId: number) {
    if (item.order === order) {
      throw ApiError.BadRequest('Порядок совпадает');
    }
    const itemCount = await listItemRepository.getCountByListId(listId);
    if (order < 0 || order > itemCount - 1) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    if (order < item.order) {
      const items = await listItemRepository.findAllItems(item.deskId, listId, order, false, item.order);
      await Promise.all(
        items.map(async item => {
          item.order++;
          await item.save();
        }),
      );
    } else if (order > item.order) {
      const items = await listItemRepository.findAllItems(item.deskId, listId, item.order, false, order);
      await Promise.all(
        items.map(async item => {
          item.order--;
          await item.save();
        }),
      );
    }
    item.order = order;
    await item.save();
  }

  async changeOrderToAnotherColumn(item: DeskListItemInstance, order: number, listId: number, secondListId: number) {
    const anotherDeskListItems = await listItemRepository.findAllItems(item.deskId, secondListId, order, true);
    const ownDeskListItems = await listItemRepository.findAllItems(item.deskId, listId, item.order, false);
    if (anotherDeskListItems.length) {
      await Promise.all(
        anotherDeskListItems.map(async item => {
          item.order++;
          await item.save();
        }),
      );
    }
    if (ownDeskListItems.length) {
      await Promise.all(
        ownDeskListItems.map(async item => {
          item.order--;
          await item.save();
        }),
      );
    }
    item.order = order;
    item.deskListId = secondListId;
    await item.save();
  }

  async changeOrder(deskId: number, listId: number, id: number, order: number, secondListId: number | null) {
    const item = await listItemRepository.findOneListItem(deskId, listId, id);
    if (secondListId) {
      await this.changeOrderToAnotherColumn(item, order, listId, secondListId);
    } else {
      await this.changeOrderInSameColumn(item, order, listId);
    }
    return { message: 'Порядок изменён' };
  }
}

export default new ListItemService();
