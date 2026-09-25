import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import speakerRoutes from './routes/speakers.js';
import sessionRoutes from './routes/sessions.js';
import sponsorRoutes from './routes/sponsors.js';
import feedbackRoutes from './routes/feedback.js';
import aiRoutes from './routes/ai.js';
import announcementRoutes from './routes/announcements.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import intelligenceRoutes from './routes/intelligence.js';

const app = express();

// Security and CORS
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Observability & Request Correlation Middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req_${crypto.randomBytes(8).toString('hex')}`;
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      const user = req.user ? `[User: ${req.user._id}]` : '[Anon]';
      console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms - ${requestId} ${user}`);
    }
  });

  next();
});

// Endpoint-specific Rate Limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts. Please try again later.' } }
});

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'AI copilot rate limit reached. Please wait a moment.' } }
});

export const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'High ticket scan rate. Please throttle scanning rate.' } }
});

// General API rate limiter
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Liveness Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      status: 'healthy', 
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      requestId: req.id
    } 
  });
});

// Readiness Probe (Validates DB connectivity and core dependencies)
app.get('/api/ready', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbReady = dbState === 1;

  if (!isDbReady) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DEPENDENCY_NOT_READY',
        message: 'Database connection is not currently established'
      },
      dbState,
      requestId: req.id
    });
  }

  res.json({
    success: true,
    data: {
      status: 'ready',
      database: 'connected',
      modelsRegistered: mongoose.modelNames().length,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events/:eventId/intelligence', aiLimiter, intelligenceRoutes);
app.use('/api/events/:eventId/sponsors', sponsorRoutes);
app.use('/api/events/:eventId/ai', aiLimiter, aiRoutes);
app.use('/api/events/:eventId/announcements', announcementRoutes);
app.use('/api/events/:eventId/analytics', analyticsRoutes);
app.use('/api/events/:eventId/feedback', feedbackRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/sessions', sessionRoutes);

// Global Error Handler with Standardized Error Contract
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.id || 'no-req-id'}]`, err);
  }

  if (err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request payload validation failed',
        details: err.errors
      },
      requestId: req.id
    });
  }

  const statusCode = err.statusCode || (err.message?.includes('not found') ? 404 : 500);
  const errorCode = err.code || (statusCode === 404 ? 'RESOURCE_NOT_FOUND' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 401 ? 'UNAUTHORIZED' : 'INTERNAL_SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    error: {
      code: errorCode,
      message: err.message || 'An unexpected server error occurred'
    },
    requestId: req.id
  });
});

export default app;
