import {
  createLogger, format, transports, Logger,
} from 'winston';

interface LogMeta {
  [key: string]: any;
}

// Custom format for structured logging
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf((info: any) => {
    const {
      timestamp, level, message, stack, ...meta
    } = info;
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  }),
);

// Create logger instance
const logger: Logger = createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: logFormat,
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
      ),
    }),
    // File transport for production
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Create a simple interface for easy usage
export const log = {
  info: (message: string, meta?: LogMeta) => logger.info(message, meta),
  error: (message: string, meta?: LogMeta) => logger.error(message, meta),
  warn: (message: string, meta?: LogMeta) => logger.warn(message, meta),
  debug: (message: string, meta?: LogMeta) => logger.debug(message, meta),
  verbose: (message: string, meta?: LogMeta) => logger.verbose(message, meta),
};

export default logger;
