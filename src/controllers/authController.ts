import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { log } from '../utils/logger';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

/**
 * Register a new user
 */
export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await User.create({ email, password });

    log.info('User registered successfully', { email: user.email });

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now log in.',
      data: { email: user.email },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }

    log.error('Registration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: req.body.email,
    });
    throw error;
  }
};

/**
 * Login user with database credentials
 */
export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = generateTokens(user.id, user.email);

    log.info('User logged in successfully', { email: user.email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      throw error;
    }

    log.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: req.body.email,
    });
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email);

    log.info('Token refreshed successfully', { userId: user.id });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: { id: user.id, email: user.email },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }

    log.error('Refresh token error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AuthenticationError('Invalid refresh token');
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a more sophisticated implementation, you might want to blacklist the refresh token
    // For now, we'll just return a success response
    log.info('User logged out successfully');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    log.error('Logout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user info from req.user (set by authentication middleware)
    // @ts-ignore
    const { user } = req;
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }

    log.info('User profile retrieved successfully', { userId: user.id });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    log.error('Get profile error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};
