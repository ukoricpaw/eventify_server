import { Server } from 'socket.io';
import type { Server as ServerType } from 'node:http';
import tokenService from '../services/tokenService.js';
import listService from '../services/listService.js';
import publicHandlers from './publicHandlers.js';
import privateHandlers from './privateHandlers.js';

let io: null | Server = null;

export default function createWebSocketConnection(server: ServerType) {
  try {
    if (!io) {
      io = new Server(server, {
        cors: {
          origin: process.env.CLIENT_URL,
          credentials: true,
        },
      });
    }

    io.on('connection', async socket => {
      try {
        const cookie = socket.handshake.headers.cookie;
        if (!cookie) {
          throw new Error();
        }
        const token = cookie.split('; accessToken=')[1];
        if (!token) {
          throw new Error();
        }
        const verified = tokenService.validateAccessToken(token);
        if (!verified) {
          throw new Error();
        }
        const { wspaceId, deskId } = socket.handshake.query;
        if (!wspaceId || !deskId) {
          throw new Error();
        }
        const wsRole = await listService
          .checkWSRoleAndDesk(Number(wspaceId), Number(verified.id), Number(deskId), true)
          .catch(() => {
            throw new Error();
          });

        socket.join(deskId);

        console.log(verified.email);

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
          console.log('disconnect');
        });
      } catch (err) {
        socket.emit('errorMessage', 'Ошибка соединения');
        socket.disconnect();
      }
    });
  } catch (err) {
    console.log(err);
  }
}
