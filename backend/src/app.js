import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import speakerRoutes from './routes/speakers.js';
import sponsorRoutes from './routes/sponsors.js';
import feedbackRoutes from './routes/feedback.js';
import aiRoutes from './routes/ai.js';
import announcementRoutes from './routes/announcements.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

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

// Relaxed rate limit for smooth testing
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events/:eventId/sponsors', sponsorRoutes);
app.use('/api/events/:eventId/ai', aiRoutes);
app.use('/api/events/:eventId/announcements', announcementRoutes);
app.use('/api/events/:eventId/analytics', analyticsRoutes);
app.use('/api/events/:eventId/feedback', feedbackRoutes);
app.use('/api/speakers', speakerRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }
  const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred'
  });
});

export default app;
