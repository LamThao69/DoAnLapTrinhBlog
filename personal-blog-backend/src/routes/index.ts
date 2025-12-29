import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';
import categoryRoutes from './categoryRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);

export default router;

