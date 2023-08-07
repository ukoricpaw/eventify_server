import { Server, Socket } from 'socket.io';

export const emitErrorMessage = (socket: Socket) => (err: Error) => {
  socket.emit('errorMessage', (err as Error).message ?? 'Произошла ошибка');
};

export const emitEvent =
  (socket: Socket, io: Server, roomId: number) => (event: string) => (body: any, socketRender: boolean) => {
    try {
      if (socketRender) {
        io.in(String(roomId)).emit(event, body);
      } else {
        socket.to(String(roomId)).emit(event, body);
      }
    } catch (err) {
      emitErrorMessage(socket)(err as Error);
    }
  };
