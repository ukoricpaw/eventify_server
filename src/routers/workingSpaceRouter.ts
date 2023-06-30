import { Router } from 'express';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';
import workingSpaceController from '../controllers/workingSpaceController.js';
import checkRoleMiddeware from '../middlewares/checkRoleMiddleware.js';
import checkUserMiddleware from '../middlewares/checkUserMiddleware.js';

const workingSpaceRouter = Router();

workingSpaceRouter.post('/', checkAuthMiddleware, workingSpaceController.addNewWorkingSpace);
workingSpaceRouter.put('/:id', checkAuthMiddleware, workingSpaceController.updateWorkingSpace);
workingSpaceRouter.delete('/:id', checkAuthMiddleware, workingSpaceController.deleteWorkingSpace);
workingSpaceRouter.get('/:id', checkUserMiddleware, workingSpaceController.getSingleWorkingSpace);
workingSpaceRouter.get('/get/all', checkAuthMiddleware, workingSpaceController.getAllWorkingSpaces);
workingSpaceRouter.get('/getall/public', workingSpaceController.getAllPublicWS);
workingSpaceRouter.get('/getall/private', checkRoleMiddeware('ADMIN'), workingSpaceController.getAllPrivateWS);

export default workingSpaceRouter;