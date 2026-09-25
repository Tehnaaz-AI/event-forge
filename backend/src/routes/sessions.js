import { Router } from 'express';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { Session, Event } from '../models/index.js';
import { ok, fail } from '../utils/http.js';
import { z } from 'zod';

const router = Router();

// GET /api/sessions/:id
router.get('/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('speakers', 'name email avatar bio');
    if (!session) return fail(res, 'Session not found', 404);
    ok(res, session);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/sessions/:id
router.patch('/:id', authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return fail(res, 'Session not found', 404);

    // Tenant / Organizer verification
    if (req.user.role !== 'PLATFORM_ADMIN') {
      const event = await Event.findById(session.event);
      if (!event) return fail(res, 'Associated event not found', 404);
      
      const isOwner = event.organizer?.toString() === req.user._id.toString();
      const isSameOrg = event.organization && req.user.organization && event.organization.toString() === req.user.organization.toString();
      
      if (!isOwner && !isSameOrg && req.user.role !== 'STAFF') {
        return fail(res, 'Not authorized to modify this session', 403);
      }
    }

    const schema = z.object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      speakers: z.array(z.string()).optional(),
      room: z.string().optional(),
      startTime: z.coerce.date().optional(),
      endTime: z.coerce.date().optional(),
      capacity: z.number().int().positive().optional(),
      status: z.enum(['DRAFT', 'PROPOSED', 'APPROVED', 'PUBLISHED', 'REJECTED']).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    });

    const validated = schema.parse(req.body);

    // If speakers were passed as objects or ids, ensure IDs
    if (validated.speakers) {
      validated.speakers = validated.speakers.map(s => typeof s === 'object' ? s._id : s);
    }

    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: validated },
      { new: true, runValidators: true }
    ).populate('speakers', 'name email avatar bio');

    ok(res, updated, 'Session updated successfully');
  } catch (e) {
    next(e);
  }
});

// PUT /api/sessions/:id
router.put('/:id', authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return fail(res, 'Session not found', 404);

    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('speakers', 'name email avatar bio');

    ok(res, updated, 'Session updated successfully');
  } catch (e) {
    next(e);
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', authenticate, allowRoles('ORGANIZER', 'PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return fail(res, 'Session not found', 404);

    await Session.findByIdAndDelete(req.params.id);
    ok(res, null, 'Session deleted successfully');
  } catch (e) {
    next(e);
  }
});

export default router;
