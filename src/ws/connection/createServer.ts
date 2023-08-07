import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
export default function createServer(io: Server | null, server: HttpServer) {
  if (!io) {
    const newIo = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
    });
    return newIo;
  }
  return io;
}
