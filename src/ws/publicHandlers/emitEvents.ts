import { Server, Socket } from 'socket.io';

class EmitEventManager {
  private socket: Socket;
  private io: Server;
  private roomId: number;

  constructor(socket: Socket, io: Server, roomId: number) {
    this.socket = socket;
    this.io = io;
    this.roomId = roomId;
  }

  emitErrorMessage(err: Error) {
    this.socket.emit('errorMessage', (err as Error).message ?? 'Произошла ошибка');
  }

  emitEvent = (event: string) => (body: any, socketRender: boolean) => {
    try {
      if (socketRender) {
        this.io.in(String(this.roomId)).emit(event, body);
      } else {
        this.socket.to(String(this.roomId)).emit(event, body);
      }
    } catch (err) {
      this.emitErrorMessage(err as Error);
    }
  };
}

export default EmitEventManager;
