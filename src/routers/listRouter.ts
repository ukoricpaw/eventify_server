import { Router } from 'express';
import listController from '../controllers/listController.js';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';
import listItemRouter from './listItemRouter.js';

const listRouter = Router();

listRouter.use('/item', listItemRouter);
listRouter.post('/:wsid/:deskid', checkAuthMiddleware, listController.addNewList);
listRouter.put('/:wsid/:deskid/:id', checkAuthMiddleware, listController.updateList);
listRouter.delete('/:wsid/:deskid/:id', checkAuthMiddleware, listController.deleteList);
listRouter.post('/order/:wsid/:deskid/:id', checkAuthMiddleware, listController.changeOrder);

export default listRouter;
