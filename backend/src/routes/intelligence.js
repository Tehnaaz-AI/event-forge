import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import * as c from '../controllers/eventIntelligenceController.js';
import { handleEventStream } from '../realtime/sseHandler.js';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';

const r = Router({ mergeParams: true });

// Scoped SSE Stream Token Authenticator
export async function authenticateStreamToken(req, res, next) {
  try {
    const rawToken = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    if (!rawToken) {
      return res.status(401).json({ success: false, message: 'Scoped stream token is required for SSE connection' });
    }

    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'SSE_STREAM') {
      return res.status(401).json({ success: false, message: 'Invalid token purpose. General API tokens cannot be used as stream tokens' });
    }

    if (String(decoded.eventId) !== String(req.params.eventId)) {
      return res.status(403).json({ success: false, message: 'Stream token is not valid for this event' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User account is inactive or not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired stream token' });
  }
}

// 1. Issue Short-Lived Scoped Stream Token (Requires standard authenticated session)
r.post('/stream-token', authenticate, allowRoles('ORGANIZER', 'STAFF', 'PLATFORM_ADMIN'), eventAccess, c.generateStreamToken);

// 2. Real-time Live Stream (Authenticates exclusively via short-lived scoped stream token)
r.get('/stream', authenticateStreamToken, allowRoles('ORGANIZER', 'STAFF', 'PLATFORM_ADMIN'), eventAccess, handleEventStream);

// 3. Require standard authentication, organizer/staff/admin role, and event access for remaining intelligence routes
r.use(authenticate, allowRoles('ORGANIZER', 'STAFF', 'PLATFORM_ADMIN'), eventAccess);

r.get('/pulse', c.getEventPulse);
r.post('/copilot', c.askEventCopilot);
r.post('/actions/execute', allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.executeAction);
r.post('/simulation/step', allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.advanceSimulationStep);
r.post('/simulation/reset', allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.resetSimulation);
r.get('/recovery-scenarios', c.getRecoveryScenarios);
r.get('/post-event-report', c.getPostEventReport);

export default r;

