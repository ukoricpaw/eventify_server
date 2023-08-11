import { GettingDeskType } from '../publicHandlers/publicHandlers.js';
import { EmitEventsInterface } from '../publicHandlers/typesOfPublicHandlers.js';
import { HandlerProperties } from '../publicHandlers/publicHandlers.js';
import columnHandlers from './privateColumnHandlers.js';
import deskHandlers from './privateDeskHandlers.js';
import itemHandlers from './privateItemHandlers.js';
import { ItemHandlersType } from './privateItemHandlers.js';
import { ColHandlersType } from './privateColumnHandlers.js';
import { DeskHandlersType } from './privateDeskHandlers.js';

type HandlersWithEvent = {
  event: string;
  handler:
    | ColHandlersType[keyof ColHandlersType]
    | ItemHandlersType[keyof ItemHandlersType]
    | DeskHandlersType[keyof DeskHandlersType];
};

export function getTypesOfPrivateHandlers(
  userSessionParams: GettingDeskType,
  publicHandlers: EmitEventsInterface[HandlerProperties.EMIT_HANDLERS_NUMBER],
) {
  const colHandlers = columnHandlers(userSessionParams, publicHandlers);
  const fullDeskHandlers = deskHandlers(userSessionParams, publicHandlers);
  const colItemHandlers = itemHandlers(userSessionParams, publicHandlers);

  return returnAllPrivateEvents(colHandlers, colItemHandlers, fullDeskHandlers);
}

function returnAllPrivateEvents(
  colHandlers: ColHandlersType,
  itemHandlers: ItemHandlersType,
  deskHandlers: DeskHandlersType,
): HandlersWithEvent[] {
  return [
    {
      event: 'list:add',
      handler: colHandlers.addColumnList,
    },
    {
      event: 'list:delete',
      handler: colHandlers.deleteColumnList,
    },
    {
      event: 'list:reorder',
      handler: colHandlers.reorderColumns,
    },
    {
      event: 'list:name',
      handler: colHandlers.changeColumnName,
    },
    {
      event: 'list:archive',
      handler: colHandlers.changeColumnArchiveStatus,
    },
    {
      event: 'list:description',
      handler: colHandlers.changeColumnDescription,
    },
    {
      event: 'list:newItem',
      handler: itemHandlers.addNewItemToColumn,
    },
    {
      event: 'item:reorder',
      handler: itemHandlers.reorderItemsInColumns,
    },
    {
      event: 'item:name',
      handler: itemHandlers.changeItemName,
    },
    {
      event: 'item:description',
      handler: itemHandlers.changeItemDescription,
    },
    {
      event: 'item:deadline',
      handler: itemHandlers.changeItemDeadline,
    },
    {
      event: 'desk:name',
      handler: deskHandlers.changeDeskName,
    },
    {
      event: 'desk:description',
      handler: deskHandlers.changeDeskDescription,
    },
    {
      event: 'item:remove',
      handler: itemHandlers.deleteItem,
    },
  ];
}
