import { Router } from 'express';
import listController from '../controllers/listController.js';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';

const listRouter = Router();

listRouter.post('/:wsid/:deskid', checkAuthMiddleware, listController.addNewList);
listRouter.put('/:wsid/:deskid/:id', checkAuthMiddleware, listController.updateList);
listRouter.delete('/:wsid/:deskid/:id', checkAuthMiddleware, listController.deleteList);
listRouter.post('/order/:wsid/:deskid/:id', checkAuthMiddleware, listController.changeOrder);

export default listRouter;
