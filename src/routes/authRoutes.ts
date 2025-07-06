import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Authentication Routes
 */

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;
