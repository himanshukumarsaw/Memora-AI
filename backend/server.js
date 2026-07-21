// ─── server.js ────────────────────────────────────────────────────────────────
// Memora AI Backend — Entry Point
// Architecture: Layered (Routes → Controllers → Services → Repositories → MongoDB)
// Per 06_Backend_Architecture.md

require('dotenv').config();
require('express-async-errors'); // auto-forward async throws to error middleware

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const fs      = require('fs');

const connectDB            = require('./config/db');
const routes               = require('./routes/index');
const errorMiddleware      = require('./middleware/error.middleware');
const { generalLimiter }   = require('./middleware/rateLimit.middleware');
const { scheduleReminderJob } = require('./jobs/reminder.job');
const logger               = require('./utils/logger');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Uploads Directory ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// ─── General Rate Limit ───────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── HTTP Logger (Morgan → Winston) ──────────────────────────────────────────
app.use(morgan('combined', { stream: logger.stream }));

// ─── Static Assets ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({
    status:    'OK',
    message:   'Memora AI Backend Running',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Centralised Error Handler (must be last) ─────────────────────────────────
app.use(errorMiddleware);

// ─── Server Bootstrap ─────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`\n🧠  Memora AI Backend    → http://localhost:${PORT}`);
    logger.info(`📁  Uploads directory   → http://localhost:${PORT}/uploads`);
    logger.info(`✅  Health check        → http://localhost:${PORT}/health\n`);
  });

  // Start background jobs after DB connection
  scheduleReminderJob();
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
