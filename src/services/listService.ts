import DeskList from '../models/DeskList.js';
import ApiError from '../error/ApiError.js';
import deskService from './deskService.js';
import Desk from '../models/Desk.js';
import { Op } from 'sequelize';

class ListService {
  async checkWSRoleAndDesk(wsId: number, userId: number, deskId: number, checkAccess: null | true) {
    try {
      const wsRole = await deskService.checkWSAndRole(wsId, userId, checkAccess);
      const desk = await Desk.findOne({ where: { workingSpaceId: wsId, id: deskId } });
      if (!desk) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      return wsRole;
    } catch (err) {
      throw new Error('Ошибка запроса');
    }
  }
  async addNewList(wsId: number, deskId: number, userId: number, name: string) {
    let lists = await DeskList.count({ where: { deskId, isarchived: false } });
    if (lists > 19) {
      throw ApiError.BadRequest('Превышен лимит списков');
    }
    let order = 0;
    if (lists) {
      order = ++lists - 1;
    }
    const newList = await DeskList.create({ name, deskId, description: null, order });
    deskService.addStoryItem(userId, 4, deskId, newList.name, null);
    return newList;
  }

  async changeListName(name: string, listId: number, deskId: number, userId: number) {
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    name && deskService.addStoryItem(userId, 8, deskId, list.name, name);
    list.name = name || list.name;
    await list.save();
    return list.name;
  }

  async changeListDescription(description: string, listId: number, deskId: number, userId: number) {
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    list.description = description ?? list.description;
    description && deskService.addStoryItem(userId, 9, deskId, list.name, null);
    await list.save();
    return list.description;
  }

  async changeArchiveStatus(isarchived: string, listId: number, deskId: number, userId: number) {
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    if (isarchived === 'false') {
      const lists = await DeskList.count({ where: { deskId, isarchived: false } });
      if (lists > 19) {
        throw ApiError.BadRequest('Превышено количество колонн');
      }
      if (!list.isarchived) {
        throw ApiError.BadRequest('Список не находится в архиве');
      }
      list.order = lists;
      deskService.addStoryItem(userId, 15, deskId, list.name, null);
    } else if (isarchived === 'true') {
      const listCount = await DeskList.count({ where: { deskId, isarchived: true } });
      if (listCount > 19) {
        throw ApiError.BadRequest('Архив переполнен');
      }
      if (list.isarchived) {
        throw ApiError.BadRequest('Список уже находится в архиве');
      }
      deskService.addStoryItem(userId, 7, deskId, list.name, null);
      const lists = await DeskList.findAll({
        where: {
          deskId,
          isarchived: false,
          order: {
            [Op.gt]: list.order,
          },
        },
      });
      if (lists) {
        await Promise.all(
          lists.map(async list => {
            list.order = list.order - 1;
            await list.save();
          }),
        );
      }
    }
    list.isarchived = isarchived || list.isarchived;
    await list.save();
    return list.isarchived;
  }

  async deleteList(wsId: number, deskId: number, userId: number, listId: number) {
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
    if (lists) {
      lists.forEach(list => {
        list.order--;
        list.save();
      });
    }
    deskService.addStoryItem(userId, 6, deskId, list.name, null);
    await list.destroy();
    return { message: 'Список был удалён' };
  }

  async changeOrder(wsId: number, deskId: number, userId: number, listId: number, order: number) {
    const list = await DeskList.findOne({ where: { deskId, id: listId } });
    if (!list) {
      throw ApiError.BadRequest('Список не найден');
    }
    if (list.order === order) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    const listCount = await DeskList.count({ where: { deskId } });
    if (order < 0 || order > listCount - 1) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    if (order < list.order) {
      const lists = await DeskList.findAll({
        where: {
          deskId,
          order: {
            [Op.between]: [order, list.order],
          },
        },
      });
      await Promise.all(
        lists.map(async list => {
          list.order++;
          await list.save();
        }),
      );
    } else if (order > list.order) {
      const lists = await DeskList.findAll({
        where: {
          deskId,
          order: {
            [Op.between]: [list.order, order],
          },
        },
      });
      await Promise.all(
        lists.map(async list => {
          list.order--;
          await list.save();
        }),
      );
    }
    list.order = order;
    await list.save();
    return { message: 'Порядок изменён' };
  }
}

export default new ListService();
