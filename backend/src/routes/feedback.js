import { Router } from 'express';
import { authenticate, eventAccess } from '../middleware/auth.js';
import * as c from '../controllers/feedbackController.js';

const r = Router({ mergeParams: true });

// Organizer viewing all feedback for an event
r.get('/', authenticate, eventAccess, c.getEventFeedback);

// Attendee submitting feedback (they just need to be authenticated, maybe we should check if they registered but for now just auth is fine)
r.post('/', authenticate, c.submitFeedback);

export default r;
