import { GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { PublicHandlersType } from '../types.js';
import deskService from '../../services/deskService.js';

export default function privateDeskHandlers(userSessionParams: GettingDeskType, publicHandlers: PublicHandlersType) {
  async function changeDeskName(deskId: number, name: string) {
    try {
      const deskName = await deskService.changeDeskName(deskId, userSessionParams.wsId, userSessionParams.userId, name);
      publicHandlers.provideNewDeskName(deskName);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  async function changeDeskDescription(deskId: number, description: string) {
    try {
      const deskDescription = await deskService.changeDeskDescription(
        deskId,
        userSessionParams.wsId,
        userSessionParams.userId,
        description,
      );
      publicHandlers.provideNewDeskDescription(deskDescription ?? null);
    } catch (err) {
      publicHandlers.emitErrorMessage(err as Error);
    }
  }

  return { changeDeskDescription, changeDeskName };
}
