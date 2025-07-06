import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import sequelize from './config/database';
import costRoutes from './routes/costRoutes';
import errorHandler from './middleware/errorHandler';

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
 * Health check and cost management endpoints
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
 * Database connection and server initialization
 */
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Cost Monitoring API: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
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
