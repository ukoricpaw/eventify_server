import { Router } from 'express';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';
import workingSpaceController from '../controllers/workingSpaceController.js';
import checkRoleMiddeware from '../middlewares/checkRoleMiddleware.js';
import checkUserMiddleware from '../middlewares/checkUserMiddleware.js';
import deskRouter from './deskRouter.js';
import workingSpaceActionsController from '../controllers/workingSpaceActionsController.js';

const workingSpaceRouter = Router();

workingSpaceRouter.use('/desk', deskRouter);
workingSpaceRouter.post('/', checkAuthMiddleware, workingSpaceController.addNewWorkingSpace);
workingSpaceRouter.put('/:id', checkAuthMiddleware, workingSpaceController.updateWorkingSpace);
workingSpaceRouter.delete('/:id', checkAuthMiddleware, workingSpaceController.deleteWorkingSpace);
workingSpaceRouter.get('/:id', checkUserMiddleware, workingSpaceController.getSingleWorkingSpace);
workingSpaceRouter.get('/get/all', checkAuthMiddleware, workingSpaceController.getAllWorkingSpaces);
workingSpaceRouter.get('/getall/public', checkAuthMiddleware, workingSpaceController.getAllPublicWS);
workingSpaceRouter.get('/getall/private', checkRoleMiddeware('ADMIN'), workingSpaceController.getAllPrivateWS);
workingSpaceRouter.get('/invite/:link', checkAuthMiddleware, workingSpaceActionsController.inviteUserToWS);
workingSpaceRouter.post('/permission/:id', checkAuthMiddleware, workingSpaceActionsController.changePermission);
workingSpaceRouter.get('/members/:id', checkUserMiddleware, workingSpaceActionsController.getAllWSUsers);
workingSpaceRouter.get('/leave/:id', checkAuthMiddleware, workingSpaceActionsController.leaveFromWorkingSpace);
workingSpaceRouter.delete('/leave/:id', checkAuthMiddleware, workingSpaceActionsController.deleteUserFromWorkingSpace);

export default workingSpaceRouter;
