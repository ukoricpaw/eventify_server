import { Socket, Server } from 'socket.io';
import publicColumnHandlers from './publicColumnHandlers.js';
import publicItemHandlers from './publicItemHandlers.js';
import publicDeskHandlers from './publicDeskHandlers.js';

export type GettingDeskType = {
  wsId: number;
  deskId: number;
  userId: number;
};

export type PublicHandlersType = {
  io: Server;
  socket: Socket;
  userSessionParams: GettingDeskType;
  emitErrorMessage: (err: Error) => void;
};

export default function publicHandlers(io: Server, socket: Socket, userSessionParams: GettingDeskType) {
  function emitErrorMessage(err: Error) {
    socket.emit('errorMessage', err.message ?? 'Произошла ошибка');
  }

  const colHandlers = publicColumnHandlers({ socket, io, userSessionParams, emitErrorMessage });
  const itemHandlers = publicItemHandlers({ socket, io, userSessionParams, emitErrorMessage });
  const deskHandlers = publicDeskHandlers({ socket, io, userSessionParams, emitErrorMessage });

  return {
    getDesk: deskHandlers.getDesk,
    getNewColumn: colHandlers.getNewColumn,
    emitErrorMessage,
    getNewColumnItem: itemHandlers.getNewColumnItem,
    changeColumn: colHandlers.changeColumn,
    provideNewColumnName: colHandlers.provideNewColumnName,
    provideNewColumnDescription: colHandlers.provideNewColumnDescription,
    getArchivedListItems: itemHandlers.getArchivedListItems,
    provideNewDeskName: deskHandlers.provideNewDeskName,
    provideNewDeskDescription: deskHandlers.provideNewDeskDescription,
    provideNewItemName: itemHandlers.provideColumnItemName,
    provideNewItemDescription: itemHandlers.provideNewItemDescription,
  };
}
