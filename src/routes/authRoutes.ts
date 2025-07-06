import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * Authentication Routes
 */

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));

// Protected routes
router.get('/profile', authenticate, asyncHandler(getProfile));
router.post('/logout', authenticate, asyncHandler(logout));

export default router;
