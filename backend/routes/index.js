const express = require('express');
const router  = express.Router();

const authRoutes          = require('./auth.routes');
const documentRoutes      = require('./documents.routes');
const aiRoutes            = require('./ai.routes');
const chatRoutes          = require('./chat.routes');
const searchRoutes        = require('./search.routes');
const reminderRoutes      = require('./reminders.routes');
const notificationRoutes  = require('./notifications.routes');
const shareRoutes         = require('./share.routes');
const profileRoutes       = require('./profile.routes');
const resumeRoutes        = require('./resume.routes');
const autofillRoutes      = require('./autofill.routes');
const activityRoutes      = require('./activity.routes');
const dashboardRoutes     = require('./dashboard.routes');
const adminRoutes         = require('./admin.routes');
const emergencyRoutes     = require('./emergency.routes');
const timelineRoutes      = require('./timeline.routes');
const graphRoutes         = require('./knowledgeGraph.routes');
const opportunityRoutes   = require('./opportunity.routes');

// Helper to mount routes both with and without /v1 prefix
const registerModule = (path, routeModule) => {
  router.use(path, routeModule);
  router.use(`/v1${path}`, routeModule);
};

// ─── Module Registrations (v1 supported) ─────────────────────────────────────
registerModule('/auth',          authRoutes);
registerModule('/documents',     documentRoutes);
registerModule('/ai',            aiRoutes);
registerModule('/chat',          chatRoutes);
registerModule('/search',        searchRoutes);
registerModule('/reminders',     reminderRoutes);
registerModule('/notifications', notificationRoutes);
registerModule('/share',         shareRoutes);
registerModule('/profile',       profileRoutes);
registerModule('/resume',        resumeRoutes);
registerModule('/autofill',      autofillRoutes);
registerModule('/activity',      activityRoutes);
registerModule('/dashboard',     dashboardRoutes);
registerModule('/admin',         adminRoutes);
registerModule('/emergency',     emergencyRoutes);
registerModule('/timeline',      timelineRoutes);
registerModule('/graph',         graphRoutes);
registerModule('/opportunities', opportunityRoutes);

// ─── 404 for unknown API routes ───────────────────────────────────────────────
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    code:    'NOT_FOUND',
  });
});

module.exports = router;
