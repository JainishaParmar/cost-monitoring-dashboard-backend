import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface JWTPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate access token
 */
export const generateAccessToken = (userId: number, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, process.env['JWT_SECRET'] as string, {
    expiresIn: process.env['JWT_EXPIRES_IN'] || '30m',
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: number, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'refresh',
  };

  return jwt.sign(payload, process.env['JWT_REFRESH_SECRET'] as string, {
    expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  } as jwt.SignOptions);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (userId: number, email: string): TokenResponse => {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);

  // Calculate expiration time in seconds
  const expiresIn = 30 * 60; // 30 minutes in seconds

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, process.env['JWT_REFRESH_SECRET']!) as JWTPayload;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Extract token from request headers
 */
export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};
