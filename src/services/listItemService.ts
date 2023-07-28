import { Op } from 'sequelize';
import ApiError from '../error/ApiError.js';
import DeskListItem, { DeskListItemInstance } from '../models/DeskItem.js';
import DeskList from '../models/DeskList.js';
import deskService from './deskService.js';

class ListItemService {
  async checkWsRoleAndList(wsId: number, userId: number, deskId: number, listId: number, checkAccess: null | true) {
    try {
      await deskService.checkWSAndRole(wsId, userId, checkAccess);
      const list = await DeskList.findOne({ where: { deskId, id: listId } });
      if (!list) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
    } catch (err) {
      throw new Error('Ошибка запроса');
    }
  }

  async addNewListItem(wsId: number, deskId: number, listId: number, userId: number, name: string) {
    let listItems = await DeskListItem.count({ where: { deskListId: listId } });
    if (listItems > 19) {
      throw ApiError.BadRequest('Превышен лимит элементов списка');
    }
    let order = 0;
    if (listItems) {
      order = ++listItems - 1;
    }
    const newListItem = await DeskListItem.create({ name, deskListId: listId, order, deskId });
    deskService.addStoryItem(userId, 10, deskId, newListItem.name, null);
    return newListItem;
  }

  async updateListItem(
    wsId: number,
    deskId: number,
    listId: number,
    id: number,
    userId: number,
    name: string | undefined,
    description: string | undefined,
    deadline: Date | undefined,
  ) {
    await this.checkWsRoleAndList(wsId, userId, deskId, listId, null);
    const item = await DeskListItem.findOne({ where: { deskListId: listId, id } });
    if (!item) {
      throw ApiError.BadRequest('Элемент списка не найден');
    }
    if (name) {
      deskService.addStoryItem(userId, 12, deskId, item.name, name);
      item.name = name;
    }
    if (description) {
      item.description = description;
      deskService.addStoryItem(userId, 13, deskId, item.name, null);
    }
    if (deadline) {
      item.deadline = deadline;
      deskService.addStoryItem(userId, 11, deskId, item.name, deadline.toISOString());
    }
    await item.save();
    return item;
  }

  async deleteListItem(wsId: number, deskId: number, listId: number, id: number, userId: number) {
    await this.checkWsRoleAndList(wsId, userId, deskId, listId, null);
    const item = await DeskListItem.findOne({ where: { deskListId: listId, id } });
    if (!item) {
      throw ApiError.BadRequest('Элемент списка не найден');
    }
    const items = await DeskListItem.findAll({
      where: {
        deskListId: listId,
        order: {
          [Op.gt]: item.order,
        },
      },
    });
    if (items) {
      items.forEach(item => {
        item.order--;
        item.save();
      });
    }
    deskService.addStoryItem(userId, 14, deskId, item.name, null);
    await item.destroy();
    return { message: 'Элемент списка был удалён' };
  }

  async changeOrderInSameColumn(item: DeskListItemInstance, order: number, listId: number) {
    if (item.order === order) {
      throw ApiError.BadRequest('Порядок совпадает');
    }
    const itemCount = await DeskListItem.count({ where: { deskListId: listId } });
    if (order < 0 || order > itemCount - 1) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    if (order < item.order) {
      const items = await DeskListItem.findAll({
        where: {
          deskListId: listId,
          order: {
            [Op.between]: [order, item.order],
          },
        },
      });
      await Promise.all(
        items.map(async item => {
          item.order++;
          await item.save();
        }),
      );
    } else if (order > item.order) {
      const items = await DeskListItem.findAll({
        where: {
          deskListId: listId,
          order: {
            [Op.between]: [item.order, order],
          },
        },
      });
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
    const anotherDeskListItems = await DeskListItem.findAll({
      where: {
        deskId: item.deskId,
        deskListId: secondListId,
        order: {
          [Op.gte]: order,
        },
      },
    });
    const ownDeskListItems = await DeskListItem.findAll({
      where: {
        deskId: item.deskId,
        deskListId: listId,
        order: {
          [Op.gte]: item.order,
        },
      },
    });
    if (anotherDeskListItems) {
      await Promise.all(
        anotherDeskListItems.map(async item => {
          item.order++;
          await item.save();
        }),
      );
    }
    if (ownDeskListItems) {
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
    const item = await DeskListItem.findOne({ where: { deskId, deskListId: listId, id } });
    if (!item) {
      throw ApiError.BadRequest('Список не найден');
    }
    if (secondListId) {
      await this.changeOrderToAnotherColumn(item, order, listId, secondListId);
    } else {
      await this.changeOrderInSameColumn(item, order, listId);
    }
    return { message: 'Порядок изменён' };
  }
}

export default new ListItemService();
