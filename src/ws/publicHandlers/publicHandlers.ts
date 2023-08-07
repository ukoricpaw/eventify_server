import { Socket, Server } from 'socket.io';
import { emitEvent } from './emitEvents.js';
import { typesOfEmitHandlers, EmitEventsInterface } from './typesOfPublicHandlers.js';
import { emitErrorMessage } from './emitEvents.js';

export type GettingDeskType = {
  wsId: number;
  deskId: number;
  userId: number;
};

export enum HandlerProperties {
  ERROR_HANDLER_NUMBER = 0,
  EMIT_HANDLERS_NUMBER = 1,
}

export type PublicHandlersType = {
  io: Server;
  socket: Socket;
  userSessionParams: GettingDeskType;
  emitErrorMessage: (err: Error) => void;
};

export default function publicHandlers(
  io: Server,
  socket: Socket,
  userSessionParams: GettingDeskType,
): EmitEventsInterface {
  const eventWithDefaultConfiguration = emitEvent(socket, io, userSessionParams.deskId);
  const emitHandlers = typesOfEmitHandlers.reduce(
    (result: EmitEventsInterface[HandlerProperties.EMIT_HANDLERS_NUMBER], emitHandler) => {
      result[emitHandler.keyOfEmitEvent] = eventWithDefaultConfiguration(emitHandler.valueOfEmitEvent);
      return result;
    },
    {},
  );
  const emitErrorHandler = emitErrorMessage(socket);

  return [emitErrorHandler, emitHandlers];
}
