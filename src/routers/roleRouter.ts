import { Router } from 'express';
import checkRoleMiddeware from '../middlewares/checkRoleMiddleware.js';
import roleController from '../controllers/roleController.js';
const roleRouter = Router();

roleRouter.post('/', checkRoleMiddeware('ADMIN'), roleController.addRole);
roleRouter.delete('/:id', checkRoleMiddeware('ADMIN'), roleController.deleteRole);

export default roleRouter;
