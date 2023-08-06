import DeskListItem from '../models/DeskItem.js';
import ApiError from '../error/ApiError.js';
import { Op } from 'sequelize';

class ListItemRepository {
  async findOneListItem(deskId: number, listId: number, id: number) {
    const item = await DeskListItem.findOne({ where: { deskId, deskListId: listId, id } });
    if (!item) {
      throw ApiError.BadRequest('Элемент списка не найден');
    }
    return item;
  }

  async getCountByListId(deskListId: number) {
    const listItems = await DeskListItem.count({ where: { deskListId } });
    return listItems;
  }

  async createNewListItem({
    name,
    deskId,
    deskListId,
    order,
  }: {
    name: string;
    deskListId: number;
    order: number;
    deskId: number;
  }) {
    const newListItem = await DeskListItem.create({ name, deskListId, order, deskId });
    return newListItem;
  }

  async findAllItems(deskId: number, listId: number, firstOrder: number, secondOrder?: number) {
    let order: any = {
      [Op.gt]: firstOrder,
    };
    if (secondOrder) {
      order = { [Op.between]: [firstOrder, secondOrder] };
    }
    const allItems = await DeskListItem.findAll({
      where: {
        deskId,
        deskListId: listId,
        order,
      },
    });
    return allItems;
  }
}

export default new ListItemRepository();
