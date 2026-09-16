import * as analyticsService from '../services/analyticsService.js';
import { ok } from '../utils/http.js';

export const getEventAnalytics = async (req, res, next) => {
  try {
    ok(res, await analyticsService.getEventAnalytics(req.params.eventId));
  } catch (e) {
    next(e);
  }
};
