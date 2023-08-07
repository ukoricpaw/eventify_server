import { Socket } from 'socket.io';
import { HandlerProperties, GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { EmitEventsInterface } from '../publicHandlers/typesOfPublicHandlers.js';
import { getTypesOfPrivateHandlers } from './typesOfPrivateHandlers.js';
export default function privateHandlers(
  socket: Socket,
  userSessionParams: GettingDeskType,
  publicHandlers: EmitEventsInterface,
) {
  const handlerWithErrorChecking = privateOnHandlers(publicHandlers[HandlerProperties.ERROR_HANDLER_NUMBER]);
  const typesOfPrivateHandlers = getTypesOfPrivateHandlers(
    userSessionParams,
    publicHandlers[HandlerProperties.EMIT_HANDLERS_NUMBER],
  );

  typesOfPrivateHandlers.forEach(privateHandlerWithEvent => {
    socket.on(
      privateHandlerWithEvent.event,
      handlerWithErrorChecking(privateHandlerWithEvent.handler as () => Promise<void>),
    );
  });
}

function privateOnHandlers(emitError: EmitEventsInterface[typeof HandlerProperties.ERROR_HANDLER_NUMBER]) {
  return <Args extends any[]>(handler: (...args: Args) => Promise<void>) => {
    const handlerWithErrorChecking = async (...args: Args) => {
      try {
        await handler(...args);
      } catch (err) {
        emitError(err as Error);
      }
    };
    return handlerWithErrorChecking;
  };
}
