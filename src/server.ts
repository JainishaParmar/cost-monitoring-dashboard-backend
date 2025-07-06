import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import sequelize from './config/database';
import costRoutes from './routes/costRoutes';
import authRoutes from './routes/authRoutes';
import errorHandler from './middleware/errorHandler';
import { log } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 5000;

/**
 * Server Configuration
 * Express app setup with security, middleware, and route configuration
 */

// Security middleware
app.use(helmet());

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (development only)
if (process.env['NODE_ENV'] === 'development') {
  app.use(morgan('dev'));
}

/**
 * API Routes
 * Health check and authentication endpoints
 */

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Cost Monitoring API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/costs', costRoutes);

// 404 handler for undefined routes
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handling middleware
app.use(errorHandler);

/**
 * Server Startup
 * Server initialization without database
 */
async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    log.info('Database connection established successfully');
    await sequelize.sync({ alter: true });
    log.info('Database models synchronized');
    // Start server
    app.listen(PORT, () => {
      log.info('Server started successfully', {
        port: PORT,
        apiUrl: `http://localhost:${PORT}`,
        healthCheck: `http://localhost:${PORT}/health`,
        authEndpoint: `http://localhost:${PORT}/api/auth/login`,
      });
    });
  } catch (error) {
    log.error('Failed to start server', { error: error instanceof Error ? error.message : 'Unknown error' });
    process.exit(1);
  }
}

/**
 * Graceful Shutdown
 * Handle process termination signals
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received, shutting down gracefully`);
  await sequelize.close();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
