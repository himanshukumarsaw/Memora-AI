// ─── utils/logger.js ──────────────────────────────────────────────────────────
// Winston logger: HTTP traffic (Morgan) + application events.
// All modules import this logger instead of console.log.

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

// Ensure log directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = format;

// Custom print format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    // Console (dev)
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    }),
    // Persistent file — all logs
    new transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      tailable: true,
    }),
    // Separate error file
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
    // Security / audit file
    new transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

/**
 * Convenience helpers matching Morgan stream signature.
 * Usage:  morgan('combined', { stream: logger.stream })
 */
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
