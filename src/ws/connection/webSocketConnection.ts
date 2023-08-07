import { Server } from 'socket.io';
import type { Server as ServerType } from 'node:http';
import listService from '../../services/listService.js';
import publicHandlers from '../publicHandlers/publicHandlers.js';
import privateHandlers from '../privateHandlers/privateHandlers.js';
import createServer from './createServer.js';
import checkAccessOfConnectionByCookie from './checkAccessOfConnectionByCookie.js';

let io: null | Server = null;

export default function createWebSocketConnection(server: ServerType) {
  const newServer = createServer(io, server);
  if (newServer) {
    io = newServer;
    io.on('connection', async socket => {
      try {
        const { wspaceId, deskId, verified } = checkAccessOfConnectionByCookie(socket, socket.handshake.headers.cookie);
        const wsRole = await listService
          .checkWSRoleAndDesk(Number(wspaceId), Number(verified.id), Number(deskId), true)
          .catch(() => {
            throw new Error();
          });

        socket.join(deskId);
        const publicWSHandlers = publicHandlers(io as Server, socket, {
          wsId: Number(wspaceId),
          deskId: Number(deskId),
          userId: verified.id,
        });

        if (wsRole && wsRole?.roleId <= 2) {
          privateHandlers(
            socket,
            {
              wsId: Number(wspaceId),
              deskId: Number(deskId),
              userId: verified.id,
            },
            publicWSHandlers,
          );
        }

        socket.on('disconnect', () => {
          console.log(verified.email, 'disconnect');
        });
      } catch (err) {
        socket.emit('errorMessage', (err as Error).message);
        socket.disconnect();
      }
    });
  }
}
