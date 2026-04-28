import express from 'express';
import { getProfile, updatePassword, cancelMembership } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/change-password', authMiddleware, updatePassword);
router.delete('/cancel-membership', authMiddleware, cancelMembership);

export default router;
