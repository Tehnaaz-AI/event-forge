import { z } from 'zod';
import * as speakerService from '../services/speakerService.js';
import { ok, fail } from '../utils/http.js';

export const getSpeakers = async (req, res, next) => {
  try {
    const isPlatformAdmin = req.user.role === 'PLATFORM_ADMIN';
    const speakers = await speakerService.getSpeakers(req.user.organization, isPlatformAdmin);
    ok(res, speakers);
  } catch (e) {
    next(e);
  }
};

export const createSpeaker = async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
      password: z.string().optional()
    }).parse(req.body);

    const speaker = await speakerService.createSpeaker(req.user.organization, data);
    ok(res, speaker, 'Speaker created successfully', 201);
  } catch (e) {
    if (e.message === 'Email already registered') {
      return fail(res, e.message, 409);
    }
    next(e);
  }
};

export const updateSpeaker = async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional()
    }).parse(req.body);

    const isPlatformAdmin = req.user.role === 'PLATFORM_ADMIN';
    const speaker = await speakerService.updateSpeaker(req.user.organization, req.params.id, data, isPlatformAdmin);
    ok(res, speaker, 'Speaker updated successfully');
  } catch (e) {
    if (e.message === 'Speaker not found') return fail(res, e.message, 404);
    next(e);
  }
};

export const deleteSpeaker = async (req, res, next) => {
  try {
    const isPlatformAdmin = req.user.role === 'PLATFORM_ADMIN';
    await speakerService.deleteSpeaker(req.user.organization, req.params.id, isPlatformAdmin);
    ok(res, null, 'Speaker deleted successfully');
  } catch (e) {
    if (e.message === 'Speaker not found') return fail(res, e.message, 404);
    next(e);
  }
};
