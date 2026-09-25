import { Router } from 'express';
import * as c from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const r = Router();

r.post('/register', c.register);
r.post('/login', c.login);
r.get('/me', authenticate, c.getProfile);
r.patch('/profile', authenticate, c.updateProfile);
r.patch('/password', authenticate, c.changePassword);
r.patch('/organization', authenticate, c.updateOrganization);
r.get('/saved-events', authenticate, c.getSavedEvents);
r.post('/saved-events/:eventId', authenticate, c.toggleSavedEvent);
r.delete('/saved-events/:eventId', authenticate, c.removeSavedEvent);

export default r;
