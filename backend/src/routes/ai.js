import { Router } from 'express';
import * as c from '../controllers/aiController.js';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';

const r = Router({ mergeParams: true });

// Organizer routes
const organizerAuth = [authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), eventAccess];

r.post('/generate-copy', organizerAuth, c.generateMarketingCopy);
r.post('/recommend-sessions', organizerAuth, c.recommendSessions);
r.post('/speech-coach', organizerAuth, c.generateSpeechCoach);
r.post('/test-key', authenticate, c.testAIKey);

// Attendee routes (public/attendee)
r.post('/attendee-recommendations', c.getAttendeeRecommendations);

export default r;
