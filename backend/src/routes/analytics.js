import { Router } from 'express';
import * as c from '../controllers/analyticsController.js';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';

const r = Router({ mergeParams: true });

r.use(authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), eventAccess);

r.get('/', c.getEventAnalytics);

export default r;
