import { Op } from 'sequelize';
import DeskList from '../models/DeskList.js';
import DeskListItem from '../models/DeskItem.js';
import ApiError from '../error/ApiError.js';
class ListRepository {
  deskListAttributes = {
    exclude: ['createdAt', 'updatedAt', 'deskListId', 'deskId', 'name', 'description', 'deadline'],
  };
  async getCountByDeskId(deskId: number, isarchived?: boolean) {
    const count = await DeskList.count({ where: { deskId, isarchived: isarchived ?? false } });
    return count;
  }

  async createNewDeskList({ name, deskId, order }: { name: string; deskId: number; order: number }) {
    const list = await DeskList.create({ name, deskId, description: null, order });
    return list;
  }

  async findOneByDeskIdAndListId(deskId: number, listId: number) {
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    return list;
  }

  async findAllWithGreaterOrder(deskId: number, listOrder: number, isarchived?: boolean) {
    const lists = await DeskList.findAll({
      where: {
        deskId,
        isarchived: isarchived ?? false,
        order: {
          [Op.gt]: listOrder,
        },
      },
    });
    return lists;
  }

  async findAllWithBetweenOrder(deskId: number, firstOrder: number, secondOrder: number, isarchived?: boolean) {
    const lists = await DeskList.findAll({
      where: {
        deskId,
        isarchived: isarchived ?? false,
        order: {
          [Op.between]: [firstOrder, secondOrder],
        },
      },
    });
    return lists;
  }

  async findOneColumn(listId: number) {
    const list = await DeskList.findOne({
      where: { id: listId },
      order: [[{ model: DeskListItem, as: 'desk_list_items' }, 'order', 'ASC']],
      include: [
        {
          model: DeskListItem,
          order: [['order', 'ASC']],
          as: 'desk_list_items',
          attributes: this.deskListAttributes,
          required: false,
        },
      ],
    });
    return list;
  }
}

export default new ListRepository();
