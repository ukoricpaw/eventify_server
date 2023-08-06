import DeskAct from '../models/DeskAct.js';
import ApiError from '../error/ApiError.js';
import workingSpaceRepository from '../repositories/workingSpaceRepository.js';
import deskService from './deskService.js';
import DeskStory from '../models/DeskStory.js';
import User from '../models/User.js';

class DeskActsService {
  async addStoryItem(userId: number, deskActId: number, deskId: number, firstItem: string, secondItem: string | null) {
    const storyList = await DeskStory.count({ where: { deskId } });
    if (storyList > 14) {
      const lastStoryItem = await DeskStory.findOne({
        where: { deskId },
        order: [['createdAt', 'ASC']],
      });
      if (lastStoryItem) {
        await lastStoryItem.destroy();
      }
    }
    await DeskStory.create({ userId, deskActId, deskId, firstItem, secondItem });
  }

  async addDeskAct(name: string) {
    const deskAct = await DeskAct.create({ name });
    return deskAct;
  }

  async deleteDeskAct(deskActId: number) {
    const deskAct = await DeskAct.findOne({ where: { id: deskActId } });
    if (!deskAct) {
      throw ApiError.BadRequest('Действие не найдено');
    }
    await deskAct.destroy();
    return { message: 'Действие удалено' };
  }

  async getStory(wsId: number, deskId: number, userId: number | null) {
    await deskService.checkWSAndRole(wsId, userId, true);
    const story = await DeskStory.findAndCountAll({
      where: { deskId },
      attributes: {
        exclude: ['updatedAt', 'deskId', 'deskActId'],
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: workingSpaceRepository.userAttributes,
        },
        {
          model: DeskAct,
          as: 'desk_act',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      ],
    });
    return story;
  }
}

export default new DeskActsService();
