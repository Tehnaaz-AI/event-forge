import { z } from 'zod';
import { Feedback, Event, Registration } from '../models/index.js';
import { ok, fail } from '../utils/http.js';

export const getEventFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ event: req.params.eventId })
      .populate('attendee', 'name avatar')
      .populate('session', 'title')
      .sort({ createdAt: -1 });
    ok(res, feedback);
  } catch (e) {
    next(e);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return fail(res, 'Event not found', 404);

    const now = new Date();
    const hasConcluded = new Date(event.endDate) <= now || event.status === 'COMPLETED';
    if (!hasConcluded) {
      return fail(res, `Conference reviews and attendee ratings unlock only after the event concludes on ${new Date(event.endDate).toLocaleDateString()}.`, 400);
    }

    const isRegistered = await Registration.exists({
      event: req.params.eventId,
      attendee: req.user._id,
      registrationStatus: 'CONFIRMED'
    });
    if (!isRegistered && req.user.role !== 'PLATFORM_ADMIN') {
      return fail(res, 'Only verified registered attendees can submit official conference feedback.', 403);
    }

    const data = z.object({
      session: z.string().optional().nullable(),
      rating: z.number().int().min(1).max(5),
      comments: z.string().optional().default('')
    }).parse(req.body);

    const feedbackPayload = {
      event: req.params.eventId,
      attendee: req.user._id,
      rating: data.rating,
      comments: data.comments
    };

    if (data.session && data.session.trim()) {
      feedbackPayload.session = data.session.trim();
    }

    const feedback = await Feedback.create(feedbackPayload);

    ok(res, feedback, 'Feedback submitted successfully', 201);
  } catch (e) {
    next(e);
  }
};
