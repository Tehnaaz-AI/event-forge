import { z } from 'zod';
import * as announcementService from '../services/announcementService.js';
import { ok } from '../utils/http.js';

export const getAnnouncements = async (req, res, next) => {
  try { ok(res, await announcementService.getAnnouncements(req.params.eventId)); } catch (e) { next(e); }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['INFO', 'REMINDER', 'URGENT', 'SCHEDULE_CHANGE']).default('INFO'),
      targetAudience: z.enum(['ALL', 'CONFIRMED', 'WAITLISTED']).default('ALL')
    }).parse(req.body);
    ok(res, await announcementService.createAnnouncement(req.params.eventId, req.user._id, data), 'Announcement sent', 201);
  } catch (e) { next(e); }
};
