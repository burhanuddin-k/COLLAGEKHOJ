const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics.middleware');

const authRoutes = require('./routes/auth.routes');
const collegeRoutes = require('./routes/college.routes');
const courseRoutes = require('./routes/course.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const admissionRoutes = require('./routes/admission.routes');
const adminRoutes = require('./routes/admin.routes');
const portalRoutes = require('./routes/portal.routes');

const app = express();

// ---- Security & core middleware ----
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(metricsMiddleware);
app.use(generalLimiter);

// ---- Health check (used by Docker healthcheck + ALB target group) ----
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Prometheus metrics ----
app.get('/api/metrics', metricsEndpoint);

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

// ---- 404 + centralized error handling (must be last) ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
