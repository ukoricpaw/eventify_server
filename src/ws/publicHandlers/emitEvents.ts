import { Server, Socket } from "socket.io";


const emitEvent = (socket: Socket,io: Server, roomId: number) =>(event: string, handler?: () => void) => (body: any, socketRender: boolean) {
  try {
    handler && handler();
    if (socketRender) {
      io.in(String(roomId)).emit(event, body);
    } else {
      socket.to(String(roomId)).emit(event, body);
    }
  } catch (err) {
    socket.emit('errorMessage', (err as Error).message ?? 'Произошла ошибка');
  }
}