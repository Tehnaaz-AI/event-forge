import { Router } from 'express';
import * as c from '../controllers/announcementController.js';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';

const r = Router({ mergeParams: true });

r.get('/', authenticate, c.getAnnouncements);
r.post('/', authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), eventAccess, c.createAnnouncement);

export default r;
