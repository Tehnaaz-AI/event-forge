import { Router } from 'express';
import { authenticate, eventAccess } from '../middleware/auth.js';
import * as c from '../controllers/feedbackController.js';

const r = Router({ mergeParams: true });

// Public reading of conference reviews and ratings
r.get('/', c.getEventFeedback);

// Attendee submitting feedback (requires verified attendee authentication)
r.post('/', authenticate, c.submitFeedback);

export default r;
