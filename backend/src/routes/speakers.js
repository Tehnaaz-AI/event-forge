import { Router } from 'express';
import * as c from '../controllers/speakerController.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const r = Router();

// Only organizers (and platform admins) can manage speakers for their org
r.use(authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'));

r.get('/', c.getSpeakers);
r.post('/', c.createSpeaker);
r.put('/:id', c.updateSpeaker);
r.delete('/:id', c.deleteSpeaker);

export default r;
