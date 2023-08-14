import ApiError from '../error/ApiError.js';
import deskService from './deskService.js';
import deskRepository from '../repositories/deskRepository.js';
import listRepository from '../repositories/listRepository.js';
import deskActsService from './deskActsService.js';

class ListService {
  async checkWSRoleAndDesk(wsId: number, userId: number, deskId: number, checkAccess: null | true) {
    try {
      const wsRole = await deskService.checkWSAndRole(wsId, userId, checkAccess);
      const desk = await deskRepository.findByWorkingSpaceIdAndUserId(wsId, deskId);
      if (!desk) {
        throw ApiError.BadRequest('Ошибка запроса');
      }
      return wsRole;
    } catch (err) {
      throw new Error('Ошибка запроса');
    }
  }
  async addNewList(deskId: number, userId: number, name: string) {
    let lists = await listRepository.getCountByDeskId(deskId);
    if (lists > 19) {
      throw ApiError.BadRequest('Превышен лимит списков');
    }
    let order = 0;
    if (lists) {
      order = ++lists - 1;
    }
    const newList = await listRepository.createNewDeskList({ name, deskId, order });
    deskActsService.addStoryItem(userId, 4, deskId, newList.name, null);
    return newList;
  }

  async changeListInfo(type: 'description' | 'name', info: string, listId: number, deskId: number, userId: number) {
    const list = await listRepository.findOneByDeskIdAndListId(deskId, listId);
    list[type] = type === 'description' ? info ?? list[type] : info || list[type];
    await list.save();
    deskActsService.addStoryItem(userId, type === 'description' ? 9 : 8, deskId, list.name, info);
    return list[type];
  }

  async changeArchiveStatus(isarchived: string, listId: number, deskId: number, userId: number) {
    const list = await listRepository.findOneByDeskIdAndListId(deskId, listId);
    if (isarchived === 'false') {
      const lists = await listRepository.getCountByDeskId(deskId);
      if (lists > 19) {
        throw ApiError.BadRequest('Превышено количество колонн');
      }
      if (!list.isarchived) {
        throw ApiError.BadRequest('Список не находится в архиве');
      }
      list.order = lists;
      deskActsService.addStoryItem(userId, 15, deskId, list.name, null);
    } else if (isarchived === 'true') {
      const listCount = await listRepository.getCountByDeskId(deskId, true);
      if (listCount > 19) {
        throw ApiError.BadRequest('Архив переполнен');
      }
      if (list.isarchived) {
        throw ApiError.BadRequest('Список уже находится в архиве');
      }
      deskActsService.addStoryItem(userId, 7, deskId, list.name, null);
      const lists = await listRepository.findAllWithGreaterOrder(deskId, list.order);
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

  async deleteList(deskId: number, userId: number, listId: number) {
    const list = await listRepository.findOneByDeskIdAndListId(deskId, listId);
    if (list.isarchived) {
      throw ApiError.BadRequest('Список находится в архиве');
    }
    const lists = await listRepository.findAllWithGreaterOrder(deskId, list.order);
    if (lists) {
      lists.forEach(list => {
        list.order--;
        list.save();
      });
    }
    deskActsService.addStoryItem(userId, 6, deskId, list.name, null);
    await list.destroy();
    return { message: 'Список был удалён' };
  }

  async changeOrder(deskId: number, listId: number, order: number) {
    const list = await listRepository.findOneByDeskIdAndListId(deskId, listId);
    if (list.order === order) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    const listCount = await listRepository.getCountByDeskId(deskId);
    if (order < 0 || order > listCount - 1) {
      throw ApiError.BadRequest('Ошибка запроса');
    }
    if (order < list.order) {
      const lists = await listRepository.findAllWithBetweenOrder(deskId, order, list.order);
      await Promise.all(
        lists.map(async list => {
          list.order++;
          await list.save();
        }),
      );
    } else if (order > list.order) {
      const lists = await listRepository.findAllWithBetweenOrder(deskId, list.order, order);
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
