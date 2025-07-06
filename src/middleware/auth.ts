import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import User from '../models/User';
import { log } from '../utils/logger';
import { AuthenticationError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Authentication middleware to protect routes
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    const decoded = verifyAccessToken(token);

    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    log.info('User authenticated successfully', { userId: user.id, email: user.email });
    next();
  } catch (error) {
    log.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    throw new AuthenticationError('Invalid or expired token');
  }
};
