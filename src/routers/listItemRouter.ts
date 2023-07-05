import { Router } from 'express';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';
import listItemController from '../controllers/listItemController.js';
const listItemRouter = Router();
listItemRouter.post('/:wsid/:deskid/:listid', checkAuthMiddleware, listItemController.addNewItem);
listItemRouter.put('/:wsid/:deskid/:listid/:id', checkAuthMiddleware, listItemController.updateListItem);
listItemRouter.delete('/:wsid/:deskid/:listid/:id', checkAuthMiddleware, listItemController.deleteListItem);
listItemRouter.post('/order/:wsid/:deskid/:listid/:id', checkAuthMiddleware, listItemController.changeOrder);

export default listItemRouter;
