import { Socket } from 'socket.io';
import { GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { PublicHandlersType } from '../types.js';
import columnHandlers from './privateColumnHandlers.js';
import deskHandlers from './privateDeskHandlers.js';
import itemHandlers from './privateItemHandlers.js';
export default function privateHandlers(
  socket: Socket,
  userSessionParams: GettingDeskType,
  publicHandlers: PublicHandlersType,
) {
  const colHandlers = columnHandlers(userSessionParams, publicHandlers);
  const fullDeskHandlers = deskHandlers(userSessionParams, publicHandlers);
  const colItemHandlers = itemHandlers(userSessionParams, publicHandlers);

  socket.on('list:add', colHandlers.addColumnList);
  socket.on('list:delete', colHandlers.deleteColumnList);
  socket.on('list:reorder', colHandlers.reorderColumns);
  socket.on('list:name', colHandlers.changeColumnName);
  socket.on('list:archive', colHandlers.changeColumnArchiveStatus);
  socket.on('list:description', colHandlers.changeColumnDescription);
  socket.on('list:newItem', colItemHandlers.addNewItemToColumn);
  socket.on('item:reorder', colItemHandlers.reorderItemsInColumns);
  socket.on('item:name', colItemHandlers.changeItemName);
  socket.on('item:description', colItemHandlers.changeItemDescription);
  socket.on('desk:name', fullDeskHandlers.changeDeskName);
  socket.on('desk:description', fullDeskHandlers.changeDeskDescription);
}
