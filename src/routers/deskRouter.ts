import { Router } from 'express';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';
import checkUserMiddleware from '../middlewares/checkUserMiddleware.js';
import deskController from '../controllers/deskController.js';
import checkRoleMiddeware from '../middlewares/checkRoleMiddleware.js';
import listRouter from './listRouter.js';

const deskRouter = Router();
// deskRouter.use('/list', listRouter);
deskRouter.post('/:id', checkAuthMiddleware, deskController.addNewDesk);
deskRouter.put('/:wsid/:id', checkAuthMiddleware, deskController.updateDesk);
deskRouter.delete('/:wsid/:id', checkAuthMiddleware, deskController.deleteDesk);
deskRouter.get('/:wsid/:id', checkUserMiddleware, deskController.getDesk);
deskRouter.get('/story/:wsid/:id', checkUserMiddleware, deskController.getStory);
deskRouter.post('/act/add', checkRoleMiddeware('ADMIN'), deskController.addDeskAct);
deskRouter.get('/:wsid/:id/items', checkUserMiddleware, deskController.getItems);
deskRouter.delete('/act/delete/:id', checkRoleMiddeware('ADMIN'), deskController.deleteDeskAct);

export default deskRouter;
