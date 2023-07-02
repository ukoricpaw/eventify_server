import { Router } from 'express';
import userRouter from './userRouter.js';
import workingSpaceRouter from './workingSpaceRouter.js';
import roleRouter from './roleRouter.js';
import imageRouter from './imageRouter.js';
const router = Router();

router.use('/user', userRouter);
router.use('/wspace', workingSpaceRouter);
router.use('/role', roleRouter);
router.use('/image', imageRouter);

export default router;
