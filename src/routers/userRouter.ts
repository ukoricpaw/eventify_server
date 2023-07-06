import { Router } from 'express';
import userController from '../controllers/userController.js';
import { body } from 'express-validator';
import checkAuthMiddleware from '../middlewares/checkAuthMiddleware.js';
const userRouter = Router();

userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 20 }),
  userController.registration,
);
userRouter.post('/login', userController.login);
userRouter.get('/logout', userController.logout);
userRouter.get('/refresh', userController.refresh);
userRouter.get('/activate/:link', userController.activate);
userRouter.put('/', checkAuthMiddleware, userController.updateUser);
userRouter.post(
  '/change/password',
  checkAuthMiddleware,
  body('newPassword').isLength({ min: 8, max: 20 }),
  userController.changePassword,
);

export default userRouter;
