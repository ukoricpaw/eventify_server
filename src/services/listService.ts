import DeskList from '../models/DeskList.js';
import ApiError from '../error/ApiError.js';
import deskService from './deskService.js';
import Desk from '../models/Desk.js';
import { Op } from 'sequelize';

class ListService {
  async checkWSRoleAndDesk(wsId: number, userId: number, deskId: number, checkAccess: null | true) {
    try {
      await deskService.checkWSAndRole(wsId, userId, checkAccess);
      const desk = await Desk.findOne({ where: { workingSpaceId: wsId, id: deskId } });
      if (!desk) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
    } catch (err) {
      throw new Error('Ошибка запроса');
    }
  }
  async addNewList(wsId: number, deskId: number, userId: number, name: string) {
    await this.checkWSRoleAndDesk(wsId, userId, deskId, null);
    let lists = await DeskList.count({ where: { deskId } });
    if (lists > 19) {
      throw ApiError.BadRequest('Превышен лимит списков');
    }
    let order = 1;
    if (lists) {
      order = ++lists;
    }
    const newList = await DeskList.create({ name, deskId, description: null, order });
    deskService.addStoryItem(userId, 4, deskId, newList.name, null);
    return newList;
  }

  async updateList(
    wsId: number,
    deskId: number,
    userId: number,
    listId: number,
    description: string | undefined,
    isarchived: string | undefined,
    name: string | undefined,
  ) {
    await this.checkWSRoleAndDesk(wsId, userId, deskId, null);
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    list.description = description || list.description;
    description && deskService.addStoryItem(userId, 9, deskId, list.name, null);
    if (isarchived === 'false') {
      if (!list.isarchived) {
        throw ApiError.BadRequest('Список не находится в архиве');
      }
      deskService.addStoryItem(userId, 15, deskId, list.name, null);
    } else if (isarchived === 'true') {
      if (list.isarchived) {
        throw ApiError.BadRequest('Список уже находится в архиве');
      }
      deskService.addStoryItem(userId, 7, deskId, list.name, null);
    }
    list.isarchived = isarchived || list.isarchived;
    name && deskService.addStoryItem(userId, 8, deskId, list.name, name);
    list.name = name || list.name;
    await list.save();
    return list;
  }

  async deleteList(wsId: number, deskId: number, userId: number, listId: number) {
    await this.checkWSRoleAndDesk(wsId, userId, deskId, null);
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    const lists = await DeskList.findAll({
      where: {
        deskId,
        order: {
          [Op.gt]: list.order,
        },
      },
    });
    lists.forEach(list => {
      list.order--;
      list.save();
    });
    deskService.addStoryItem(userId, 6, deskId, list.name, null);
    await list.destroy();
    return { message: 'Список был удалён' };
  }

  async changeOrder(wsId: number, deskId: number, userId: number, listId: number, order: number) {
    await this.checkWSRoleAndDesk(wsId, userId, deskId, null);
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    if (list.order === order) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    console.log(order);
    const listCount = await DeskList.count({ where: { deskId } });
    if (order < 1 || order > listCount) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    list.order = order;
    const lists = await DeskList.findAll({
      where: {
        deskId,
        order: {
          [Op.gte]: order,
        },
      },
    });
    lists.forEach(list => {
      list.order++;
      list.save();
    });
    await list.save();
    return { message: 'порядок изменён' };
  }
}

export default new ListService();
