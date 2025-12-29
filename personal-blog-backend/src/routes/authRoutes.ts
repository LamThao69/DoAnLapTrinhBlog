import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, getAllUsers, deleteUser } from '../controllers/authController';
import auth from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/me', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.get('/users', auth, getAllUsers);
router.delete('/users/:id', auth, deleteUser);

export default router;

