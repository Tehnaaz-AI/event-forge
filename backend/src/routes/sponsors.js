import { Router } from 'express';
import * as c from '../controllers/sponsorController.js';
import { authenticate, allowRoles, eventAccess } from '../middleware/auth.js';

const r = Router({ mergeParams: true }); // We'll mount it on /api/events/:eventId/sponsors

r.use(authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), eventAccess);

r.get('/packages', c.getPackages);
r.post('/packages', c.createPackage);
r.delete('/packages/:packageId', c.deletePackage);

r.get('/', c.getSponsors);
r.post('/', c.addSponsor);
r.delete('/:sponsorId', c.removeSponsor);

r.get('/:sponsorId/deliverables', c.getDeliverables);
r.post('/:sponsorId/deliverables', c.createDeliverable);
r.patch('/deliverables/:deliverableId/status', c.updateDeliverableStatus);

export default r;
