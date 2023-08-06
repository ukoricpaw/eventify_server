import Desk from '../models/Desk.js';
import { UploadedFile } from 'express-fileupload';
import ApiError from '../error/ApiError.js';
import { v4 } from 'uuid';
import imageService from './imageService.js';
import DeskListItem from '../models/DeskItem.js';
import workingSpaceRepository from '../repositories/workingSpaceRepository.js';
import roleRepository from '../repositories/roleRepository.js';
import deskRepository from '../repositories/deskRepository.js';
import deskActsService from './deskActsService.js';

class DeskService {
  async checkWSAndRole(wspaceId: number, userId: number | null, checkAccess: null | true) {
    const workingSpace = await workingSpaceRepository.findByWorkingSpaceId(wspaceId);
    if (!userId) {
      userId = -1;
    }
    if (!workingSpace) {
      throw ApiError.BadRequest('Рабочее пространство не было найдено');
    }
    const workingSpaceRole = await roleRepository.findByUserIdAndWorkingSpaceId({
      workingSpaceId: wspaceId,
      userId,
      includeRoleInfo: false,
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
    return workingSpaceRole;
  }

  async addNewDesk(wsId: number, userId: number, name: string, description?: string, background?: UploadedFile) {
    await this.checkWSAndRole(wsId, userId, null);
    const desks = await deskRepository.getCountOfDesksById(wsId, 'wspace');
    if (desks > 14) {
      throw ApiError.BadRequest('Превышен лимит досок');
    }
    let backgroundUrl: undefined | string;
    if (background) {
      backgroundUrl = v4() + '.jpg';
      await imageService.uploadFile(backgroundUrl, background.data);
    }
    const newDesk = await Desk.create({ workingSpaceId: wsId, name, description, background: backgroundUrl });
    deskActsService.addStoryItem(userId, 2, newDesk.id, newDesk.name, null);
    return newDesk;
  }

  async searchDesk(deskId: number, wsId: number, getFull: null | true, archive: true | null) {
    let desk = null;
    if (getFull) {
      desk = await deskRepository.getFullDesk(deskId, wsId, archive ?? false);
    } else {
      desk = await Desk.findOne({ where: { id: deskId, workingSpaceId: wsId } });
    }
    if (!desk) {
      throw ApiError.BadRequest('Доска не была найдена');
    }
    return desk;
  }

  async changeDeskInfo(type: 'description' | 'name', deskId: number, wsId: number, userId: number, info: string) {
    const desk = await this.searchDesk(deskId, wsId, null, null);
    desk[type] = type === 'description' ? info ?? undefined : info;
    await desk.save();
    deskActsService.addStoryItem(userId, 3, desk.id, desk.name, null);
    return desk[type];
  }

  async changeImage(
    deskId: number,
    wsId: number,
    userId: number,
    background?: UploadedFile | null,
    delete_img?: boolean,
  ) {
    const desk = await this.searchDesk(deskId, wsId, null, null);
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
    deskActsService.addStoryItem(userId, 3, desk.id, desk.name, null);
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

  async getItems(wsId: number, deskId: number, userId: number | null) {
    await this.checkWSAndRole(wsId, userId, true);
    const items = await DeskListItem.findAll({
      where: { deskId },
      attributes: {
        exclude: ['order'],
      },
    });
    return items;
  }
}

export default new DeskService();
