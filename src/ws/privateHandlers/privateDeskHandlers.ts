import { HandlerProperties, GettingDeskType } from '../publicHandlers/publicHandlers.js';
import deskService from '../../services/deskService.js';
import { EmitEventsInterface } from '../publicHandlers/typesOfPublicHandlers.js';

export default function privateDeskHandlers(
  userSessionParams: GettingDeskType,
  publicHandlers: EmitEventsInterface[HandlerProperties.EMIT_HANDLERS_NUMBER],
) {
  async function changeDeskName(deskId: number, name: string) {
    const deskName = await deskService.changeDeskInfo(
      'name',
      deskId,
      userSessionParams.wsId,
      userSessionParams.userId,
      name,
    );
    publicHandlers.provideNewDeskName(deskName as string, true);
  }

  async function changeDeskDescription(deskId: number, description: string) {
    const deskDescription = await deskService.changeDeskInfo(
      'description',
      deskId,
      userSessionParams.wsId,
      userSessionParams.userId,
      description,
    );
    publicHandlers.provideNewDeskDescription(deskDescription ?? null, true);
  }

  return { changeDeskDescription, changeDeskName };
}

export type DeskHandlersType = ReturnType<typeof privateDeskHandlers>;
