import Desk from '../models/Desk.js';
import DeskList from '../models/DeskList.js';
import DeskListItem from '../models/DeskItem.js';
import listRepository from './listRepository.js';

class DeskRepository {
  async findAllByWorkingSpaceId(workingSpaceId: number) {
    const desks = await Desk.findAll({ where: { workingSpaceId } });
    return desks;
  }

  async getCountOfDesksById(id: number, type: 'wspace' | 'desk' | 'all') {
    const settings: { id?: number; workingSpaceId?: number } = {};
    settings[type === 'desk' ? 'id' : 'workingSpaceId'] = id;
    const desksCount = await Desk.count({ where: settings });
    return desksCount;
  }

  async findByWorkingSpaceIdAndUserId(workingSpaceId: number, deskId: number) {
    const desk = await Desk.findOne({ where: { workingSpaceId, id: deskId } });
    return desk;
  }

  async getFullDesk(deskId: number, wsId: number, archive: boolean) {
    const desk = await Desk.findOne({
      order: [
        [{ model: DeskList, as: 'desk_lists' }, 'order', 'ASC'],
        [{ model: DeskList, as: 'desk_lists' }, { model: DeskListItem, as: 'desk_list_items' }, 'order', 'ASC'],
      ],
      where: { id: deskId, workingSpaceId: wsId },
      include: [
        {
          model: DeskList,
          as: 'desk_lists',
          where: {
            isarchived: archive,
          },
          required: false,
          include: [
            {
              model: DeskListItem,
              required: false,
              attributes: listRepository.deskListAttributes,
            },
          ],
        },
      ],
    });
    return desk;
  }
}
export default new DeskRepository();
