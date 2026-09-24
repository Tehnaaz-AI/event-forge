import { Router } from 'express';
import * as c from '../controllers/eventIntelligenceController.js';
import { handleEventStream } from '../realtime/sseHandler.js';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';

const r = Router({ mergeParams: true });

// Real-time live stream (authenticates via query token or bearer header)
r.get('/stream', (req, res, next) => {
  // Support token in query for EventSource compatibility
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, authenticate, allowRoles('ORGANIZER', 'STAFF', 'PLATFORM_ADMIN'), eventAccess, handleEventStream);

// Require authentication, organizer/staff/admin role, and strict event access
r.use(authenticate, allowRoles('ORGANIZER', 'STAFF', 'PLATFORM_ADMIN'), eventAccess);

r.get('/pulse', c.getEventPulse);
r.post('/copilot', c.askEventCopilot);
r.post('/actions/execute', allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.executeAction);
r.post('/simulation/step', allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.advanceSimulationStep);
r.post('/simulation/reset', allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), c.resetSimulation);
r.get('/recovery-scenarios', c.getRecoveryScenarios);
r.get('/post-event-report', c.getPostEventReport);

export default r;

