import Desk from '../models/Desk.js';
import DeskList from '../models/DeskList.js';
import WorkingSpace from '../models/WorkingSpace.js';
import WorkingSpaceRole from '../models/WorkingSpaceRole.js';
import { UploadedFile } from 'express-fileupload';
import ApiError from '../error/ApiError.js';
import { v4 } from 'uuid';
import imageService from './imageService.js';
import DeskListItem from '../models/DeskItem.js';
import DeskAct from '../models/DeskAct.js';
import DeskStory from '../models/DeskStory.js';
import User from '../models/User.js';

class DeskService {
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

  async checkWSAndRole(id: number, userId: number | null, checkAccess: null | true) {
    const workingSpace = await WorkingSpace.findOne({ where: { id } });
    if (!userId) {
      userId = -1;
    }
    if (!workingSpace) {
      throw ApiError.BadRequest('Рабочее пространство не было найдено');
    }
    const workingSpaceRole = await WorkingSpaceRole.findOne({
      where: {
        workingSpaceId: id,
        userId,
      },
    });
    if (!checkAccess) {
      if (!workingSpaceRole || workingSpaceRole.roleId === 3) {
        throw ApiError.NoAccess('Нет доступа');
      }
    } else {
      if (!workingSpaceRole && workingSpace.private) {
        throw ApiError.NoAccess('Нет доступа');
      }
    }
  }

  async addNewDesk(wsId: number, userId: number, name: string, description?: string, background?: UploadedFile) {
    await this.checkWSAndRole(wsId, userId, null);
    const desks = await Desk.count({ where: { workingSpaceId: wsId } });
    if (desks > 14) {
      throw ApiError.BadRequest('Превышен лимит досок');
    }
    let backgroundUrl: undefined | string;
    if (background) {
      backgroundUrl = v4() + '.jpg';
      imageService.uploadFile(backgroundUrl, background.data);
    }
    const newDesk = await Desk.create({ workingSpaceId: wsId, name, description, background: backgroundUrl });
    this.addStoryItem(userId, 2, newDesk.id, newDesk.name, null);
    return newDesk;
  }

  async searchDesk(deskId: number, wsId: number, getFull: null | true, archive: true | null) {
    let desk = null;
    if (getFull) {
      if (archive) {
        desk = await Desk.findOne({
          order: [[{ model: DeskList, as: 'desk_lists' }, 'order', 'ASC']],
          where: { id: deskId, workingSpaceId: wsId },
          include: [
            {
              model: DeskList,
              as: 'desk_lists',
              where: {
                isarchived: archive,
              },
              order: [[{ model: DeskListItem, as: 'desk_list_items' }, 'order', 'ASC']],
              required: false,
              include: [
                {
                  model: DeskListItem,
                  required: false,
                },
              ],
            },
          ],
        });
      } else {
        desk = await Desk.findOne({
          where: { id: deskId, workingSpaceId: wsId },
          order: [[{ model: DeskList, as: 'desk_lists' }, 'order', 'ASC']],
          include: [
            {
              model: DeskList,
              required: false,
              where: {
                isarchived: false,
              },
              as: 'desk_lists',
              order: [[{ model: DeskListItem, as: 'desk_list_items' }, 'order', 'ASC']],
              include: [
                {
                  model: DeskListItem,
                  as: 'desk_list_items',
                  required: false,
                },
              ],
            },
          ],
        });
      }
    } else {
      desk = await Desk.findOne({ where: { id: deskId, workingSpaceId: wsId } });
    }
    if (!desk) {
      throw ApiError.BadRequest('Доска не была найдена');
    }
    return desk;
  }

  async updateDesk(
    wsId: number,
    deskId: number,
    userId: number,
    name?: string,
    description?: string,
    background?: UploadedFile | null,
    delete_img?: boolean,
  ) {
    await this.checkWSAndRole(wsId, userId, null);
    const desk = await this.searchDesk(deskId, wsId, null, null);
    desk.name = name || desk.name;
    desk.description = description || desk.description;
    if (delete_img) {
      background = null;
      if (!desk.background) {
        throw ApiError.BadRequest('Невозможно удалить изображение');
      }
      imageService.deleteFile(desk.background);
      desk.background = null;
    }

    if (background) {
      const uuid = v4() + '.jpg';
      if (desk.background) {
        imageService.deleteFile(desk.background);
      }
      await imageService.uploadFile(uuid, background.data);
      desk.background = uuid;
    }

    await desk.save();
    this.addStoryItem(userId, 3, desk.id, desk.name, null);
    return desk;
  }

  async deleteDesk(wsId: number, deskId: number, userId: number) {
    await this.checkWSAndRole(wsId, userId, null);
    const desk = await this.searchDesk(deskId, wsId, null, null);
    if (desk.background) {
      imageService.deleteFile(desk.background);
    }
    await desk.destroy();
    return { message: 'доска была удалена' };
  }

  async getFullDesk(wsId: number, deskId: number, userId: number | null, archive: true | null) {
    await this.checkWSAndRole(wsId, userId, true);
    const desk = await this.searchDesk(deskId, wsId, true, archive);
    return desk;
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
    await this.checkWSAndRole(wsId, userId, true);
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
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'activationLink', 'isActivated', 'password', 'role'],
          },
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

export default new DeskService();
