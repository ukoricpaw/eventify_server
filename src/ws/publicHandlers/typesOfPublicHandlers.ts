type EmitEventHandlerType = {
  keyOfEmitEvent: string;
  valueOfEmitEvent: string;
};

export type EmitEventType = (body: any, socketRender: boolean) => void;
export type EmitEventsInterface = [(err: Error) => void, { [Prop: string]: EmitEventType }];

export const typesOfEmitHandlers: EmitEventHandlerType[] = [
  {
    keyOfEmitEvent: 'getDesk',
    valueOfEmitEvent: 'desk',
  },
  {
    keyOfEmitEvent: 'getNewColumn',
    valueOfEmitEvent: 'desk:newcol',
  },
  {
    keyOfEmitEvent: 'getNewColumnItem',
    valueOfEmitEvent: 'list:getItem',
  },
  {
    keyOfEmitEvent: 'changeColumn',
    valueOfEmitEvent: 'item:getNewOrder',
  },
  {
    keyOfEmitEvent: 'provideNewColumnName',
    valueOfEmitEvent: 'list:newName',
  },
  {
    keyOfEmitEvent: 'provideNewColumnDescription',
    valueOfEmitEvent: 'list:newDescription',
  },
  {
    keyOfEmitEvent: 'getArchivedListItems',
    valueOfEmitEvent: 'list:archiveList',
  },
  {
    keyOfEmitEvent: 'provideNewDeskName',
    valueOfEmitEvent: 'desk:newName',
  },
  {
    keyOfEmitEvent: 'provideNewDeskDescription',
    valueOfEmitEvent: 'desk:newDescription',
  },
  {
    keyOfEmitEvent: 'provideNewItemName',
    valueOfEmitEvent: 'item:newName',
  },
  {
    keyOfEmitEvent: 'provideNewItemDescription',
    valueOfEmitEvent: 'item:newDescription',
  },
  {
    keyOfEmitEvent: 'provideNewItemDeadline',
    valueOfEmitEvent: 'item:newDeadline',
  },
];
