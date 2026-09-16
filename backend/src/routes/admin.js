import { Router } from 'express';
import { authenticate, allowRoles } from '../middleware/auth.js';
import * as c from '../controllers/adminController.js';

const r = Router();

// Strict platform administrator protection
r.use(authenticate, allowRoles('PLATFORM_ADMIN'));

// User Management
r.get('/users', c.getUsers);
r.post('/users', c.createUser);
r.patch('/users/:id', c.updateUser);
r.delete('/users/:id', c.deleteUser);

// Platform Events Management
r.get('/events', c.getEvents);
r.delete('/events/:id', c.deleteEvent);

// Platform Analytics & Stats
r.get('/stats', c.getStats);

export default r;
