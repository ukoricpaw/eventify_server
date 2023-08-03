import { DeskListInstance } from '../models/DeskList.js';
import { DeskListItemInstance } from '../models/DeskItem.js';

export interface PublicHandlersType {
  getDesk: (socketRender?: boolean) => Promise<void>;
  getNewColumn: (column: DeskListInstance, socketRender?: boolean) => void;
  getNewColumnItem: (listId: number, item: DeskListItemInstance, socketRender?: boolean) => void;
  emitErrorMessage: (err: Error) => void;
  changeColumn: (listId: number, secondListId: number | null, socketRender?: boolean) => void;
  provideNewColumnName: (listId: number, name: string) => void;
  provideNewColumnDescription: (listId: number, description: string | null) => void;
  getArchivedListItems: (listId: number, type: 'toArchive' | 'fromArchive') => void;
  provideNewDeskName: (name: string) => void;
  provideNewDeskDescription: (description: string | null) => void;
  provideNewItemName: (item: number, name: string) => void;
  provideNewItemDescription: (item: number, description: string) => void;
}
