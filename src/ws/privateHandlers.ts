import { Socket } from 'socket.io';
import listService from '../services/listService.js';
import { GettingDeskType } from './publicHandlers.js';
export default function privateHandlers(
  socket: Socket,
  userSessionParams: GettingDeskType,
  publicHandlers: {
    getDesk: (socketRender?: boolean) => Promise<void>;
  },
) {
  async function addColumnList(name: string) {
    try {
      await listService.addNewList(userSessionParams.wsId, userSessionParams.deskId, userSessionParams.userId, name);
      await publicHandlers.getDesk(true);
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteColumnList(listId: number) {
    try {
      await listService.deleteList(userSessionParams.wsId, userSessionParams.deskId, userSessionParams.userId, listId);
      await publicHandlers.getDesk(true);
    } catch (err) {
      console.log(err);
    }
  }

  async function reorderColumns(listId: number, order: number) {
    try {
      await listService.changeOrder(
        userSessionParams.wsId,
        userSessionParams.deskId,
        userSessionParams.userId,
        listId,
        order,
      );
      await publicHandlers.getDesk(false);
    } catch (err) {
      console.log(err);
    }
  }
  socket.on('list:add', addColumnList);
  socket.on('list:delete', deleteColumnList);
  socket.on('list:reorder', reorderColumns);
}
